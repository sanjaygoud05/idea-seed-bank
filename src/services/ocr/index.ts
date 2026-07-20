/**
 * OCR service — future integration point for Hugging Face OCR models
 * (e.g. `microsoft/trocr-large-printed`, `naver-clova-ix/donut-base`).
 *
 * Not implemented — do NOT fabricate results. Callers must handle `NotImplementedError`
 * or the resolved `null` value and leave the document in `uploaded` state until
 * a real OCR provider is wired in via a Supabase Edge Function.
 *
 * Planned flow:
 *   1. Edge function receives { documentId, signedUrl }
 *   2. Function calls Hugging Face Inference API with the file
 *   3. Extracted text + confidence is written back to `uploaded_data`
 *   4. Status flips to `extracted`
 */
export interface OcrResult {
  text: string;
  confidence: number; // 0-1
  pages?: number;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function runOcr(_signedUrl: string): Promise<OcrResult | null> {
  // TODO: invoke edge function `ocr-document` that calls Hugging Face.
  return null;
}
