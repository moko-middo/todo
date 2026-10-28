import type { Passage } from '../types'
import data from './pdf-passages.json'

/** content/ 以下の PDF からビルド時に抽出した文書（scripts/extract-pdfs.mjs が生成） */
export const PDF_PASSAGES = data as Passage[]
