/**
 * Storage service — thin wrapper over Supabase Storage for the `documents` bucket.
 *
 * Files are stored under `<company_id>/<uuid>.<ext>` so RLS policies can gate
 * access by folder. Signed URLs are short-lived (default 1h) and are used for
 * preview/download; downstream OCR/AI services will consume signed URLs too.
 */
import { supabase } from '@/integrations/supabase/client';

export const DOCUMENTS_BUCKET = 'documents';

export const MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024; // 20 MB

export const ACCEPTED_MIME_TYPES: Record<string, 'pdf' | 'image' | 'csv' | 'xlsx'> = {
  'application/pdf': 'pdf',
  'image/png': 'image',
  'image/jpeg': 'image',
  'image/jpg': 'image',
  'text/csv': 'csv',
  'application/vnd.ms-excel': 'csv',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
};

export function classifyFile(file: File): {
  ok: boolean;
  reason?: string;
  category?: 'pdf' | 'image' | 'csv' | 'xlsx';
} {
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return { ok: false, reason: `File exceeds ${MAX_FILE_SIZE_BYTES / 1024 / 1024} MB limit` };
  }
  const byMime = ACCEPTED_MIME_TYPES[file.type];
  if (byMime) return { ok: true, category: byMime };
  const ext = file.name.split('.').pop()?.toLowerCase();
  if (ext === 'pdf') return { ok: true, category: 'pdf' };
  if (ext && ['png', 'jpg', 'jpeg'].includes(ext)) return { ok: true, category: 'image' };
  if (ext === 'csv') return { ok: true, category: 'csv' };
  if (ext === 'xlsx') return { ok: true, category: 'xlsx' };
  return { ok: false, reason: 'Unsupported file type' };
}

export function buildStoragePath(companyId: string, file: File): string {
  const ext = file.name.split('.').pop()?.toLowerCase() ?? 'bin';
  const uuid = crypto.randomUUID();
  return `${companyId}/${uuid}.${ext}`;
}

export async function uploadToStorage(path: string, file: File): Promise<void> {
  const { error } = await supabase.storage
    .from(DOCUMENTS_BUCKET)
    .upload(path, file, { contentType: file.type || undefined, upsert: false });
  if (error) throw error;
}

export async function deleteFromStorage(path: string): Promise<void> {
  const { error } = await supabase.storage.from(DOCUMENTS_BUCKET).remove([path]);
  if (error) throw error;
}

export async function getSignedUrl(path: string, expiresIn = 3600): Promise<string> {
  const { data, error } = await supabase.storage
    .from(DOCUMENTS_BUCKET)
    .createSignedUrl(path, expiresIn);
  if (error) throw error;
  return data.signedUrl;
}
