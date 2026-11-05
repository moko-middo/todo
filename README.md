# Podcast Tadoku — 英語ポッドキャストで多聴・多読

自分で用意した英語ポッドキャスト（Gemini で作ったものなど）を、**文字起こしを見ながら聞ける**アプリです。
音声を GitHub にアップロードするだけで、GitHub Actions が文字起こし・和訳をして GitHub Pages に公開します。

公開先: https://moko-middo.github.io/todo/

## 機能

- **ハイライト** — いま話している文と単語をハイライト
- **自動スクロール** — 話している文が常に画面の中央に来る（手でスクロールすると 5 秒止まる）
- **和訳** — 文をタップするとその文の日本語訳。「全文和訳」で全部表示
- **▶ この文から再生** — 文の左の ▶ で、その文に飛んで再生
- **🔁 文リピート** — 今の文をくり返し再生（シャドーイング用）
- **英文を隠す** — 聞き取り練習用。話し終わった単語だけが見える
- **再生速度** 0.75〜1.5x、**5 秒戻る/進む**、続きから再生、ロック画面・イヤホンでの操作
- **記録** — 最後まで聞いたエピソードの語数を累計（目標 10 万〜300 万語）

記録や再生位置はブラウザ内（localStorage）だけに保存されます。

## エピソードを追加する

1. GitHub のリポジトリ画面で `content/podcasts/` を開き、**Add file → Upload files** で音声をアップロードして master にコミット
   （mp3 / m4a / aac / ogg / opus / webm / wav / flac。wav と flac は自動で mp3 に変換）
2. GitHub Actions が文字起こし（Whisper）して、同じ名前の `.json` をコミットし直す（10 分の音声で数分）
3. そのままサイトがビルドされ、エピソード一覧に並ぶ

進み具合はリポジトリの **Actions** タブで見られます。

### 和訳を付ける（Gemini API キー）

和訳とタイトルの自動生成には Gemini API キーが必要です（無料枠で足ります）。

1. [Google AI Studio](https://aistudio.google.com/apikey) で API キーを作る
2. リポジトリの **Settings → Secrets and variables → Actions → New repository secret** で、
   名前 `GEMINI_API_KEY`、値にキーを登録

キーがない間は文字起こしだけ行い、和訳の代わりに「Google 翻訳で見る」リンクを出します。
あとからキーを登録すると、次に Actions が動いたとき（Actions タブから **Run workflow** でも可）に訳だけが追加されます。

### 文字起こしを直す

`content/podcasts/<名前>.json` を GitHub 上で編集できます。

- `title` — 一覧に出るタイトル
- `sentences[].ja` — 和訳
- `sentences[].text` / `words` — 英文（`words` は `[開始秒, 終了秒, 単語]`）

Whisper のモデルは既定で `small.en`。精度を上げたいときは **Settings → Secrets and variables → Actions → Variables** で
`WHISPER_MODEL` を `medium.en` などにします（処理時間は長くなります）。

### 注意

- このリポジトリは公開設定なので、アップロードした音声と文字起こしは誰でも見られます
- GitHub のファイル上限は 1 つ 100MB、Pages のサイト全体は 1GB までです（96kbps の mp3 で 15 分 ≒ 11MB）

## 開発

```bash
npm install
npm run dev      # content/podcasts/ を public/podcasts/ に集めて開発サーバー起動
npm run build
```

文字起こしをローカルで試す場合（ffmpeg が必要）:

```bash
pip install -r scripts/requirements.txt
GEMINI_API_KEY=... python3 scripts/transcribe.py
```
