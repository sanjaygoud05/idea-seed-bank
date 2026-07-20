import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Download, FileText } from 'lucide-react';
import { AppLayout } from '@/layouts/AppLayout';
import { PageHeader } from '@/components/common/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton';
import { EmptyState } from '@/components/common/EmptyState';
import { ProcessingPipeline } from '@/components/upload/ProcessingPipeline';
import { supabase } from '@/integrations/supabase/client';
import { getDocument, getDocumentSignedUrl } from '@/services/documents';
import { formatBytes } from '@/utils/bytes';
import { formatDate } from '@/utils/format';
import { fileTypeIcon, statusTone } from '@/utils/documents';
import { cn } from '@/lib/utils';

export default function DocumentResultsPage() {
  const { id } = useParams<{ id: string }>();
  const qc = useQueryClient();
  const [signedUrl, setSignedUrl] = useState<string | null>(null);

  const { data: doc, isLoading } = useQuery({
    queryKey: ['document', id],
    queryFn: () => (id ? getDocument(id) : Promise.resolve(null)),
    enabled: !!id,
  });

  useEffect(() => {
    if (!doc) return;
    getDocumentSignedUrl(doc).then(setSignedUrl).catch(() => setSignedUrl(null));
  }, [doc]);

  // Live status updates once a processing pipeline is wired in.
  useEffect(() => {
    if (!id) return;
    const channel = supabase
      .channel(`document-${id}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'uploaded_data', filter: `id=eq.${id}` },
        () => qc.invalidateQueries({ queryKey: ['document', id] }),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [id, qc]);

  if (isLoading) {
    return (
      <AppLayout>
        <LoadingSkeleton rows={6} />
      </AppLayout>
    );
  }

  if (!doc) {
    return (
      <AppLayout>
        <EmptyState icon={FileText} title="Document not found" description="It may have been deleted." />
      </AppLayout>
    );
  }

  const Icon = fileTypeIcon(doc.file_type);
  const tone = statusTone(doc.processing_status);
  const canPreview = doc.file_type === 'pdf' || doc.file_type === 'image';

  return (
    <AppLayout>
      <div className="space-y-6">
        <Button asChild variant="ghost" size="sm" className="gap-2 -ml-3">
          <Link to="/uploads">
            <ArrowLeft className="h-4 w-4" /> Back to documents
          </Link>
        </Button>

        <PageHeader
          title={doc.file_name}
          description="Extraction results and processing status for this document."
          action={
            signedUrl
              ? {
                  label: 'Download',
                  icon: Download,
                  onClick: () => window.open(signedUrl, '_blank', 'noopener'),
                }
              : undefined
          }
        />

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Pipeline</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ProcessingPipeline status={doc.processing_status} errorMessage={doc.error_message} />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <Meta label="Type"><span className="uppercase">{doc.file_type}</span></Meta>
              <Meta label="Size">{formatBytes(doc.file_size_bytes)}</Meta>
              <Meta label="Uploaded">{formatDate(doc.uploaded_at)}</Meta>
              <Meta label="Status">
                <Badge className={cn('border-transparent', tone.className)}>{tone.label}</Badge>
              </Meta>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Icon className="h-4 w-4" /> Preview
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!signedUrl ? (
                <LoadingSkeleton rows={3} />
              ) : canPreview ? (
                doc.file_type === 'image' ? (
                  <img src={signedUrl} alt={doc.file_name} className="w-full rounded border border-border" />
                ) : (
                  <iframe
                    src={signedUrl}
                    title={doc.file_name}
                    className="w-full h-[520px] rounded border border-border bg-muted"
                  />
                )
              ) : (
                <EmptyState
                  icon={FileText}
                  title="Preview unavailable"
                  description="This file type can be downloaded but not previewed inline."
                />
              )}
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Confidence</CardTitle>
              </CardHeader>
              <CardContent>
                {doc.confidence_score != null ? (
                  <p className="text-3xl font-semibold text-foreground">
                    {Math.round(doc.confidence_score * 100)}%
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No score yet. OCR + AI pipeline pending integration.
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Extracted text</CardTitle>
              </CardHeader>
              <CardContent>
                {doc.extracted_text ? (
                  <pre className="text-xs text-foreground whitespace-pre-wrap max-h-64 overflow-auto">
                    {doc.extracted_text}
                  </pre>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Nothing extracted yet. Once OCR runs, extracted text will appear here.
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Structured fields</CardTitle>
              </CardHeader>
              <CardContent>
                {doc.extracted_data && Object.keys(doc.extracted_data).length > 0 ? (
                  <pre className="text-xs text-foreground whitespace-pre-wrap max-h-64 overflow-auto">
                    {JSON.stringify(doc.extracted_data, null, 2)}
                  </pre>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Structured extraction (line items, totals, emission factors, …) will be filled in by
                    the AI analysis step.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

function Meta({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <div className="mt-1 text-foreground">{children}</div>
    </div>
  );
}
