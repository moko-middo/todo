#!/usr/bin/env python3
"""
Command Modern Operations チュートリアル自動解説スクリプト

使い方:
  python tutorial_explainer.py                      # デフォルトURL使用
  python tutorial_explainer.py tutorial.txt         # ローカルファイル使用
  python tutorial_explainer.py --start 5 --end 10   # 特定範囲のみ処理

環境変数:
  GEMINI_API_KEY  Gemini APIキー（必須）
"""

import os
import sys
import re
import time
import argparse
from pathlib import Path

try:
    import requests
    from bs4 import BeautifulSoup
except ImportError:
    print("依存パッケージが見つかりません。以下を実行してください:")
    print("  pip install -r requirements.txt")
    sys.exit(1)


DEFAULT_URL = "https://share.google/oq7rlgFm5qaax3Hm6"
OUTPUT_DIR = Path("output/tutorials")
GEMINI_MODEL = "gemini-2.0-flash"
GEMINI_API_ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"
API_DELAY_SEC = 1.5  # API制限を避けるための待機時間


def fetch_google_doc(url: str) -> str:
    """Google DocのURLからテキストを取得する。share.google短縮URLに対応。"""
    session = requests.Session()
    session.headers.update({
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
    })

    # リダイレクトを追跡して最終URLを取得
    response = session.get(url, allow_redirects=True, timeout=30)
    response.raise_for_status()
    final_url = response.url

    # Google DocsのドキュメントIDを抽出してエクスポートURLを構築
    doc_id_match = re.search(r"/document/d/([a-zA-Z0-9_-]+)", final_url)
    if doc_id_match:
        doc_id = doc_id_match.group(1)
        export_url = f"https://docs.google.com/document/d/{doc_id}/export?format=txt"
        export_response = session.get(export_url, timeout=30)
        if export_response.status_code == 200:
            return export_response.text
        # テキストエクスポート失敗時はHTMLから抽出
        html_url = f"https://docs.google.com/document/d/{doc_id}/export?format=html"
        html_response = session.get(html_url, timeout=30)
        if html_response.status_code == 200:
            soup = BeautifulSoup(html_response.content, "html.parser")
            return soup.get_text("\n", strip=True)

    # Google Docs以外のページはHTMLから抽出
    soup = BeautifulSoup(response.content, "html.parser")
    for tag in soup(["script", "style", "nav", "footer", "header"]):
        tag.decompose()
    return soup.get_text("\n", strip=True)


def parse_tutorial_items(content: str) -> list[dict]:
    """テキストをチュートリアル項目に分割する。見出し行（#/##/###）で区切る。"""
    items = []
    current_title = None
    current_lines: list[str] = []

    for line in content.splitlines():
        heading = re.match(r"^(#{1,3})\s+(.+)$", line)
        if heading:
            if current_title and "".join(current_lines).strip():
                items.append({
                    "title": current_title,
                    "content": "\n".join(current_lines).strip(),
                })
            current_title = heading.group(2).strip()
            current_lines = []
        else:
            if current_title:
                current_lines.append(line)

    # 最後の項目
    if current_title and "".join(current_lines).strip():
        items.append({
            "title": current_title,
            "content": "\n".join(current_lines).strip(),
        })

    return items


def explain_with_gemini(item: dict, api_key: str) -> str:
    """Gemini REST APIでチュートリアル項目の解説を生成する。"""
    prompt = f"""以下はPCゲーム「Command Modern Operations（コマンド モダン オペレーションズ）」のチュートリアル項目です。

日本語で、ゲーム初心者にも分かりやすく詳しく解説してください。
以下の点を意識してください：
- ゲーム内での具体的な操作手順
- この機能・概念がゲームでどう役立つか
- 関連する軍事・戦術的な背景知識（あれば）
- 初心者が混乱しやすいポイントへの補足

出力はMarkdown形式でお願いします。

---
## 項目タイトル
{item['title']}

## 内容
{item['content']}
"""
    url = GEMINI_API_ENDPOINT.format(model=GEMINI_MODEL)
    payload = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {"temperature": 0.7, "maxOutputTokens": 2048},
    }
    response = requests.post(
        url,
        params={"key": api_key},
        json=payload,
        timeout=60,
    )
    response.raise_for_status()
    data = response.json()
    return data["candidates"][0]["content"]["parts"][0]["text"]


