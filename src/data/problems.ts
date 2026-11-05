import type { ProblemSource } from '../types'

/**
 * TOEIC 900 レベルの英作文問題。
 *
 * en の書き方:
 * - 半角スペース区切りの 1 語が 1 枚の並べ替えカード
 * - `as_soon_as` のように `_` でつなぐと複数語で 1 枚
 * - `{単語|ヒント}` は入力式（難しい単語）。正解が複数あるときは `{fulfill/fulfil|...}`
 * - 語尾の句読点は表示用で、採点では無視する
 *
 * alt: ほかにも正しい語順（小文字・句読点なし）
 * distractors: 正解には使わないダミーのカード（文法のひっかけ）
 */
export const PROBLEMS: ProblemSource[] = [
  // ── 仮定法・倒置 ──
  {
    id: 'should-inversion',
    tag: '仮定法・倒置',
    ja: '払い戻しの手続きについてご質問がございましたら、経理部までご連絡ください。',
    en: 'Should you have any questions about the {reimbursement|払い戻し} process, please contact the {accounting|経理} department.',
    distractors: ['would'],
    alt: ['please contact the accounting department should you have any questions about the reimbursement process'],
    note: '「Should + 主語 + 動詞の原形」は If you should have ... の if を省いた倒置。ビジネスメールの定番表現。',
  },
  {
    id: 'had-inversion',
    tag: '仮定法・倒置',
    ja: '出荷品が予定どおりに届いていれば、注文に応じることができたでしょう。',
    en: 'Had the shipment arrived on schedule, we would have been able to {fulfill/fulfil|（注文を）履行する} the order.',
    distractors: ['will'],
    alt: ['we would have been able to fulfill the order had the shipment arrived on schedule'],
    note: '「Had + 主語 + 過去分詞」は If the shipment had arrived ... の倒置（仮定法過去完了）。主節は would have + 過去分詞。',
  },
  {
    id: 'not-only-inversion',
    tag: '仮定法・倒置',
    ja: '新しいシステムはコストを削減しただけでなく、承認プロセスも合理化した。',
    en: 'Not only did the new system reduce costs, but it also {streamlined|合理化する} the {approval|承認} process.',
    distractors: ['reduced'],
    note: '否定語 Not only が文頭に来ると、後ろは疑問文の語順（did + 主語 + 原形）になる。',
  },
  {
    id: 'no-sooner',
    tag: '仮定法・倒置',
    ja: 'その製品が発売されるやいなや、注文が殺到し始めた。',
    en: 'No sooner had the product been {launched|発売する} than orders began to {pour|（大量に）流れ込む} in.',
    distractors: ['when'],
    note: '「No sooner had S + 過去分詞 than ...」で「〜するやいなや…」。than と組むのがポイント（when ではない）。',
  },
  {
    id: 'not-until',
    tag: '仮定法・倒置',
    ja: '監査になって初めて、その食い違いが発見された。',
    en: 'It was not until the {audit|監査} that the {discrepancy|食い違い、不一致} was discovered.',
    note: '「It was not until A that B」で「A になって初めて B した」。強調構文の形をとる。',
  },
  {
    id: 'however-concession',
    tag: '仮定法・倒置',
    ja: '応募者がどれほど優秀でも、全員が経歴調査を受けなければならない。',
    en: 'However {qualified|適任の、資格のある} the applicants may be, each of them must {undergo|（検査などを）受ける} a background check.',
    distractors: ['very'],
    note: '「However + 形容詞 + S + may be」で「S がどれほど〜でも」。形容詞を however の直後に置く。',
  },

  // ── 仮定法現在 ──
  {
    id: 'insist-that',
    tag: '仮定法現在',
    ja: '委員会は、すべての応募者が推薦状を提出するよう強く求めた。',
    en: 'The committee {insisted|強く求める} that every {applicant|応募者} submit a letter of {recommendation|推薦}.',
    distractors: ['submits', 'submitted'],
    note: 'insist / require / recommend / request that ... の that 節では、主語や時制にかかわらず動詞は原形（submit）。',
  },
  {
    id: 'essential-that',
    tag: '仮定法現在',
    ja: '方針の変更は、全従業員に事前に知らせることが不可欠だ。',
    en: 'It is {essential|不可欠な} that all employees be {notified|通知する} of the policy change in advance.',
    distractors: ['are'],
    note: 'essential / imperative / vital that ... の that 節も動詞は原形。受け身なら be + 過去分詞。',
  },

  // ── 分詞構文・分詞 ──
  {
    id: 'having-pp',
    tag: '分詞構文・分詞',
    ja: '提案書を検討したうえで、取締役会はその事業に追加の資金を割り当てることにした。',
    en: 'Having reviewed the {proposal|提案書}, the board decided to {allocate|割り当てる} additional funds to the project.',
    note: '「Having + 過去分詞」は主節より前に終わった動作を表す分詞構文。',
  },
  {
    id: 'located-adjacent',
    tag: '分詞構文・分詞',
    ja: 'コンベンションセンターに隣接しているため、そのホテルは出張者に人気がある。',
    en: 'Located {adjacent|隣接した} to the convention center, the hotel is popular among business travelers.',
    distractors: ['locating'],
    alt: ['the hotel located adjacent to the convention center is popular among business travelers'],
    note: '受け身の分詞構文（Being を省略した Located ...）。adjacent to 〜「〜に隣接した」は TOEIC 頻出。',
  },
  {
    id: 'with-pp',
    tag: '分詞構文・分詞',
    ja: 'いくつかの問題が未解決のまま、会議は終わった。',
    en: 'The meeting ended with several issues left {unresolved|未解決の}.',
    distractors: ['leaving'],
    note: '「with + 名詞 + 過去分詞」で「〜が…された状態で」（付帯状況）。',
  },
  {
    id: 'each-submitted',
    tag: '分詞構文・分詞',
    ja: '先週提出された提案は、それぞれ現在審査中です。',
    en: 'Each of the {proposals|提案} {submitted|提出する} last week is currently under review.',
    distractors: ['are'],
    note: '「Each of the + 複数名詞」は単数扱い（is）。submitted last week は後ろから名詞を修飾する過去分詞。',
  },
  {
    id: 'disappointing',
    tag: '分詞構文・分詞',
    ja: 'アンケートの結果は、マーケティングチームにとって期待外れだった。',
    en: 'The results of the {survey|調査、アンケート} were {disappointing|期待外れの} to the marketing team.',
    note: '人をがっかりさせるもの → disappointing、がっかりした人 → disappointed。',
  },

  // ── 関係詞・名詞節 ──
  {
    id: 'whose-expertise',
    tag: '関係詞・名詞節',
    ja: '歴史的建造物の改修を専門とする請負業者を探しています。',
    en: 'We are looking for a {contractor|請負業者} whose {expertise|専門知識} lies in {renovating|改修する} historic buildings.',
    distractors: ['who'],
    note: '「whose + 名詞」で所有を表す関係代名詞。expertise lies in 〜ing「〜を専門としている」。',
  },
  {
    id: 'by-which',
    tag: '関係詞・名詞節',
    ja: 'これが、すべての提案を評価する基準です。',
    en: 'This is the {criterion|基準} by which all proposals will be {evaluated|評価する}.',
    distractors: ['what'],
    note: '「前置詞 + which」。be evaluated by the criterion の by が which の前に出た形。criterion の複数形は criteria。',
  },
  {
    id: 'what-impressed',
    tag: '関係詞・名詞節',
    ja: '顧客が最も感心したのは、問い合わせへの私たちの迅速な対応だった。',
    en: 'What {impressed|感心させる} the clients most was our {prompt|迅速な} response to their {inquiries|問い合わせ}.',
    distractors: ['that'],
    note: '関係代名詞 what は「〜すること・もの」。What ... most was 〜 で「最も…なのは〜だった」。',
  },
  {
    id: 'venue-where',
    tag: '関係詞・名詞節',
    ja: '会議は、出席者が公共交通機関を利用しやすい会場で開かれる。',
    en: 'The conference will be held at a {venue|会場} where {attendees|出席者} can easily access public transportation.',
    distractors: ['which'],
    note: '後ろが完全な文（attendees can access ...）なので関係副詞 where。which なら後ろに欠けた要素が必要。',
  },
  {
    id: 'whether-uncertain',
    tag: '関係詞・名詞節',
    ja: '年内に合併が完了するかどうかは、依然として不透明だ。',
    en: 'It remains {uncertain|不確かな} whether the {merger|合併} will be completed by the end of the year.',
    note: '「It remains + 形容詞 + whether 節」。形式主語 it が受ける名詞節で、「〜かどうか」を表す。',
  },

  // ── 使役・語法 ──
  {
    id: 'had-inspected',
    tag: '使役・語法',
    ja: '設置の前に、機器を点検してもらった。',
    en: 'We had the {equipment|機器} {inspected|点検する} before the {installation|設置}.',
    distractors: ['inspect'],
    note: '「have + 物 + 過去分詞」で「物を〜してもらう」。物は点検される側なので過去分詞。',
  },
  {
    id: 'got-vendor-to',
    tag: '使役・語法',
    ja: 'ようやく納入業者に値下げしてもらった。',
    en: 'We finally got the {vendor|納入業者、販売業者} to lower its prices.',
    distractors: ['made'],
    alt: ['finally we got the vendor to lower its prices'],
    note: '「get + 人 + to do」で「（説得して）人に〜してもらう」。make なら to が不要（make A lower）。',
  },
  {
    id: 'remind-that',
    tag: '使役・語法',
    ja: 'このメールは、定期購読が月末で終了することをお知らせするものです。',
    en: 'This email is to remind you that your {subscription|定期購読} will {expire|期限が切れる} at the end of the month.',
    note: '「remind + 人 + that 節」で「人に〜を念押しする」。This email is to ... は通知メールの書き出しの定番。',
  },
  {
    id: 'inform-of',
    tag: '使役・語法',
    ja: '旅程に変更がある場合は、速やかにお知らせください。',
    en: 'Please inform us {promptly|速やかに} of any changes to your {itinerary|旅程}.',
    alt: ['please promptly inform us of any changes to your itinerary', 'please inform us of any changes to your itinerary promptly'],
    note: '「inform + 人 + of 〜」で「人に〜を知らせる」。',
  },
  {
    id: 'enable-to',
    tag: '使役・語法',
    ja: '新しいソフトウェアにより、注文をより効率的に処理できるようになる。',
    en: 'The new software will {enable|可能にする} us to process orders more {efficiently|効率的に}.',
    alt: ['the new software will enable us to more efficiently process orders'],
    note: '「enable + 人 + to do」で「人が〜できるようにする」。無生物主語の構文。',
  },
  {
    id: 'attribute-to',
    tag: '使役・語法',
    ja: '部長は、売上の増加は新しい広告キャンペーンのおかげだと考えた。',
    en: 'The manager {attributed|（原因を）〜に帰する} the increase in sales to the new advertising campaign.',
    distractors: ['for'],
    note: '「attribute A to B」で「A を B のおかげ（せい）と考える」。',
  },
  {
    id: 'account-for',
    tag: '使役・語法',
    ja: '今ではオンライン販売が総収益のほぼ半分を占めている。',
    en: 'Online sales now {account|（割合を）占める} for nearly half of our total {revenue|収益}.',
    alt: ['now online sales account for nearly half of our total revenue', 'online sales account for nearly half of our total revenue now'],
    note: '「account for + 割合」で「〜を占める」。account for には「〜を説明する」の意味もある。',
  },
  {
    id: 'subject-to',
    tag: '使役・語法',
    ja: 'すべての旅程は、事前の通知なく変更されることがあります。',
    en: 'All itineraries are subject to change without prior {notice|通知}.',
    distractors: ['changing'],
    note: '「be subject to + 名詞」で「〜を受けることがある」。この to は前置詞なので change は名詞。',
  },

  // ── 接続詞・前置詞 ──
  {
    id: 'provided-that',
    tag: '接続詞・前置詞',
    ja: '10日以内に支払いが行われることを条件に、割引が適用される。',
    en: 'The discount applies {provided|〜という条件で} that the payment is made within ten days.',
    distractors: ['will'],
    alt: ['provided that the payment is made within ten days the discount applies'],
    note: 'provided (that) = 「〜という条件で」。条件を表す節なので未来のことでも現在形（is made）。',
  },
  {
    id: 'in-case',
    tag: '接続詞・前置詞',
    ja: '商品を返品する必要がある場合に備えて、領収書を保管しておいてください。',
    en: 'Please {retain|保持する、保管する} your receipt in case you need to return the item.',
    distractors: ['will'],
    alt: ['in case you need to return the item please retain your receipt'],
    note: 'in case 〜「〜する場合に備えて」。未来のことでも節の中は現在形。',
  },
  {
    id: 'unless-specified',
    tag: '接続詞・前置詞',
    ja: '特に明記がない限り、すべての価格は税込みです。',
    en: 'Unless otherwise {specified|明記する}, all prices include tax.',
    alt: ['all prices include tax unless otherwise specified'],
    note: 'Unless otherwise specified（noted）は「特に明記がない限り」。契約書や案内の定型句。',
  },
  {
    id: 'despite',
    tag: '接続詞・前置詞',
    ja: '景気が低迷しているにもかかわらず、その会社は過去最高の利益を計上した。',
    en: 'Despite the {sluggish|低迷した} economy, the company {posted|（利益などを）計上する} record profits.',
    distractors: ['although'],
    alt: ['the company posted record profits despite the sluggish economy'],
    note: 'despite は前置詞なので後ろは名詞。although は接続詞なので後ろに節（主語 + 動詞）が必要。',
  },
  {
    id: 'once-merger',
    tag: '接続詞・前置詞',
    ja: '合併が承認されれば、両社は単一の社名で営業することになる。',
    en: 'Once the {merger|合併} is {approved|承認する}, the two companies will operate under a single name.',
    distractors: ['will'],
    alt: ['the two companies will operate under a single name once the merger is approved'],
    note: 'once は接続詞で「いったん〜すれば」。時・条件の節なので未来でも現在形（is approved）。',
  },
  {
    id: 'prior-to',
    tag: '接続詞・前置詞',
    ja: '会議の前に、添付の議題に目を通してください。',
    en: '{Prior|前の} to the meeting, please read the attached {agenda|議題}.',
    alt: ['please read the attached agenda prior to the meeting'],
    note: 'prior to 〜 = before 〜（改まった書き言葉）。',
  },
  {
    id: 'due-to-inclement',
    tag: '接続詞・前置詞',
    ja: '悪天候のため、便が遅れた。',
    en: 'The flight was delayed due to {inclement|（天候が）荒れた} weather.',
    distractors: ['because'],
    note: 'due to + 名詞。because なら because of が必要。inclement weather「悪天候」は TOEIC 頻出。',
  },
  {
    id: 'so-that',
    tag: '接続詞・前置詞',
    ja: '需要があまりに大きかったので、セールをもう1週間延長しなければならなかった。',
    en: 'The demand was so {overwhelming|圧倒的な} that we had to {extend|延長する} the sale for another week.',
    distractors: ['such'],
    note: '「so + 形容詞 + that ...」で「とても〜なので…」。such なら such + 名詞 の形。',
  },

  // ── 時制 ──
  {
    id: 'present-perfect-progressive',
    tag: '時制',
    ja: '私たちのチームは3か月以上、その仕入先と交渉を続けている。',
    en: 'Our team has been {negotiating|交渉する} with the {supplier|仕入先} for over three months.',
    distractors: ['is'],
    alt: ['for over three months our team has been negotiating with the supplier'],
    note: '過去から今まで続いている動作は現在完了進行形（has been + -ing）。',
  },
  {
    id: 'future-perfect',
    tag: '時制',
    ja: '改装が終わるころには、私たちは仮事務所に移転し終えているだろう。',
    en: 'By the time the {renovation|改装} is complete, we will have {relocated|移転する} to a temporary office.',
    alt: ['we will have relocated to a temporary office by the time the renovation is complete'],
    note: 'By the time 節は現在形、主節は未来完了（will have + 過去分詞）。',
  },
  {
    id: 'would-confirm',
    tag: '時制',
    ja: '広報担当者は、工場が一時的に閉鎖されることを認めた。',
    en: 'The {spokesperson|広報担当者} confirmed that the factory would be {temporarily|一時的に} closed.',
    note: '主節が過去（confirmed）なので、that 節の「〜することになる」は would で表す（時制の一致）。',
  },

  // ── 比較 ──
  {
    id: 'considerably-more',
    tag: '比較',
    ja: '新しいモデルは、従来モデルよりかなり耐久性が高い。',
    en: 'The new model is {considerably|かなり} more {durable|耐久性のある} than its {predecessor|前任者、前のもの}.',
    distractors: ['very'],
    note: '比較級を強めるのは much / far / considerably / significantly。very は使えない。',
  },
  {
    id: 'the-sooner',
    tag: '比較',
    ja: '契約を早くまとめるほど、早く生産を始められる。',
    en: 'The sooner we {finalize|最終決定する} the contract, the sooner we can begin production.',
    note: '「The 比較級 ..., the 比較級 ...」で「〜すればするほど…」。',
  },

  // ── 受動態・不定詞・動名詞 ──
  {
    id: 'required-to-register',
    tag: '受動態・不定詞・動名詞',
    ja: '参加者は、少なくとも1週間前までに登録する必要がある。',
    en: 'Participants are required to {register|登録する} at least a week in {advance|前もって}.',
    distractors: ['requiring'],
    note: '「be required to do」で「〜することが求められる」。in advance「前もって」。',
  },
  {
    id: 'expected-to-surpass',
    tag: '受動態・不定詞・動名詞',
    ja: '売上は昨年の数字を大幅に上回ると見込まれている。',
    en: "Sales are expected to {surpass|上回る} last year's {figures|数字} by a wide margin.",
    note: '「be expected to do」で「〜すると見込まれている」。by a wide margin「大差で」。',
  },
  {
    id: 'look-forward-to',
    tag: '受動態・不定詞・動名詞',
    ja: '今後のプロジェクトでもご一緒できることを楽しみにしております。',
    en: 'We look forward to {collaborating|協力する} with you on future projects.',
    note: 'look forward to の to は前置詞なので、後ろは動名詞（collaborating）。原形は誤り。',
  },
  {
    id: 'committed-to',
    tag: '受動態・不定詞・動名詞',
    ja: 'その会社は二酸化炭素の排出削減に取り組んでいる。',
    en: 'The company is {committed|（〜に）取り組む、献身する} to reducing its carbon {emissions|排出（量）}.',
    distractors: ['reduce'],
    note: 'be committed to の to も前置詞なので後ろは動名詞（reducing）。',
  },
  {
    id: 'objected-to',
    tag: '受動態・不定詞・動名詞',
    ja: '何人かの株主が、年次総会の延期に反対した。',
    en: 'Several {shareholders|株主} objected to {postponing|延期する} the annual meeting.',
    note: 'object to の to も前置詞。後ろに動詞が来るときは動名詞（postponing）。',
  },
  {
    id: 'so-as-to',
    tag: '受動態・不定詞・動名詞',
    ja: 'アクセス数の増加に対応するため、サーバーを増強した。',
    en: 'We upgraded the server so as to {accommodate|（需要などに）対応する} the increase in traffic.',
    distractors: ['that'],
    alt: ['so as to accommodate the increase in traffic we upgraded the server'],
    note: 'so as to do = in order to do「〜するために」。',
  },
]
