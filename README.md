# TechTadoku — 規格と論文で英語多読

RFC・ISO・W3C などの**技術規格**や**学術論文**を教材にした英語多読アプリです。
React + TypeScript + Vite で作られた静的サイトなので、GitHub Pages でそのまま公開できます。

## 機能

- **ライブラリ** — 文書を「規格／論文」とレベル（Lv1〜5）で絞り込み。レベルは Flesch Reading Ease から自動判定
- **リーダー** — 「読み始める」〜「読み終えた」で時間を測り、WPM を表示して累計語数に加算
- **タップ辞書** — 本文の単語をタップすると、規格・論文頻出語の簡易辞書（MUST / SHALL / normative / ablation など）で意味を表示。未登録の語はメモ付きで登録でき、Weblio へのリンクも表示
- **単語帳** — 登録した語を、出てきた例文と一緒に保存
- **取り込む** — RFC や論文の本文を貼り付けて自分の教材に。PDF からコピーしたときの行中改行やハイフン区切りは自動でつなげる
- **記録** — 累計語数・平均 WPM・目標（10万〜300万語）の進捗・履歴

データはすべてブラウザの localStorage に保存され、外部には送信されません。

## 論文・規格 PDF を追加する

GitHub の画面から `content/papers/`（論文）か `content/standards/`（規格）に PDF をアップロードして master にコミットするだけです。
GitHub Actions のビルド時に本文が抽出され、ライブラリに並びます（詳しくは [content/README.md](content/README.md)）。

> **注意:** このリポジトリは公開設定です。置いた PDF とその本文は誰でも見られる状態で再配布されます。
> CC BY などで再配布が許されている論文・規格だけを置くか、リポジトリを非公開にしてください（非公開リポジトリの GitHub Pages には有料プランが必要です）。

ローカルで試すときは `npm run extract` で抽出だけ実行できます。

## 教材について

付属のサンプル 6 本は、規格・論文の**文体を練習するために書き下ろした架空の文書**で、実在の文書の引用ではありません。
本物の文書は「取り込む」画面から追加してください。入手先の例:

| 入手先 | 内容 |
| --- | --- |
| [RFC Editor](https://www.rfc-editor.org/) | インターネット技術の規格 |
| [W3C Standards](https://www.w3.org/TR/) | Web 標準 |
| [NIST Publications](https://csrc.nist.gov/publications) | 米国政府の技術文書 |
| [arXiv](https://arxiv.org/) | 論文プレプリント（論文ごとにライセンスを確認） |

> 取り込んだ文書は自分のブラウザ内だけに保存されます。リポジトリの `src/data/samples.ts` に追加して公開する場合は、各文書のライセンス（CC BY など）を確認してください。

## 開発

```bash
npm install
npm run dev      # 開発サーバー
npm run build    # dist/ に本番ビルド
```

教材を増やすには `src/data/samples.ts` の `SAMPLES` に追加します。辞書は `src/data/glossary.ts` です。
