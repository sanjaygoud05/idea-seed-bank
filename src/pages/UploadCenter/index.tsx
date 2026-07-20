import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Search, UploadCloud } from 'lucide-react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { AppLayout } from '@/layouts/AppLayout';
import { PageHeader } from '@/components/common/PageHeader';
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton';
import { EmptyState } from '@/components/common/EmptyState';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DropzoneUpload } from '@/components/upload/DropzoneUpload';
import { DocumentTable } from '@/components/upload/DocumentTable';
import {
  deleteDocument,
  listDocuments,
  uploadDocument,
} from '@/services/documents';
import { startProcessing } from '@/services/processing';
import { getMyCompany } from '@/services/company';
import type { DocumentRow } from '@/types/Document';

type SortKey = 'uploaded_at' | 'file_name' | 'file_size_bytes';

export default function UploadCenterPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortKey>('uploaded_at');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const { data: company } = useQuery({ queryKey: ['my-company'], queryFn: getMyCompany });
  const companyId = company?.id ?? null;

  const { data: documents = [], isLoading } = useQuery({
    queryKey: ['documents', companyId],
    queryFn: () => (companyId ? listDocuments(companyId) : Promise.resolve([])),
    enabled: !!companyId,
  });

  const uploadMutation = useMutation({
    mutationFn: async ({ file, onProgress }: { file: File; onProgress: (p: number) => void }) => {
      if (!companyId) throw new Error('Create a company profile before uploading');
      return uploadDocument(companyId, file, onProgress);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['documents', companyId] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (doc: DocumentRow) => deleteDocument(doc),
    onSuccess: () => {
      toast.success('Document deleted');
      qc.invalidateQueries({ queryKey: ['documents', companyId] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const processMutation = useMutation({
    mutationFn: (doc: DocumentRow) => startProcessing(doc.id),
    onSuccess: () => {
      toast.success('Processing queued', {
        description: 'OCR + AI pipeline integration pending — status updated to Processing.',
      });
      qc.invalidateQueries({ queryKey: ['documents', companyId] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const filtered = useMemo(() => {
    let rows = [...documents];
    if (search.trim()) {
      const q = search.toLowerCase();
      rows = rows.filter((r) => r.file_name.toLowerCase().includes(q));
    }
    if (typeFilter !== 'all') rows = rows.filter((r) => r.file_type === typeFilter);
    if (statusFilter !== 'all') rows = rows.filter((r) => r.processing_status === statusFilter);
    rows.sort((a, b) => {
      const av = a[sortBy] ?? '';
      const bv = b[sortBy] ?? '';
      if (av < bv) return sortDir === 'asc' ? -1 : 1;
      if (av > bv) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return rows;
  }, [documents, search, typeFilter, statusFilter, sortBy, sortDir]);

  const onSort = (key: SortKey) => {
    if (sortBy === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else {
      setSortBy(key);
      setSortDir('desc');
    }
  };

  const stats = useMemo(() => {
    const total = documents.length;
    const processing = documents.filter((d) => d.processing_status === 'processing').length;
    const done = documents.filter(
      (d) => d.processing_status === 'extracted' || d.processing_status === 'analyzed',
    ).length;
    return { total, processing, done };
  }, [documents]);

  return (
    <AppLayout>
      <div className="space-y-8">
        <PageHeader
          title="Smart Document Processing"
          description="Upload utility bills, invoices, and disclosures. Files are securely stored and queued for OCR + AI extraction."
        />

        {!company ? (
          <EmptyState
            icon={UploadCloud}
            title="Create a company profile first"
            description="Documents are grouped per company. Set yours up to start uploading."
            action={{ label: 'Go to Company Profile', onClick: () => (window.location.href = '/company') }}
          />
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <StatBlock label="Total documents" value={stats.total} />
              <StatBlock label="Processing" value={stats.processing} />
              <StatBlock label="Extracted / analyzed" value={stats.done} />
            </div>

            <DropzoneUpload
              onUpload={async (file, onProgress) => {
                try {
                  await uploadMutation.mutateAsync({ file, onProgress });
                  toast.success(`Uploaded ${file.name}`);
                } catch (e) {
                  const msg = e instanceof Error ? e.message : 'Upload failed';
                  toast.error(msg);
                  throw e;
                }
              }}
            />

            <div className="space-y-3">
              <div className="flex flex-col md:flex-row md:items-center gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by file name…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="md:w-40"><SelectValue placeholder="File type" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All types</SelectItem>
                    <SelectItem value="pdf">PDF</SelectItem>
                    <SelectItem value="image">Image</SelectItem>
                    <SelectItem value="csv">CSV</SelectItem>
                    <SelectItem value="xlsx">Excel</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="md:w-44"><SelectValue placeholder="Status" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All statuses</SelectItem>
                    <SelectItem value="uploaded">Uploaded</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="extracted">Extracted</SelectItem>
                    <SelectItem value="analyzed">Analyzed</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {isLoading ? (
                <LoadingSkeleton rows={4} />
              ) : documents.length === 0 ? (
                <EmptyState
                  icon={UploadCloud}
                  title="No documents yet"
                  description="Drop a file above to add your first document."
                />
              ) : (
                <DocumentTable
                  rows={filtered}
                  onDelete={(d) => deleteMutation.mutate(d)}
                  onProcess={(d) => processMutation.mutate(d)}
                  sortBy={sortBy}
                  sortDir={sortDir}
                  onSort={onSort}
                />
              )}
            </div>
          </>
        )}
      </div>
    </AppLayout>
  );
}

function StatBlock({ label, value }: { label: string; value: number }) {
  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-2xl font-semibold text-foreground mt-1">{value}</p>
      </CardContent>
    </Card>
  );
}

// Kept for compatibility with any external imports.
export { UploadCenterPage as UploadCenter };
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _link = Link;
