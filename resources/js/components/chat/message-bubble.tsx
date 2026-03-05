import { GitFork } from 'lucide-react';
import { createCodePlugin } from '@streamdown/code';
import { Streamdown } from 'streamdown';

const codePlugin = createCodePlugin({ theme: 'github-dark' });

interface LocalMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    isStreaming?: boolean;
    activeTool?: string | null;
}

interface Props {
    message: LocalMessage;
    onFork?: (messageId: string) => void;
}

export default function MessageBubble({ message, onFork }: Props) {
    const isUser = message.role === 'user';

    return (
        <div className={`group flex ${isUser ? 'justify-end' : 'justify-start'}`}>
            <div
                className="relative max-w-[80%] rounded-2xl px-4 py-3"
                style={
                    isUser
                        ? { backgroundColor: 'var(--scheme-accent)', color: 'var(--scheme-accent-fg)' }
                        : { backgroundColor: 'var(--scheme-bg-secondary)', color: 'var(--scheme-fg-primary)' }
                }
            >
                {isUser ? (
                    <div className="whitespace-pre-wrap text-sm leading-relaxed">
                        {message.content}
                    </div>
                ) : (
                    <div className="prose prose-sm dark:prose-invert max-w-none text-sm leading-relaxed">
                        {message.content ? (
                            <Streamdown
                                mode={message.isStreaming ? 'stream' : 'static'}
                                plugins={[codePlugin]}
                                linkSafety={{ enabled: false }}
                            >
                                {message.content}
                            </Streamdown>
                        ) : null}
                        {message.isStreaming && !message.content && !message.activeTool && (
                            <span className="inline-flex gap-1">
                                <span className="animate-pulse">●</span>
                                <span className="animate-pulse" style={{ animationDelay: '0.2s' }}>●</span>
                                <span className="animate-pulse" style={{ animationDelay: '0.4s' }}>●</span>
                            </span>
                        )}
                        {message.activeTool && (
                            <span className="mt-2 flex items-center gap-2 text-xs" style={{ color: 'var(--scheme-fg-muted)' }}>
                                <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                                </svg>
                                Using {message.activeTool}...
                            </span>
                        )}
                        {message.isStreaming && message.content && !message.activeTool && (
                            <span className="ml-1 inline-block h-4 w-1 animate-pulse bg-current" />
                        )}
                    </div>
                )}
                {!isUser && onFork && !message.isStreaming && message.content && (
                    <button
                        onClick={() => onFork(message.id)}
                        className="absolute -right-8 top-1 rounded p-1 opacity-0 transition-opacity hover:bg-accent/10 group-hover:opacity-100"
                        title="Fork from here"
                    >
                        <GitFork className="h-3.5 w-3.5 text-muted-foreground" />
                    </button>
                )}
            </div>
        </div>
    );
}
