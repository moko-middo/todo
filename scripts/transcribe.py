"""content/podcasts/ の音声を文字起こし・和訳して、同名の .json に書き出す。

GitHub Actions から実行される（.github/workflows/deploy.yml）。
- 文字起こし: faster-whisper（単語ごとのタイミング付き）。モデルは環境変数 WHISPER_MODEL（既定 small.en）
- 和訳: 環境変数 GEMINI_API_KEY があれば Gemini API で 1 文ずつ訳す。なければ訳なしで書き出し、
  あとからキーを設定すると次回の実行で訳だけを追加する
- WAV / FLAC は容量削減のため MP3 に変換し、元ファイルは削除する

使い方:
  python3 scripts/transcribe.py           # 未処理の音声をすべて処理
  python3 scripts/transcribe.py --check   # 処理待ちの件数だけを出力
"""

from __future__ import annotations

import json
import os
import re
import shutil
import subprocess
import sys
import time
import urllib.error
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PODCAST_DIR = ROOT / "content" / "podcasts"
AUDIO_EXT = {".mp3", ".m4a", ".aac", ".ogg", ".opus", ".webm", ".wav", ".flac"}
CONVERT_EXT = {".wav", ".flac"}

WHISPER_MODEL = os.environ.get("WHISPER_MODEL") or "small.en"
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "").strip()
GEMINI_MODEL = os.environ.get("GEMINI_MODEL") or "gemini-flash-latest"
TRANSLATE_BATCH = 40


def ffmpeg() -> str:
    """システムの ffmpeg、なければ imageio-ffmpeg 同梱のもの（GitHub Actions のランナーには ffmpeg がない）"""
    if path := shutil.which("ffmpeg"):
        return path
    import imageio_ffmpeg

    return imageio_ffmpeg.get_ffmpeg_exe()

# 文末とみなさない略語
ABBREV = re.compile(r"^(?:mr|mrs|ms|dr|prof|st|vs|etc|e\.g|i\.e|u\.s|no)\.$", re.I)
SENTENCE_END = re.compile(r"[.?!][\"'”’)\]]*$")


def audio_files() -> list[Path]:
    return sorted(p for p in PODCAST_DIR.iterdir() if p.suffix.lower() in AUDIO_EXT) if PODCAST_DIR.exists() else []


def transcript_path(audio: Path) -> Path:
    return audio.with_suffix(".json")


def load(path: Path) -> dict | None:
    return json.loads(path.read_text("utf-8")) if path.exists() else None


def save(path: Path, data: dict) -> None:
    path.write_text(json.dumps(data, ensure_ascii=False, indent=1) + "\n", "utf-8")


def pending() -> list[Path]:
    out = []
    for audio in audio_files():
        t = load(transcript_path(audio))
        if t is None or (GEMINI_API_KEY and any("ja" not in s for s in t["sentences"])):
            out.append(audio)
    return out


# ── 音声 ──────────────────────────────────────────


def convert_to_mp3(audio: Path) -> Path:
    mp3 = audio.with_suffix(".mp3")
    if mp3.exists():
        sys.exit(f"{mp3.name} が既にあるため {audio.name} を変換できません。どちらかの名前を変えてください")
    subprocess.run(
        [ffmpeg(), "-hide_banner", "-loglevel", "error", "-i", str(audio), "-ac", "1", "-b:a", "96k", str(mp3)],
        check=True,
    )
    audio.unlink()
    print(f"  {audio.name} -> {mp3.name}")
    return mp3


# ── 文字起こし ────────────────────────────────────

_model = None


def whisper():
    global _model
    if _model is None:
        from faster_whisper import WhisperModel

        print(f"  loading whisper model {WHISPER_MODEL} ...")
        _model = WhisperModel(WHISPER_MODEL, device="cpu", compute_type="int8")
    return _model


def decode(audio: Path):
    """ffmpeg で 16kHz モノラルの波形にする（faster-whisper 内蔵の PyAV 読み込みは版の相性で壊れやすいため使わない）"""
    import numpy as np

    pcm = subprocess.run(
        [ffmpeg(), "-hide_banner", "-loglevel", "error", "-i", str(audio), "-ac", "1", "-ar", "16000", "-f", "f32le", "-"],
        check=True,
        capture_output=True,
    ).stdout
    return np.frombuffer(pcm, dtype=np.float32)


def transcribe(audio: Path) -> tuple[list[tuple[float, float, str]], float]:
    segments, info = whisper().transcribe(decode(audio), language="en", word_timestamps=True, beam_size=5)
    words = [(w.start, w.end, w.word) for seg in segments for w in (seg.words or [])]
    return words, info.duration


def to_sentences(words: list[tuple[float, float, str]], max_words: int = 40) -> list[dict]:
    """単語列を文に分ける。文末記号・長い無音・長すぎる文（読点）で区切る"""
    sentences: list[dict] = []
    cur: list[tuple[float, float, str]] = []

    def flush() -> None:
        if cur:
            sentences.append(
                {
                    "start": round(cur[0][0], 2),
                    "end": round(cur[-1][1], 2),
                    "text": "".join(w for _, _, w in cur).strip(),
                    "words": [[round(s, 2), round(e, 2), w] for s, e, w in cur],
                }
            )
            cur.clear()

    for i, (s, e, w) in enumerate(words):
        cur.append((s, e, w))
        token = w.strip()
        nxt = words[i + 1] if i + 1 < len(words) else None
        ends = bool(SENTENCE_END.search(token)) and not ABBREV.match(token)
        long_pause = nxt is not None and nxt[0] - e > 1.5
        too_long = len(cur) >= max_words and token.endswith((",", ";", ":"))
        if ends or long_pause or too_long or len(cur) >= max_words * 2:
            flush()
    flush()
    return sentences


