import { Eye, Trash2, Play, ArrowUpDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DataTable, type Column } from '@/components/common/DataTable';
import { EmptyState } from '@/components/common/EmptyState';
import { UploadCloud } from 'lucide-react';
import { formatBytes } from '@/utils/bytes';
import { formatRelative } from '@/utils/format';
import { fileTypeIcon, statusTone } from '@/utils/documents';
import type { DocumentRow } from '@/types/Document';
import { cn } from '@/lib/utils';

interface DocumentTableProps {
  rows: DocumentRow[];
  onDelete: (doc: DocumentRow) => void;
  onProcess: (doc: DocumentRow) => void;
  sortBy: 'uploaded_at' | 'file_name' | 'file_size_bytes';
  sortDir: 'asc' | 'desc';
  onSort: (key: 'uploaded_at' | 'file_name' | 'file_size_bytes') => void;
}

export function DocumentTable({ rows, onDelete, onProcess, sortBy, sortDir, onSort }: DocumentTableProps) {
  const sortableHeader = (label: string, key: DocumentTableProps['sortBy']) => (
    <button onClick={() => onSort(key)} className="inline-flex items-center gap-1 hover:text-foreground">
      {label}
      <ArrowUpDown
        className={cn('h-3 w-3', sortBy === key ? 'text-foreground' : 'text-muted-foreground/50')}
      />
    </button>
  );

  const columns: Column<DocumentRow>[] = [
    {
      key: 'name',
      header: sortableHeader('Name', 'file_name'),
      render: (row) => {
        const Icon = fileTypeIcon(row.file_type);
        return (
          <div className="flex items-center gap-2 min-w-0">
            <Icon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <span className="truncate text-foreground">{row.file_name}</span>
          </div>
        );
      },
    },
    {
      key: 'type',
      header: 'Type',
      render: (row) => <span className="uppercase text-xs text-muted-foreground">{row.file_type}</span>,
    },
    {
      key: 'size',
      header: sortableHeader('Size', 'file_size_bytes'),
      render: (row) => <span className="text-xs text-muted-foreground">{formatBytes(row.file_size_bytes)}</span>,
    },
    {
      key: 'uploaded',
      header: sortableHeader('Uploaded', 'uploaded_at'),
      render: (row) => <span className="text-xs text-muted-foreground">{formatRelative(row.uploaded_at)}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => {
        const tone = statusTone(row.processing_status);
        return <Badge className={cn('border-transparent', tone.className)}>{tone.label}</Badge>;
      },
    },
    {
      key: 'actions',
      header: '',
      className: 'text-right',
      render: (row) => (
        <div className="flex items-center justify-end gap-1">
          {row.processing_status === 'uploaded' && (
            <Button
              variant="ghost"
              size="icon"
              title="Start processing"
              onClick={() => onProcess(row)}
            >
              <Play className="h-4 w-4" />
            </Button>
          )}
          <Button asChild variant="ghost" size="icon" title="View">
            <Link to={`/documents/${row.id}`}>
              <Eye className="h-4 w-4" />
            </Link>
          </Button>
          <Button variant="ghost" size="icon" title="Delete" onClick={() => onDelete(row)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      rows={rows}
      getRowKey={(r) => r.id}
      empty={
        <EmptyState
          icon={UploadCloud}
          title="No documents match"
          description="Try clearing your filters or upload a new document."
        />
      }
    />
  );
}
