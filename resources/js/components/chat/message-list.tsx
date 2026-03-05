import { useEffect, useRef } from 'react';
import MessageBubble from './message-bubble';

interface LocalMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    isStreaming?: boolean;
}

interface Props {
    messages: LocalMessage[];
    onFork?: (messageId: string) => void;
}

export default function MessageList({ messages, onFork }: Props) {
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    if (messages.length === 0) {
        return (
            <div className="flex flex-1 items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-semibold" style={{ color: 'var(--scheme-fg-muted)', opacity: 0.5 }}>
                        MarkWeb
                    </h2>
                    <p className="mt-2 text-sm" style={{ color: 'var(--scheme-fg-muted)' }}>
                        Start a conversation with your AI agent
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 overflow-y-auto px-4 py-6">
            <div className="mx-auto max-w-3xl space-y-4">
                {messages.map((msg) => (
                    <MessageBubble key={msg.id} message={msg} onFork={onFork} />
                ))}
                <div ref={bottomRef} />
            </div>
        </div>
    );
}
