import { Send } from 'lucide-react';
import { useCallback, useRef, useState } from 'react';
import { useChatStore } from '@/stores/chatStore';

interface Props {
    channelSlug: string;
    channelId: number;
    parentId?: number;
    placeholder?: string;
}

export default function MessageComposer({ channelSlug, channelId, parentId, placeholder }: Props) {
    const [content, setContent] = useState('');
    const [isSending, setIsSending] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const typingTimeoutRef = useRef<ReturnType<typeof setTimeout>>();
    const sendMessage = useChatStore((s) => s.sendMessage);

    const handleSend = useCallback(async () => {
        const trimmed = content.trim();
        if (!trimmed || isSending) return;

        setIsSending(true);
        setContent('');

        await sendMessage(channelSlug, trimmed, parentId);

        setIsSending(false);
        textareaRef.current?.focus();
    }, [content, isSending, channelSlug, parentId, sendMessage]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setContent(e.target.value);

        // Auto-resize
        const el = e.target;
        el.style.height = 'auto';
        el.style.height = Math.min(el.scrollHeight, 200) + 'px';

        // Broadcast typing (debounced)
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => {
            fetch(`/text-chat/${channelSlug}/typing`, {
                method: 'POST',
                credentials: 'same-origin',
                headers: {
                    'Content-Type': 'application/json',
                    'X-XSRF-TOKEN': decodeURIComponent(
                        document.cookie.match(/XSRF-TOKEN=([^;]+)/)?.[1] ?? '',
                    ),
                },
            }).catch(() => {});
        }, 300);
    };

    return (
        <div className="border-t border-border p-3">
            <div className="flex items-end gap-2 rounded-lg border border-border bg-background p-2">
                <textarea
                    ref={textareaRef}
                    value={content}
                    onChange={handleInput}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder ?? 'Type a message...'}
                    className="max-h-[200px] min-h-[36px] flex-1 resize-none bg-transparent px-1 text-sm outline-none"
                    rows={1}
                    disabled={isSending}
                />
                <button
                    onClick={handleSend}
                    disabled={!content.trim() || isSending}
                    className="rounded-md p-2 text-[var(--scheme-accent)] transition-colors hover:bg-[var(--scheme-accent)]/10 disabled:opacity-40"
                >
                    <Send className="h-4 w-4" />
                </button>
            </div>
        </div>
    );
}
