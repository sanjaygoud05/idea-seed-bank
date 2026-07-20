/**
 * AI analysis service — future integration point for Lovable AI Gateway (Gemini).
 *
 * Not implemented — do NOT fabricate results. Once wired, an edge function will
 * post extracted text to `google/gemini-2.5-flash` with a structured-output
 * schema (utility bill totals, emission factors, invoice line items, …) and
 * persist the structured result on `uploaded_data.extracted_data`.
 */
export interface AiAnalysisResult {
  summary: string;
  fields: Record<string, unknown>;
  confidence: number; // 0-1
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function analyzeExtractedText(
  _text: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _hint?: 'utility-bill' | 'invoice' | 'emissions-report' | 'generic',
): Promise<AiAnalysisResult | null> {
  // TODO: invoke edge function `analyze-document` that calls Lovable AI Gateway.
  return null;
}
