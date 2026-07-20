/**
 * Documents service — CRUD for `uploaded_data` rows.
 */
import { supabase } from '@/integrations/supabase/client';
import type { DocumentRow, DocumentStatus } from '@/types/Document';
import {
  buildStoragePath,
  classifyFile,
  deleteFromStorage,
  getSignedUrl,
  uploadToStorage,
} from '@/services/storage';

export async function listDocuments(companyId: string): Promise<DocumentRow[]> {
  const { data, error } = await supabase
    .from('uploaded_data')
    .select('*')
    .eq('company_id', companyId)
    .order('uploaded_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as unknown as DocumentRow[];
}

export async function getDocument(id: string): Promise<DocumentRow | null> {
  const { data, error } = await supabase
    .from('uploaded_data')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  return (data as unknown as DocumentRow) ?? null;
}

export async function updateDocumentStatus(
  id: string,
  status: DocumentStatus,
  errorMessage: string | null = null,
): Promise<void> {
  const { error } = await supabase
    .from('uploaded_data')
    .update({ processing_status: status, error_message: errorMessage })
    .eq('id', id);
  if (error) throw error;
}

export async function deleteDocument(doc: DocumentRow): Promise<void> {
  // Best-effort storage cleanup first; DB row still removed if storage fails.
  try {
    await deleteFromStorage(doc.storage_path);
  } catch (e) {
    console.warn('Storage delete failed, removing DB row anyway:', e);
  }
  const { error } = await supabase.from('uploaded_data').delete().eq('id', doc.id);
  if (error) throw error;
}

export async function getDocumentSignedUrl(doc: DocumentRow): Promise<string> {
  return getSignedUrl(doc.storage_path);
}

/**
 * Full upload flow: validate → put in Storage → insert row.
 * `onProgress` is invoked with 0..100 (simple two-phase: 50% at upload done, 100% at row insert).
 */
export async function uploadDocument(
  companyId: string,
  file: File,
  onProgress?: (pct: number) => void,
): Promise<DocumentRow> {
  const check = classifyFile(file);
  if (!check.ok || !check.category) throw new Error(check.reason ?? 'Invalid file');

  const path = buildStoragePath(companyId, file);
  onProgress?.(10);
  await uploadToStorage(path, file);
  onProgress?.(70);

  const { data, error } = await supabase
    .from('uploaded_data')
    .insert({
      company_id: companyId,
      file_name: file.name,
      file_type: check.category,
      mime_type: file.type || null,
      file_size_bytes: file.size,
      storage_path: path,
      processing_status: 'uploaded',
    })
    .select('*')
    .single();

  if (error) {
    // Roll back the storage object if the DB insert fails so we don't orphan files.
    await deleteFromStorage(path).catch(() => {});
    throw error;
  }
  onProgress?.(100);
  return data as unknown as DocumentRow;
}
