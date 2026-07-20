export type DocumentStatus =
  | 'uploaded'
  | 'processing'
  | 'extracted'
  | 'analyzed'
  | 'failed';

export type DocumentFileType = 'pdf' | 'image' | 'csv' | 'xlsx';

export interface DocumentRow {
  id: string;
  company_id: string;
  file_name: string;
  file_type: DocumentFileType | string;
  mime_type: string | null;
  file_size_bytes: number | null;
  storage_path: string;
  processing_status: DocumentStatus | string;
  error_message: string | null;
  extracted_text: string | null;
  extracted_data: Record<string, unknown> | null;
  confidence_score: number | null;
  processed_at: string | null;
  uploaded_at: string;
}

/** Client-side model tracking an in-flight upload before it reaches the DB. */
export interface UploadTask {
  localId: string;
  file: File;
  progress: number; // 0-100
  state: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
  documentId?: string;
}
