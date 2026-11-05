# 英作文900 — TOEIC 900 レベルの英作文トレーニング

日本語の文を見て、英文を**組み立てて**答える英作文アプリです。話さずに、タップと入力だけで練習できます。

公開先: https://moko-middo.github.io/todo/

## 遊び方

- 主語・前置詞などのやさしい語は**カードを並べ替え**
- 難しい語（✎ のカード。日本語のヒント付き）は、置くと入力欄になるので**英単語を打ち込む**。時制や -ing などの形も自分で変える
- ひっかけのダミーカードが混ざっている問題もある（例: 仮定法現在の `submit` と `submits`）
- 「ヒント」で入力語の最初の文字と文字数を表示
- 答え合わせで、合っている位置は緑・違う位置は赤。綴りの間違い、模範解答（🔊 で読み上げ）、文法の解説を表示
- 間違えた問題だけを復習できる。記録タブで文法項目ごとの進み具合を確認

記録はブラウザ内（localStorage）だけに保存されます。

## 問題

`src/data/problems.ts` に 45 問。文法項目は、仮定法・倒置、仮定法現在、分詞構文・分詞、関係詞・名詞節、使役・語法、接続詞・前置詞、時制、比較、受動態・不定詞・動名詞。

問題の書き方:

```ts
{
  id: 'should-inversion',
  tag: '仮定法・倒置',
  ja: '払い戻しの手続きについてご質問がございましたら、経理部までご連絡ください。',
  en: 'Should you have any questions about the {reimbursement|払い戻し} process, please contact the {accounting|経理} department.',
  alt: ['please contact the accounting department should you have any questions about the reimbursement process'],
  distractors: ['would'],
  note: '「Should + 主語 + 動詞の原形」は If you should have ... の倒置。',
}
```

- `en` はスペース区切りの 1 語が 1 枚のカード。`as_soon_as` のように `_` でつなぐと 1 枚にまとまる
- `{単語|ヒント}` が入力式。複数の綴りを認めるときは `{fulfill/fulfil|履行する}`
- `alt` はほかにも正しい語順（小文字・句読点なし）
- `distractors` はダミーのカード。**正しい英文が作れてしまう語は入れない**

## 開発

```bash
npm install
npm run dev
npm run build
```
