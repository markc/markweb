import { useCallback, useState, type DragEvent, type ReactNode } from 'react';
import { Upload } from 'lucide-react';

interface Props {
    children: ReactNode;
    onFileDrop: (files: FileList) => void;
    disabled?: boolean;
}

export default function FileDropZone({ children, onFileDrop, disabled }: Props) {
    const [isDragging, setIsDragging] = useState(false);

    const handleDragOver = useCallback(
        (e: DragEvent) => {
            e.preventDefault();
            if (!disabled) setIsDragging(true);
        },
        [disabled],
    );

    const handleDragLeave = useCallback((e: DragEvent) => {
        e.preventDefault();
        if (e.currentTarget === e.target || !e.currentTarget.contains(e.relatedTarget as Node)) {
            setIsDragging(false);
        }
    }, []);

    const handleDrop = useCallback(
        (e: DragEvent) => {
            e.preventDefault();
            setIsDragging(false);
            if (!disabled && e.dataTransfer.files.length > 0) {
                onFileDrop(e.dataTransfer.files);
            }
        },
        [disabled, onFileDrop],
    );

    return (
        <div
            className="relative flex flex-col"
            style={{ height: 'calc(100vh - var(--topnav-height))' }}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
            {children}
            {isDragging && (
                <div
                    className="pointer-events-none absolute inset-0 z-50 flex items-center justify-center rounded-xl border-2 border-dashed"
                    style={{
                        borderColor: 'var(--scheme-accent)',
                        backgroundColor: 'rgba(var(--scheme-accent-rgb, 0 0 0), 0.08)',
                    }}
                >
                    <div className="flex flex-col items-center gap-2 rounded-xl px-6 py-4" style={{ background: 'var(--glass)' }}>
                        <Upload className="h-8 w-8" style={{ color: 'var(--scheme-accent)' }} />
                        <span className="text-sm font-medium" style={{ color: 'var(--scheme-accent)' }}>
                            Drop files to upload
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
}
