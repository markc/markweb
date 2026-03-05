import { useCallback, useEffect, useRef, useState } from 'react';
import { usePage } from '@inertiajs/react';
import { FileText, Loader2, Trash2, Upload, AlertCircle } from 'lucide-react';
import type { UserDocument, DocumentProcessedEvent } from '@/types/document';

function getCsrfToken(): string {
    const match = document.cookie.match(/XSRF-TOKEN=([^;]+)/);
    return match ? decodeURIComponent(match[1]) : '';
}

function formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function DocumentsPanel() {
    const { auth } = usePage().props;
    const [documents, setDocuments] = useState<UserDocument[]>([]);
    const [loading, setLoading] = useState(true);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const fetchDocuments = useCallback(async () => {
        try {
            const response = await fetch('/chat/documents', {
                headers: { Accept: 'application/json', 'X-XSRF-TOKEN': getCsrfToken() },
            });
            if (response.ok) {
                setDocuments(await response.json());
            }
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchDocuments();
    }, [fetchDocuments]);

    // Listen for document processed events via Reverb
    useEffect(() => {
        const userId = (auth as any)?.user?.id;
        if (!userId) return;

        const channel = window.Echo.private(`documents.user.${userId}`);
        channel.listen('.document.processed', (_e: DocumentProcessedEvent) => {
            fetchDocuments();
        });

        return () => {
            window.Echo.leave(`documents.user.${userId}`);
        };
    }, [(auth as any)?.user?.id]);

    const handleUpload = async (files: FileList) => {
        for (const file of Array.from(files)) {
            const formData = new FormData();
            formData.append('file', file);

            try {
                const response = await fetch('/chat/documents', {
                    method: 'POST',
                    headers: { 'X-XSRF-TOKEN': getCsrfToken(), Accept: 'application/json' },
                    body: formData,
                });

                if (response.ok) {
                    const data = await response.json();
                    setDocuments((prev) => [
                        { filename: data.filename, status: 'processing', mime_type: '', file_size: file.size, chunk_count: 0, uploaded_at: new Date().toISOString() },
                        ...prev,
                    ]);
                }
            } catch (err) {
                console.error('Upload failed:', err);
            }
        }
    };

    const handleDelete = async (filename: string) => {
        const response = await fetch(`/chat/documents/${encodeURIComponent(filename)}`, {
            method: 'DELETE',
            headers: { 'X-XSRF-TOKEN': getCsrfToken(), Accept: 'application/json' },
        });
        if (response.ok) {
            setDocuments((prev) => prev.filter((d) => d.filename !== filename));
        }
    };

    const statusIcon = (status: string) => {
        switch (status) {
            case 'processing': return <Loader2 className="h-3.5 w-3.5 animate-spin" style={{ color: 'var(--scheme-fg-muted)' }} />;
            case 'failed': return <AlertCircle className="h-3.5 w-3.5 text-destructive" />;
            default: return <FileText className="h-3.5 w-3.5" style={{ color: 'var(--scheme-fg-muted)' }} />;
        }
    };

    return (
        <div className="flex h-full flex-col">
            <div className="flex items-center justify-between px-3 py-2">
                <span className="text-xs font-medium" style={{ color: 'var(--scheme-fg-secondary)' }}>
                    Documents
                </span>
                <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-white transition-opacity hover:opacity-80"
                    style={{ backgroundColor: 'var(--scheme-accent)' }}
                >
                    <Upload className="h-4 w-4" />
                </button>
                <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    multiple
                    onChange={(e) => e.target.files && handleUpload(e.target.files)}
                />
            </div>

            <div className="flex-1 overflow-y-auto">
                {loading && (
                    <p className="p-3 text-center text-xs" style={{ color: 'var(--scheme-fg-muted)' }}>
                        Loading...
                    </p>
                )}
                {!loading && documents.length === 0 && (
                    <p className="p-3 text-center text-xs" style={{ color: 'var(--scheme-fg-muted)' }}>
                        No documents uploaded
                    </p>
                )}
                {documents.map((doc) => (
                    <div key={doc.filename} className="group relative flex items-center gap-2 px-3 py-2 text-sm">
                        {statusIcon(doc.status)}
                        <div className="min-w-0 flex-1">
                            <div className="truncate text-xs" style={{ color: 'var(--scheme-fg-primary)' }}>
                                {doc.filename}
                            </div>
                            <div className="text-[10px]" style={{ color: 'var(--scheme-fg-muted)' }}>
                                {formatSize(doc.file_size)}
                                {doc.chunk_count > 0 && ` · ${doc.chunk_count} chunks`}
                            </div>
                        </div>
                        <button
                            onClick={() => handleDelete(doc.filename)}
                            className="rounded p-1 opacity-0 transition-opacity hover:bg-destructive/10 group-hover:opacity-100"
                            title="Delete document"
                        >
                            <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
