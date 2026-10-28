import type { Passage } from '../types'

/**
 * 付属サンプル教材。
 * 実在の規格・論文からの引用ではなく、規格・論文の文体を練習するために書き下ろした架空の文書。
 * 本物の文書は「取り込む」画面から貼り付けて追加する。
 */
export const SAMPLES: Passage[] = [
  {
    id: 'sample-keywords',
    title: 'Requirement Keywords in Specifications',
    category: 'standard',
    source: 'オリジナル教材（RFC 2119 の考え方を平易に解説）',
    paragraphs: [
      'Many technical documents use a small set of words to show how strict a rule is. These words are often written in capital letters. When you see them, you should read them with care.',
      'The word MUST means that the rule is an absolute requirement. If an implementation does not follow a MUST rule, it does not conform to the specification. The words SHALL and REQUIRED have the same meaning.',
      'The word SHOULD means that there may be good reasons to ignore the rule in some cases. However, the implementer needs to understand the full impact before choosing a different way. The word RECOMMENDED has the same meaning.',
      'The word MAY means that the item is truly optional. One vendor may include the feature because a customer needs it. Another vendor may leave it out. Both products must still work together.',
      'These words exist to help interoperability. They are not a way to force a style on implementers. A good specification uses them only where they are really needed.',
    ],
  },
  {
    id: 'sample-mxp',
    title: 'Simple Message Exchange Protocol — Introduction',
    category: 'standard',
    source: 'オリジナル教材（RFC 形式の架空仕様）',
    paragraphs: [
      'This document specifies the Simple Message Exchange Protocol (SMXP), a lightweight protocol for delivering short messages between two endpoints over an unreliable network. SMXP is intended for constrained devices that cannot afford the overhead of a full transport stack.',
      'An SMXP message consists of a fixed header of eight octets, followed by an optional payload. The header carries a version number, a message type, a sequence number, and a length field. A recipient MUST discard any message whose length field does not match the number of octets actually received.',
      'Each message that requires confirmation is retransmitted until an acknowledgement arrives or a timeout expires. The sender SHOULD double the retransmission interval after each attempt, in order to avoid congestion when many devices share the same link. Implementations MAY choose a different backoff strategy, provided that it is no more aggressive than the one described in Section 4.',
      'SMXP does not provide confidentiality or integrity protection by itself. Deployments that carry sensitive data MUST run SMXP over a secure channel, as described in Section 7. Intermediaries that do not understand a message type SHOULD forward it unchanged rather than reject it, so that future extensions remain backward compatible.',
      'The remainder of this document is organized as follows. Section 2 defines the terminology. Section 3 describes the message format. Section 4 specifies the retransmission rules. Section 5 discusses interoperability with earlier drafts, and Section 6 lists the registries maintained for this protocol.',
    ],
  },
  {
    id: 'sample-records',
    title: 'Records Management — Scope and Requirements',
    category: 'standard',
    source: 'オリジナル教材（ISO 形式の架空規格）',
    paragraphs: [
      '1 Scope. This document specifies requirements for the creation, retention, and disposal of electronic records within an organization. It is applicable to all organizations, regardless of type, size, or the nature of the records they hold. This document does not specify requirements for the physical storage media on which records are kept.',
      '2 Normative references. The following documents are referred to in the text in such a way that some or all of their content constitutes requirements of this document. For dated references, only the edition cited applies. For undated references, the latest edition of the referenced document, including any amendments, applies.',
      '3 Terms and definitions. For the purposes of this document, the following terms and definitions apply. A record is information created, received, and maintained as evidence by an organization in pursuance of legal obligations or in the transaction of business. Retention is the period during which a record is kept before it is disposed of.',
      '4 General requirements. The organization shall establish, document, and maintain a records policy. The policy shall be approved by top management and shall be communicated to all relevant stakeholders. The organization shall ensure that records remain authentic, reliable, and usable for the whole of their retention period, notwithstanding any change in the systems used to manage them.',
      'NOTE Annex A, which is informative, gives examples of retention periods that are commonly applied in practice. Users of this document are advised that such examples do not replace the legal requirements of any particular jurisdiction.',
    ],
  },
  {
    id: 'sample-flaky',
    title: 'Detecting Flaky Tests Without Rerunning Them',
    category: 'paper',
    source: 'オリジナル教材（ソフトウェア工学論文風の架空要旨と序論）',
    paragraphs: [
      'Abstract. Flaky tests, which pass and fail on the same code without any change, waste developer time and reduce trust in continuous integration. Existing detection methods rely on rerunning each test many times, which is expensive for large projects. In this paper, we propose a static approach that predicts flakiness from the source code of a test alone. We train a classifier on features such as the use of timing functions, network calls, and shared global state. On a dataset of 4,500 tests from 30 open-source projects, our method achieves an F1 score of 0.81, outperforming the strongest baseline by 9 percentage points.',
      '1 Introduction. Automated tests are expected to be deterministic: given the same code, they should always produce the same result. In practice, however, a considerable fraction of tests are flaky. Prior studies have attributed flakiness mainly to asynchronous waits, concurrency, and dependence on test order.',
      'The most common way to find flaky tests is to rerun them. While this approach is reliable, it requires substantial computing resources, and a test that fails only once in a thousand runs may still be missed. Furthermore, rerunning gives no hint about why a test is flaky.',
      'Our key insight is that many sources of flakiness leave visible traces in the test code. For example, a call to a sleep function with a fixed duration is a strong signal of an asynchronous wait. We therefore ask whether these traces are sufficient to predict flakiness without executing the test at all.',
      'The contributions of this paper are threefold. First, we define a set of interpretable features that capture known causes of flakiness. Second, we present an empirical evaluation on a new dataset, which we make publicly available to support reproducibility. Third, we conduct an ablation study showing that features related to timing account for most of the predictive power.',
    ],
  },
  {
    id: 'sample-battery',
    title: 'Capacity Fade in Layered Cathodes at High Voltage',
    category: 'paper',
    source: 'オリジナル教材（材料科学論文風の架空要旨と序論）',
    paragraphs: [
      'Abstract. Raising the charge cutoff voltage of layered oxide cathodes increases the energy density of lithium-ion cells, albeit at the cost of accelerated capacity fade. Here we investigate the degradation mechanisms of a nickel-rich cathode cycled up to 4.5 V. Using a combination of in situ X-ray diffraction and post-mortem electron microscopy, we show that surface reconstruction, rather than bulk cracking, is the dominant cause of capacity loss during the first two hundred cycles. A thin coating applied during synthesis suppresses this reconstruction and retains 92% of the initial capacity after 300 cycles, compared with 71% for the uncoated material.',
      'Introduction. The demand for electric vehicles with longer driving range has motivated intensive research into cathode materials with higher specific capacity. Nickel-rich layered oxides are among the most promising candidates, as their capacity increases with the nickel content. However, these materials exhibit poor stability when charged to high voltages, which limits their practical use.',
      'Several mechanisms have been proposed to explain this instability, including phase transitions in the bulk, the formation of microcracks between particles, and side reactions at the interface between the electrode and the electrolyte. Whereas the first two have been studied extensively, the relative contribution of surface processes remains poorly understood, partly because they are difficult to observe directly.',
      'In this work, we combine techniques that probe the bulk and the surface separately, so that the contribution of each mechanism can be quantified. Our results suggest that strategies aimed at stabilizing the surface may yield larger improvements than those aimed at preventing cracking, at least in the early stage of cycling.',
    ],
  },
  {
    id: 'sample-annotation',
    title: 'How Much Does Annotator Disagreement Matter?',
    category: 'paper',
    source: 'オリジナル教材（自然言語処理論文風の架空要旨と序論）',
    paragraphs: [
      'Abstract. Benchmark datasets for natural language understanding are typically built by aggregating the labels of several annotators into a single gold label, implicitly assuming that disagreement is noise. We question this assumption. By re-annotating three widely used benchmarks with ten annotators per item, we find that between 18% and 34% of items exhibit systematic disagreement that cannot be attributed to annotator error. We further show that models evaluated on items with high disagreement display a substantially larger variance across random seeds, suggesting that reported improvements of less than one point are often not meaningful. We argue that benchmarks should release the full distribution of labels and that evaluation metrics should take this distribution into account.',
      '1 Introduction. Progress in natural language processing is largely measured on benchmarks. A new method is considered successful if it outperforms previous methods on one or more of these benchmarks, often by a small margin. The validity of such comparisons depends on the quality of the labels against which models are evaluated.',
      'Labels are usually obtained by asking several people to annotate each example and then taking the majority vote. This procedure is efficient and has a clear justification when the task has a single correct answer. For many language tasks, however, competent speakers can reasonably disagree, for instance when a sentence is ambiguous or when the label depends on background knowledge.',
      'If such disagreement is common, collapsing it into a single label has two consequences. First, a model may be penalized for a prediction that a large group of annotators would accept. Second, small differences between systems may reflect nothing more than which side of a genuine disagreement each model happens to favour. In this paper, we measure how large these effects are in practice.',
    ],
  },
]

/** 本物の文書を探すための、再配布条件が比較的明確な入手先 */
export const SOURCE_LINKS: { name: string; url: string; note: string }[] = [
  {
    name: 'RFC Editor (IETF)',
    url: 'https://www.rfc-editor.org/',
    note: 'インターネット技術の規格。全文テキストで公開。',
  },
  {
    name: 'W3C Standards',
    url: 'https://www.w3.org/TR/',
    note: 'Web 標準（HTML, CSS, WCAG など）。',
  },
  {
    name: 'NIST Publications',
    url: 'https://csrc.nist.gov/publications',
    note: '米国政府の技術文書（SP 800 シリーズなど）。',
  },
  {
    name: 'arXiv',
    url: 'https://arxiv.org/',
    note: '論文プレプリント。各論文のライセンスを確認して利用。',
  },
  {
    name: 'PubMed Central Open Access',
    url: 'https://www.ncbi.nlm.nih.gov/pmc/tools/openftlist/',
    note: '生命科学系のオープンアクセス論文。',
  },
]