def save_markdown(item: dict, explanation: str, index: int, output_dir: Path) -> Path:
    """解説をMarkdownファイルに保存する。"""
    output_dir.mkdir(parents=True, exist_ok=True)

    # ファイル名用にタイトルをサニタイズ
    safe_title = re.sub(r'[\\/:*?"<>|]', "", item["title"])
    safe_title = re.sub(r"\s+", "_", safe_title.strip())[:60]

    filepath = output_dir / f"{index:03d}_{safe_title}.md"

    md_content = f"""# {item['title']}

> **項目 {index}**

## 原文

{item['content']}

---

## 解説（Gemini）

{explanation}
"""
    filepath.write_text(md_content, encoding="utf-8")
    return filepath


def load_content(source: str) -> str:
    """URLまたはローカルファイルからコンテンツを読み込む。"""
    if source.startswith("http"):
        print(f"URLから取得中: {source}")
        return fetch_google_doc(source)
    else:
        path = Path(source)
        if not path.exists():
            print(f"エラー: ファイルが見つかりません: {source}")
            sys.exit(1)
        print(f"ファイルから読み込み中: {source}")
        return path.read_text(encoding="utf-8")


def main():
    parser = argparse.ArgumentParser(
        description="Command Modern Operations チュートリアル自動解説スクリプト",
        formatter_class=argparse.RawDescriptionHelpFormatter,
    )
    parser.add_argument(
        "source",
        nargs="?",
        default=DEFAULT_URL,
        help=f"Google DocのURLまたはテキストファイルのパス (デフォルト: {DEFAULT_URL})",
    )
    parser.add_argument(
        "--output", "-o",
        default=str(OUTPUT_DIR),
        help=f"出力ディレクトリ (デフォルト: {OUTPUT_DIR})",
    )
    parser.add_argument(
        "--api-key",
        help="Gemini APIキー (環境変数 GEMINI_API_KEY でも設定可)",
    )
    parser.add_argument(
        "--start",
        type=int,
        default=1,
        help="処理を開始する項目番号 (デフォルト: 1)",
    )
    parser.add_argument(
        "--end",
        type=int,
        help="処理を終了する項目番号 (指定なし = 全項目)",
    )
    parser.add_argument(
        "--list",
        action="store_true",
        help="項目一覧を表示して終了（解説は生成しない）",
    )
    args = parser.parse_args()

    # APIキー確認
    api_key = args.api_key or os.environ.get("GEMINI_API_KEY")
    if not api_key and not args.list:
        print("エラー: Gemini APIキーが必要です。")
        print("  export GEMINI_API_KEY='your-api-key'")
        print("  または --api-key オプションで指定してください。")
        print("  APIキーの取得: https://aistudio.google.com/app/apikey")
        sys.exit(1)

    # コンテンツ取得
    try:
        content = load_content(args.source)
    except Exception as e:
        print(f"コンテンツの取得に失敗しました: {e}")
        print()
        print("Google Docが非公開の場合は、以下の手順でファイルを用意してください:")
        print("  1. Google Docを開く")
        print("  2. ファイル > ダウンロード > プレーンテキスト (.txt) を選択")
        print("  3. ダウンロードしたファイルを scripts/ ディレクトリに置く")
        print("  4. python tutorial_explainer.py tutorial.txt を実行")
        sys.exit(1)

    print(f"取得完了（{len(content):,} 文字）")

    # 項目解析
    items = parse_tutorial_items(content)
    if not items:
        print("項目が見つかりませんでした。")
        print("ヒント: コンテンツが '# タイトル' 形式の見出しで構成されているか確認してください。")
        sys.exit(1)

    print(f"項目数: {len(items)}")

    # --list モード: 項目一覧を表示して終了
    if args.list:
        for i, item in enumerate(items, 1):
            print(f"  {i:03d}: {item['title']}")
        return

    # 処理範囲の決定
    start_idx = max(0, args.start - 1)
    end_idx = args.end if args.end else len(items)
    target_items = items[start_idx:end_idx]

    if not target_items:
        print(f"指定範囲に項目がありません: {args.start}〜{args.end}")
        sys.exit(1)

    output_dir = Path(args.output)
    print(f"\n{len(target_items)} 項目を処理します → {output_dir}/\n")

    success_count = 0
    for i, item in enumerate(target_items, start=args.start):
        print(f"[{i:03d}/{len(items):03d}] {item['title']}")
        try:
            explanation = explain_with_gemini(item, api_key)
            saved_path = save_markdown(item, explanation, i, output_dir)
            print(f"        → 保存: {saved_path}")
            success_count += 1

            # API制限を避けるため待機（最後の項目は不要）
            if i < end_idx:
                time.sleep(API_DELAY_SEC)

        except Exception as e:
            print(f"        → エラー: {e}")
            continue

    print(f"\n完了: {success_count}/{len(target_items)} 項目を保存しました")
    print(f"出力先: {output_dir.resolve()}/")


if __name__ == "__main__":
    main()
