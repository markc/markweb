import { useEffect, useRef, useState } from 'react';
import { FileText } from 'lucide-react';
import type { UserDocument } from '@/types/document';

interface Props {
    documents: UserDocument[];
    inputValue: string;
    cursorPosition: number;
    onSelect: (filename: string) => void;
    visible: boolean;
}

export default function FileMentionAutocomplete({ documents, inputValue, cursorPosition, onSelect, visible }: Props) {
    const [selectedIndex, setSelectedIndex] = useState(0);
    const menuRef = useRef<HTMLDivElement>(null);

    // Extract the partial filename after the last '#'
    const textBeforeCursor = inputValue.slice(0, cursorPosition);
    const hashIndex = textBeforeCursor.lastIndexOf('#');
    const partial = hashIndex >= 0 ? textBeforeCursor.slice(hashIndex + 1).toLowerCase() : '';

    const filtered = documents
        .filter((d) => d.status === 'ready')
        .filter((d) => d.filename.toLowerCase().includes(partial));

    useEffect(() => {
        setSelectedIndex(0);
    }, [partial]);

    if (!visible || filtered.length === 0) return null;

    return (
        <div
            ref={menuRef}
            className="absolute bottom-full left-0 mb-1 max-h-48 w-64 overflow-y-auto rounded-lg border shadow-lg"
            style={{ background: 'var(--glass)', borderColor: 'var(--glass-border)' }}
        >
            {filtered.map((doc, index) => (
                <button
                    key={doc.filename}
                    className={`flex w-full items-center gap-2 px-3 py-2 text-left text-xs transition-colors ${
                        index === selectedIndex ? 'bg-accent/10' : ''
                    }`}
                    style={{ color: 'var(--scheme-fg-primary)' }}
                    onMouseDown={(e) => {
                        e.preventDefault();
                        onSelect(doc.filename);
                    }}
                    onMouseEnter={() => setSelectedIndex(index)}
                >
                    <FileText className="h-3.5 w-3.5 shrink-0" style={{ color: 'var(--scheme-fg-muted)' }} />
                    <span className="truncate">{doc.filename}</span>
                    <span className="ml-auto text-[10px]" style={{ color: 'var(--scheme-fg-muted)' }}>
                        {doc.chunk_count} chunks
                    </span>
                </button>
            ))}
        </div>
    );
}
