import { usePage } from '@inertiajs/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AgentSession, AvailableModels, TextDeltaEvent, StreamEndEvent, StreamErrorEvent } from '@/types';
import type { UserDocument, DocumentProcessedEvent } from '@/types/document';
import { send } from '@/routes/chat';
import MessageList from './message-list';
import MessageInput from './message-input';
import FileDropZone from './file-drop-zone';
import DocumentChips from './document-chips';

/** Convert session_key to a Pusher-safe channel name (colons → dots) */
function channelName(sessionKey: string): string {
    return `chat.session.${sessionKey.replace(/:/g, '.')}`;
}

interface Props {
    session: AgentSession | null;
    availableModels: AvailableModels;
}

interface LocalMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    isStreaming?: boolean;
    activeTool?: string | null;
}

function getCsrfToken(): string {
    const match = document.cookie.match(/XSRF-TOKEN=([^;]+)/);
    return match ? decodeURIComponent(match[1]) : '';
}

export default function ChatInterface({ session, availableModels }: Props) {
    const { auth } = usePage().props;
    const [messages, setMessages] = useState<LocalMessage[]>([]);
    const [sessionKey, setSessionKey] = useState<string | null>(session?.session_key ?? null);
    const [selectedModel, setSelectedModel] = useState<string>(
        session?.model ?? 'claude-sonnet-4-5-20250929'
    );
    const [selectedProvider, setSelectedProvider] = useState<string>(
        session?.provider ?? 'anthropic'
    );
    const [systemPrompt, setSystemPrompt] = useState<string>(session?.system_prompt ?? '');
    const [isStreaming, setIsStreaming] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [uploadedDocs, setUploadedDocs] = useState<UserDocument[]>([]);

    // Track the accumulated text for the current streaming message
    const accumulatedRef = useRef('');
    const assistantIdRef = useRef<string | null>(null);
    const subscribedChannelRef = useRef<string | null>(null);

    // Load existing messages when session changes
    useEffect(() => {
        if (session?.messages) {
            setMessages(
                session.messages.map((m) => ({
                    id: String(m.id),
                    role: m.role as 'user' | 'assistant',
                    content: m.content,
                }))
            );
        } else {
            setMessages([]);
        }
        setSessionKey(session?.session_key ?? null);
    }, [session?.id]);

    // Subscribe to session channel when sessionKey is set
    useEffect(() => {
        if (!sessionKey) return;

        // Don't re-subscribe to the same channel
        if (subscribedChannelRef.current === sessionKey) return;

        // Leave previous channel if any
        if (subscribedChannelRef.current) {
            window.Echo.leave(channelName(subscribedChannelRef.current));
        }

        const channel = window.Echo.private(channelName(sessionKey));

        channel.listen('.stream_start', () => {
            const id = `stream-${Date.now()}`;
            assistantIdRef.current = id;
            accumulatedRef.current = '';
            setIsSending(false);
            setIsStreaming(true);
            setMessages((prev) => [
                ...prev,
                { id, role: 'assistant', content: '', isStreaming: true },
            ]);
        });

        channel.listen('.text_delta', (e: TextDeltaEvent) => {
            accumulatedRef.current += e.delta;
            const text = accumulatedRef.current;
            const id = assistantIdRef.current;
            if (id) {
                setMessages((prev) =>
                    prev.map((m) => (m.id === id ? { ...m, content: text } : m))
                );
            }
        });

        channel.listen('.tool_call', (e: { tool_name: string }) => {
            const id = assistantIdRef.current;
            if (id) {
                setMessages((prev) =>
                    prev.map((m) => (m.id === id ? { ...m, activeTool: e.tool_name } : m))
                );
            }
        });

        channel.listen('.tool_result', () => {
            const id = assistantIdRef.current;
            if (id) {
                setMessages((prev) =>
                    prev.map((m) => (m.id === id ? { ...m, activeTool: null } : m))
                );
            }
        });

        channel.listen('.stream_end', (_e: StreamEndEvent) => {
            const id = assistantIdRef.current;
            if (id) {
                setMessages((prev) =>
                    prev.map((m) => (m.id === id ? { ...m, isStreaming: false } : m))
                );
            }
            assistantIdRef.current = null;
            setIsStreaming(false);
        });

        channel.listen('.error', (e: StreamErrorEvent) => {
            setIsSending(false);
            const id = assistantIdRef.current;
            if (id) {
                setMessages((prev) =>
                    prev.map((m) =>
                        m.id === id
                            ? { ...m, content: `Error: ${e.error}`, isStreaming: false }
                            : m
                    )
                );
            } else {
                // Error without a streaming message — append as new message
                setMessages((prev) => [
                    ...prev,
                    {
                        id: `error-${Date.now()}`,
                        role: 'assistant',
                        content: `Error: ${e.error}`,
                    },
                ]);
            }
            assistantIdRef.current = null;
            setIsStreaming(false);
        });

        subscribedChannelRef.current = sessionKey;

        return () => {
            window.Echo.leave(channelName(sessionKey));
            subscribedChannelRef.current = null;
        };
    }, [sessionKey]);

    // Load user documents and subscribe to document processing events
    useEffect(() => {
        const userId = (auth as any)?.user?.id;
        if (!userId) return;

        // Fetch existing documents
        fetch('/chat/documents', {
            headers: { Accept: 'application/json', 'X-XSRF-TOKEN': getCsrfToken() },
        })
            .then((r) => r.ok ? r.json() : [])
            .then((docs: UserDocument[]) => setUploadedDocs(docs))
            .catch(() => {});

        // Listen for processing completion
        const channel = window.Echo.private(`documents.user.${userId}`);
        channel.listen('.document.processed', (e: DocumentProcessedEvent) => {
            setUploadedDocs((prev) =>
                prev.map((d) =>
                    d.filename === e.filename
                        ? { ...d, status: e.status, chunk_count: e.chunk_count }
                        : d,
                ),
            );
        });

        return () => {
            window.Echo.leave(`documents.user.${userId}`);
        };
    }, [(auth as any)?.user?.id]);

    const handleFileDrop = useCallback(
        async (files: FileList) => {
            for (const file of Array.from(files)) {
                const formData = new FormData();
                formData.append('file', file);

                setUploadedDocs((prev) => [
                    {
                        filename: file.name,
                        mime_type: file.type,
                        file_size: file.size,
                        status: 'processing',
                        chunk_count: 0,
                        uploaded_at: new Date().toISOString(),
                    },
                    ...prev,
                ]);

                try {
                    await fetch('/chat/documents', {
                        method: 'POST',
                        headers: { 'X-XSRF-TOKEN': getCsrfToken(), Accept: 'application/json' },
                        body: formData,
                    });
                } catch (err) {
                    console.error('Upload failed:', err);
                    setUploadedDocs((prev) =>
                        prev.map((d) =>
                            d.filename === file.name ? { ...d, status: 'failed' } : d,
                        ),
                    );
                }
            }
        },
        [],
    );

    const handleRemoveDoc = useCallback(async (filename: string) => {
        await fetch(`/chat/documents/${encodeURIComponent(filename)}`, {
            method: 'DELETE',
            headers: { 'X-XSRF-TOKEN': getCsrfToken(), Accept: 'application/json' },
        });
        setUploadedDocs((prev) => prev.filter((d) => d.filename !== filename));
    }, []);

    const handleSend = useCallback(
        async (content: string) => {
            if (isStreaming || isSending || !content.trim()) return;

            // Add user message to UI immediately
            const userMsg: LocalMessage = {
                id: `local-${Date.now()}`,
                role: 'user',
                content: content.trim(),
            };
            setMessages((prev) => [...prev, userMsg]);
            setIsSending(true);

            try {
                const response = await fetch(send.url(), {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-XSRF-TOKEN': getCsrfToken(),
                        Accept: 'application/json',
                    },
                    body: JSON.stringify({
                        message: content.trim(),
                        session_key: sessionKey,
                        model: selectedModel,
                        provider: selectedProvider,
                        system_prompt: systemPrompt || undefined,
                    }),
                });

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}`);
                }

                const data = await response.json();
                // Server always returns the session_key (generated if new)
                if (data.session_key && data.session_key !== sessionKey) {
                    setSessionKey(data.session_key);
                }
            } catch (error) {
                console.error('Send error:', error);
                setIsSending(false);
                setMessages((prev) => [
                    ...prev,
                    {
                        id: `error-${Date.now()}`,
                        role: 'assistant',
                        content: 'Error: Failed to send message.',
                    },
                ]);
            }
        },
        [isStreaming, isSending, sessionKey, selectedModel, selectedProvider, systemPrompt]
    );

    const handleFork = useCallback(
        async (messageId: string) => {
            if (!sessionKey) return;

            // Find the session ID from URL (if viewing an existing session)
            const match = window.location.pathname.match(/\/chat\/(\d+)/);
            if (!match) return;

            const sessionId = match[1];
            try {
                const response = await fetch(`/chat/${sessionId}/fork`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-XSRF-TOKEN': getCsrfToken(),
                        Accept: 'application/json',
                    },
                    body: JSON.stringify({ from_message: messageId }),
                });

                if (response.ok) {
                    const data = await response.json();
                    window.location.href = `/chat/${data.session_id}`;
                }
            } catch (err) {
                console.error('Fork failed:', err);
            }
        },
        [sessionKey],
    );

    return (
        <FileDropZone onFileDrop={handleFileDrop} disabled={isStreaming}>
            <MessageList messages={messages} onFork={handleFork} />
            <DocumentChips documents={uploadedDocs.filter((d) => d.status === 'processing')} />
            <MessageInput
                onSend={handleSend}
                isStreaming={isStreaming}
                isSending={isSending}
                selectedModel={selectedModel}
                selectedProvider={selectedProvider}
                onModelChange={(model, provider) => {
                    setSelectedModel(model);
                    setSelectedProvider(provider);
                }}
                availableModels={availableModels}
                systemPrompt={systemPrompt}
                onSystemPromptChange={setSystemPrompt}
                onFileUpload={handleFileDrop}
                documents={uploadedDocs}
            />
        </FileDropZone>
    );
}