# ── Gemini（和訳・タイトル） ────────────────────────


def gemini(prompt: str, as_json: bool) -> str:
    body = {"contents": [{"parts": [{"text": prompt}]}]}
    if as_json:
        body["generationConfig"] = {"responseMimeType": "application/json"}
    req = urllib.request.Request(
        f"https://generativelanguage.googleapis.com/v1beta/models/{GEMINI_MODEL}:generateContent",
        data=json.dumps(body).encode(),
        headers={"Content-Type": "application/json", "x-goog-api-key": GEMINI_API_KEY},
    )
    for attempt in range(5):
        try:
            with urllib.request.urlopen(req, timeout=120) as res:
                data = json.load(res)
            return data["candidates"][0]["content"]["parts"][0]["text"]
        except urllib.error.HTTPError as e:
            # 429（無料枠のレート制限）と 5xx は待って再試行
            if e.code in (429, 500, 502, 503, 504) and attempt < 4:
                wait = 20 * (attempt + 1)
                print(f"  Gemini API {e.code}, {wait}s 待って再試行")
                time.sleep(wait)
                continue
            raise RuntimeError(f"Gemini API error {e.code}: {e.read().decode()[:500]}") from None
    raise RuntimeError("unreachable")


def translate(sentences: list[dict]) -> None:
    todo = [i for i, s in enumerate(sentences) if "ja" not in s]
    for b in range(0, len(todo), TRANSLATE_BATCH):
        idx = todo[b : b + TRANSLATE_BATCH]
        context = " ".join(sentences[i]["text"] for i in range(max(0, idx[0] - 3), idx[0]))
        items = [sentences[i]["text"] for i in idx]
        prompt = (
            "以下は英語ポッドキャストを文ごとに区切った文字起こしです。英語学習者向けに、各文を自然な日本語に訳してください。\n"
            "音声認識の誤りがありそうな箇所は文脈から推測して訳してください。\n"
            f"入力と同じ順番・同じ件数（{len(items)} 件）の、日本語訳の文字列だけからなる JSON 配列で答えてください。\n\n"
            + (f"直前の文脈（訳さない）: {context}\n\n" if context else "")
            + json.dumps(items, ensure_ascii=False)
        )
        for attempt in range(3):
            result = json.loads(gemini(prompt, as_json=True))
            if isinstance(result, list) and len(result) == len(items) and all(isinstance(r, str) for r in result):
                break
            print(f"  訳の件数が合わないため再試行 ({len(result) if isinstance(result, list) else '?'} / {len(items)})")
        else:
            raise RuntimeError("Gemini の訳を取得できませんでした")
        for i, ja in zip(idx, result):
            sentences[i]["ja"] = ja.strip()
        print(f"  translated {min(b + TRANSLATE_BATCH, len(todo))}/{len(todo)}")


def make_title(sentences: list[dict]) -> str | None:
    head = " ".join(s["text"] for s in sentences[:40])
    prompt = (
        "Give a short, catchy English title (at most 8 words) for the podcast episode that starts like this. "
        "Answer with the title only, without quotes.\n\n" + head
    )
    title = gemini(prompt, as_json=False).strip().strip('"').strip()
    return title or None


# ── main ─────────────────────────────────────────


def default_title(audio: Path) -> str:
    return re.sub(r"[-_]+", " ", audio.stem).strip()


def process(audio: Path) -> None:
    print(f"[podcast] {audio.name}")
    if audio.suffix.lower() in CONVERT_EXT:
        audio = convert_to_mp3(audio)
    path = transcript_path(audio)
    data = load(path)

    if data is None:
        started = time.time()
        words, duration = transcribe(audio)
        data = {
            "title": default_title(audio),
            "audio": audio.name,
            "duration": round(duration, 2),
            "createdAt": datetime.now(timezone.utc).isoformat(timespec="seconds"),
            "whisperModel": WHISPER_MODEL,
            "sentences": to_sentences(words),
        }
        save(path, data)
        print(f"  {len(words)} words, {len(data['sentences'])} sentences ({time.time() - started:.0f}s)")

    if GEMINI_API_KEY:
        if data["title"] == default_title(audio):
            try:
                data["title"] = make_title(data["sentences"]) or data["title"]
            except RuntimeError as e:
                print(f"  タイトル生成に失敗: {e}")
        try:
            translate(data["sentences"])
        finally:
            save(path, data)  # 途中で失敗しても訳せた分は残す（残りは次回）


def main() -> None:
    todo = pending()
    if "--check" in sys.argv:
        print(len(todo))
        return
    if not todo:
        print("[podcast] 処理待ちの音声はありません")
        return
    if not GEMINI_API_KEY:
        print("[podcast] GEMINI_API_KEY が未設定のため、和訳なしで文字起こしだけ行います")
    failed = []
    for audio in todo:
        try:
            process(audio)
        except Exception as e:  # 1 本の失敗で他のエピソードを止めない
            print(f"  失敗: {e}")
            failed.append(audio.name)
    if failed:
        sys.exit(f"[podcast] 失敗: {', '.join(failed)}")


if __name__ == "__main__":
    main()
