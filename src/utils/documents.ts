import { FileText, FileImage, FileSpreadsheet, File as FileIcon } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export function fileTypeIcon(fileType: string | null | undefined): LucideIcon {
  switch (fileType) {
    case 'pdf':
      return FileText;
    case 'image':
      return FileImage;
    case 'csv':
    case 'xlsx':
      return FileSpreadsheet;
    default:
      return FileIcon;
  }
}

export function statusTone(status: string): {
  label: string;
  className: string;
} {
  switch (status) {
    case 'uploaded':
      return { label: 'Uploaded', className: 'bg-muted text-muted-foreground' };
    case 'processing':
      return { label: 'Processing', className: 'bg-primary/15 text-primary' };
    case 'extracted':
      return { label: 'Extracted', className: 'bg-blue-500/15 text-blue-500' };
    case 'analyzed':
      return { label: 'Analyzed', className: 'bg-emerald-500/15 text-emerald-500' };
    case 'failed':
      return { label: 'Failed', className: 'bg-red-500/15 text-red-500' };
    default:
      return { label: status, className: 'bg-muted text-muted-foreground' };
  }
}
