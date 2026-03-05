import { useCallback, useEffect, useRef } from 'react';
import TextMessageBubble from './text-message-bubble';
import type { ChatMessage } from '@/types/text-chat';
import { useChatStore } from '@/stores/chatStore';

interface Props {
    messages: ChatMessage[];
    channelId: number;
    currentUserId: number;
    onReply: (messageId: number) => void;
}

export default function MessageListChat({ messages, channelId, currentUserId, onReply }: Props) {
    const bottomRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const { hasMore, isLoading, loadMessages, updateMessage, removeMessage } = useChatStore();
    const shouldAutoScroll = useRef(true);

    // Auto-scroll to bottom on new messages
    useEffect(() => {
        if (shouldAutoScroll.current) {
            bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages.length]);

    // Initial scroll to bottom
    useEffect(() => {
        bottomRef.current?.scrollIntoView();
    }, [channelId]);

    // Infinite scroll upward
    const handleScroll = useCallback(() => {
        const container = containerRef.current;
        if (!container) return;

        // Check if near bottom for auto-scroll
        const nearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 100;
        shouldAutoScroll.current = nearBottom;

        // Load more when scrolled to top
        if (container.scrollTop < 50 && hasMore[channelId] && !isLoading && messages.length > 0) {
            const firstMessageId = messages[0]?.id;
            if (firstMessageId) {
                const prevHeight = container.scrollHeight;
                loadMessages(channelId, firstMessageId).then(() => {
                    // Maintain scroll position after prepending
                    requestAnimationFrame(() => {
                        container.scrollTop = container.scrollHeight - prevHeight;
                    });
                });
            }
        }
    }, [channelId, hasMore, isLoading, messages, loadMessages]);

    const handleEdit = async (messageId: number, content: string) => {
        try {
            const res = await fetch(`/text-chat/messages/${messageId}`, {
                method: 'PATCH',
                credentials: 'same-origin',
                headers: {
                    'Content-Type': 'application/json',
                    'X-XSRF-TOKEN': decodeURIComponent(
                        document.cookie.match(/XSRF-TOKEN=([^;]+)/)?.[1] ?? '',
                    ),
                    Accept: 'application/json',
                },
                body: JSON.stringify({ content }),
            });
            if (res.ok) {
                updateMessage(messageId, { content, updated_at: new Date().toISOString() });
            }
        } catch {
            // silent
        }
    };

    const handleDelete = async (messageId: number) => {
        try {
            const res = await fetch(`/text-chat/messages/${messageId}`, {
                method: 'DELETE',
                credentials: 'same-origin',
                headers: {
                    'X-XSRF-TOKEN': decodeURIComponent(
                        document.cookie.match(/XSRF-TOKEN=([^;]+)/)?.[1] ?? '',
                    ),
                    Accept: 'application/json',
                },
            });
            if (res.ok) {
                removeMessage(channelId, messageId);
            }
        } catch {
            // silent
        }
    };

    const handleReact = async (messageId: number, emoji: string) => {
        try {
            await fetch(`/text-chat/messages/${messageId}/react`, {
                method: 'POST',
                credentials: 'same-origin',
                headers: {
                    'Content-Type': 'application/json',
                    'X-XSRF-TOKEN': decodeURIComponent(
                        document.cookie.match(/XSRF-TOKEN=([^;]+)/)?.[1] ?? '',
                    ),
                    Accept: 'application/json',
                },
                body: JSON.stringify({ emoji }),
            });
        } catch {
            // silent
        }
    };

    // Date separators
    const getDateLabel = (dateStr: string) => {
        const date = new Date(dateStr);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (date.toDateString() === today.toDateString()) return 'Today';
        if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
        return date.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });
    };

    let lastDate = '';

    return (
        <div ref={containerRef} className="flex-1 overflow-y-auto" onScroll={handleScroll}>
            {isLoading && (
                <div className="py-2 text-center text-xs text-muted-foreground">Loading...</div>
            )}

            {messages.map((message) => {
                const messageDate = new Date(message.created_at).toDateString();
                const showDateSep = messageDate !== lastDate;
                lastDate = messageDate;

                return (
                    <div key={message.id}>
                        {showDateSep && (
                            <div className="my-2 flex items-center gap-3 px-4">
                                <div className="h-px flex-1 bg-border" />
                                <span className="text-[11px] font-medium text-muted-foreground">
                                    {getDateLabel(message.created_at)}
                                </span>
                                <div className="h-px flex-1 bg-border" />
                            </div>
                        )}
                        <TextMessageBubble
                            message={message}
                            currentUserId={currentUserId}
                            onReply={onReply}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                            onReact={handleReact}
                        />
                    </div>
                );
            })}
            <div ref={bottomRef} />
        </div>
    );
}
