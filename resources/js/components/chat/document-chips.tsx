import { FileText, Loader2, X, AlertCircle } from 'lucide-react';
import type { UserDocument } from '@/types/document';

interface Props {
    documents: UserDocument[];
    onRemove?: (filename: string) => void;
}

const statusIcon = {
    processing: <Loader2 className="h-3 w-3 animate-spin" />,
    ready: <FileText className="h-3 w-3" />,
    failed: <AlertCircle className="h-3 w-3 text-destructive" />,
};

function formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function DocumentChips({ documents, onRemove }: Props) {
    if (documents.length === 0) return null;

    return (
        <div className="flex flex-wrap gap-1.5 px-4 py-1.5">
            {documents.map((doc) => (
                <span
                    key={doc.filename}
                    className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs"
                    style={{
                        borderColor: doc.status === 'failed' ? 'var(--destructive)' : 'var(--scheme-border)',
                        color: 'var(--scheme-fg-secondary)',
                    }}
                >
                    {statusIcon[doc.status]}
                    <span className="max-w-32 truncate">{doc.filename}</span>
                    <span style={{ color: 'var(--scheme-fg-muted)' }}>{formatSize(doc.file_size)}</span>
                    {onRemove && (
                        <button
                            onClick={() => onRemove(doc.filename)}
                            className="ml-0.5 rounded-full p-0.5 transition-colors hover:bg-destructive/10"
                        >
                            <X className="h-3 w-3" />
                        </button>
                    )}
                </span>
            ))}
        </div>
    );
}
