/**
 * Processing orchestrator — kicks off the OCR → AI pipeline for a document.
 *
 * Today this only advances DB status (`uploaded` → `processing` → back to
 * `uploaded` on failure). A future Supabase Edge Function will take over the
 * heavy lifting; the client will call `startProcessing()` which invokes the
 * function, and realtime subscriptions on `uploaded_data` will surface status
 * updates in the UI.
 *
 * NEVER write fake extraction results here — status transitions only.
 */
import { updateDocumentStatus } from '@/services/documents';

export async function startProcessing(documentId: string): Promise<void> {
  await updateDocumentStatus(documentId, 'processing');
  // TODO: supabase.functions.invoke('process-document', { body: { documentId } })
  //       Edge function will run OCR + AI and set status to `extracted` / `analyzed`.
}
