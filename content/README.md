# 教材 PDF の置き場所

| フォルダ | 種類 |
| --- | --- |
| `papers/` | 論文 |
| `standards/` | 規格 |

PDF をアップロードして master に反映すると、GitHub Actions のビルド時に本文が抽出され、アプリのライブラリに追加されます。

- 長い文書は約 1,000 語ごとの回（1/5, 2/5 …）に分けられます
- References / Bibliography / Acknowledgments 以降、ページ番号、毎ページ同じヘッダー・フッター、表や数式の行は除かれます
- タイトルは 1 ページ目のいちばん大きな文字から自動で付きます。変えたいときは、PDF と同じ名前の `.json` を置きます

```json
{ "title": "Attention Is All You Need", "source": "Vaswani et al., NeurIPS 2017", "url": "https://arxiv.org/abs/1706.03762" }
```

スキャン画像だけの PDF（文字情報のないもの）は読み取れません。
