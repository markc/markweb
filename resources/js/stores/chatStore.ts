import { create } from 'zustand';
import type { ChatChannel, ChatMessage, PresenceUser, TypingUser } from '@/types/text-chat';

interface ChatState {
    channels: ChatChannel[];
    activeChannelSlug: string | null;
    messages: Record<number, ChatMessage[]>;
    hasMore: Record<number, boolean>;
    isLoading: boolean;
    onlineUsers: Record<number, PresenceUser[]>;
    typingUsers: Record<number, TypingUser[]>;
    unreadCounts: Record<number, number>;
    activeThreadId: number | null;
    threadMessages: ChatMessage[];

    setChannels: (channels: ChatChannel[]) => void;
    setActiveChannel: (slug: string) => void;
    setInitialMessages: (channelId: number, messages: ChatMessage[]) => void;
    loadMessages: (channelId: number, cursor?: number) => Promise<void>;
    sendMessage: (channelSlug: string, content: string, parentId?: number) => Promise<ChatMessage | null>;
    addMessage: (channelId: number, message: ChatMessage) => void;
    updateMessage: (messageId: number, data: Partial<ChatMessage>) => void;
    removeMessage: (channelId: number, messageId: number) => void;
    markRead: (channelSlug: string, channelId: number) => void;
    incrementUnread: (channelId: number) => void;

    setOnlineUsers: (channelId: number, users: PresenceUser[]) => void;
    addTypingUser: (channelId: number, user: TypingUser) => void;
    removeTypingUser: (channelId: number, userId: number) => void;

    openThread: (messageId: number) => void;
    closeThread: () => void;
    loadThreadMessages: (messageId: number) => Promise<void>;
}

export const useChatStore = create<ChatState>((set, get) => ({
    channels: [],
    activeChannelSlug: null,
    messages: {},
    hasMore: {},
    isLoading: false,
    onlineUsers: {},
    typingUsers: {},
    unreadCounts: {},
    activeThreadId: null,
    threadMessages: [],

    setChannels: (channels) => {
        const unreadCounts: Record<number, number> = {};
        channels.forEach((c) => {
            unreadCounts[c.id] = c.unread_count;
        });
        set({ channels, unreadCounts });
    },

    setActiveChannel: (slug) => set({ activeChannelSlug: slug }),

    setInitialMessages: (channelId, messages) =>
        set((state) => ({
            messages: { ...state.messages, [channelId]: messages },
            hasMore: { ...state.hasMore, [channelId]: messages.length >= 50 },
        })),

    loadMessages: async (channelId, cursor?) => {
        const state = get();
        if (state.isLoading) return;

        const channel = state.channels.find((c) => c.id === channelId);
        if (!channel) return;

        set({ isLoading: true });
        try {
            const params = new URLSearchParams();
            if (cursor) params.set('cursor', String(cursor));

            const res = await fetch(`/text-chat/${channel.slug}/messages?${params}`, {
                credentials: 'same-origin',
            });
            const data = await res.json();

            set((state) => ({
                messages: {
                    ...state.messages,
                    [channelId]: [...data.messages, ...(state.messages[channelId] || [])],
                },
                hasMore: { ...state.hasMore, [channelId]: data.has_more },
                isLoading: false,
            }));
        } catch {
            set({ isLoading: false });
        }
    },

    sendMessage: async (channelSlug, content, parentId?) => {
        try {
            const res = await fetch(`/text-chat/${channelSlug}/messages`, {
                method: 'POST',
                credentials: 'same-origin',
                headers: {
                    'Content-Type': 'application/json',
                    'X-XSRF-TOKEN': decodeURIComponent(
                        document.cookie.match(/XSRF-TOKEN=([^;]+)/)?.[1] ?? '',
                    ),
                    Accept: 'application/json',
                },
                body: JSON.stringify({ content, parent_id: parentId }),
            });

            if (!res.ok) return null;

            const message: ChatMessage = await res.json();

            // Optimistic add for the sender
            if (parentId) {
                set((state) => ({
                    threadMessages: [...state.threadMessages, message],
                }));
            } else {
                get().addMessage(message.channel_id, message);
            }

            return message;
        } catch {
            return null;
        }
    },

    addMessage: (channelId, message) =>
        set((state) => {
            const existing = state.messages[channelId] || [];
            // Avoid duplicates
            if (existing.some((m) => m.id === message.id)) return state;
            return {
                messages: { ...state.messages, [channelId]: [...existing, message] },
            };
        }),

    updateMessage: (messageId, data) =>
        set((state) => {
            const newMessages = { ...state.messages };
            for (const channelId of Object.keys(newMessages)) {
                newMessages[Number(channelId)] = newMessages[Number(channelId)].map((m) =>
                    m.id === messageId ? { ...m, ...data } : m,
                );
            }
            return { messages: newMessages };
        }),

    removeMessage: (channelId, messageId) =>
        set((state) => ({
            messages: {
                ...state.messages,
                [channelId]: (state.messages[channelId] || []).map((m) =>
                    m.id === messageId ? { ...m, deleted_at: new Date().toISOString(), content: '' } : m,
                ),
            },
        })),

    markRead: async (channelSlug, channelId) => {
        set((state) => ({
            unreadCounts: { ...state.unreadCounts, [channelId]: 0 },
        }));
        // Server-side mark-read happens via Inertia page load (show action)
    },

    incrementUnread: (channelId) =>
        set((state) => ({
            unreadCounts: {
                ...state.unreadCounts,
                [channelId]: (state.unreadCounts[channelId] || 0) + 1,
            },
        })),

    setOnlineUsers: (channelId, users) =>
        set((state) => ({
            onlineUsers: { ...state.onlineUsers, [channelId]: users },
        })),

    addTypingUser: (channelId, user) =>
        set((state) => {
            const existing = state.typingUsers[channelId] || [];
            if (existing.some((u) => u.id === user.id)) return state;
            return {
                typingUsers: { ...state.typingUsers, [channelId]: [...existing, user] },
            };
        }),

    removeTypingUser: (channelId, userId) =>
        set((state) => ({
            typingUsers: {
                ...state.typingUsers,
                [channelId]: (state.typingUsers[channelId] || []).filter((u) => u.id !== userId),
            },
        })),

    openThread: (messageId) => {
        set({ activeThreadId: messageId, threadMessages: [] });
        get().loadThreadMessages(messageId);
    },

    closeThread: () => set({ activeThreadId: null, threadMessages: [] }),

    loadThreadMessages: async (messageId) => {
        // Find which channel this message belongs to
        const state = get();
        let channelSlug: string | null = null;
        let channelId: number | null = null;

        for (const [cId, msgs] of Object.entries(state.messages)) {
            const msg = msgs.find((m) => m.id === messageId);
            if (msg) {
                channelId = Number(cId);
                const channel = state.channels.find((c) => c.id === channelId);
                channelSlug = channel?.slug || null;
                break;
            }
        }

        if (!channelSlug) return;

        try {
            const res = await fetch(`/text-chat/${channelSlug}/messages?parent_id=${messageId}`, {
                credentials: 'same-origin',
            });
            const data = await res.json();
            set({ threadMessages: data.messages || [] });
        } catch {
            // silent
        }
    },
}));
