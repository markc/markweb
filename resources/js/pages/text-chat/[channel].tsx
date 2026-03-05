import { Head, usePage } from '@inertiajs/react';
import { useEffect, useLayoutEffect, useRef } from 'react';
import { useTheme } from '@/contexts/theme-context';
import ChannelSidebar from '@/components/chat/channel-sidebar';
import MessageListChat from '@/components/chat/message-list-chat';
import MessageComposer from '@/components/chat/message-composer';
import ThreadPanel from '@/components/chat/thread-panel';
import { useChatStore } from '@/stores/chatStore';
import type { ChatChannel, ChatMessage, TypingUser } from '@/types/text-chat';
import type { PageProps } from '@/types';

interface Props {
    channels: ChatChannel[];
    activeChannel: ChatChannel;
    initialMessages: ChatMessage[];
}

export default function TextChatChannel() {
    const { channels, activeChannel, initialMessages, auth } = usePage<PageProps & Props>().props;
    const { setNoPadding, setPanel } = useTheme();
    const currentUserId = auth.user.id;

    const {
        messages,
        setChannels,
        setActiveChannel,
        setInitialMessages,
        addMessage,
        updateMessage,
        removeMessage,
        incrementUnread,
        activeThreadId,
        openThread,
        typingUsers,
        addTypingUser,
        removeTypingUser,
        setOnlineUsers,
    } = useChatStore();

    const channelMessages = messages[activeChannel.id] || [];
    const channelTyping = typingUsers[activeChannel.id] || [];
    const subscribedRef = useRef<number | null>(null);

    useLayoutEffect(() => {
        setNoPadding(true);
        setPanel('left', 6); // L6 channels panel
        return () => setNoPadding(false);
    }, [setNoPadding, setPanel]);

    // Set channels and initial messages
    useLayoutEffect(() => {
        setChannels(channels);
        setActiveChannel(activeChannel.slug);
        setInitialMessages(activeChannel.id, initialMessages);
    }, [channels, activeChannel, initialMessages, setChannels, setActiveChannel, setInitialMessages]);

    // Subscribe to Reverb channels
    useEffect(() => {
        if (subscribedRef.current === activeChannel.id) return;
        subscribedRef.current = activeChannel.id;

        // Private channel for message events
        const privateChannel = window.Echo.private(`chat.channel.${activeChannel.id}`);

        privateChannel.listen('.message.sent', (data: ChatMessage) => {
            addMessage(data.channel_id, data);
            if (data.channel_id !== activeChannel.id) {
                incrementUnread(data.channel_id);
            }
        });

        privateChannel.listen('.message.updated', (data: { id: number; channel_id: number; content: string; updated_at: string }) => {
            updateMessage(data.id, { content: data.content, updated_at: data.updated_at });
        });

        privateChannel.listen('.message.deleted', (data: { id: number; channel_id: number }) => {
            removeMessage(data.channel_id, data.id);
        });

        // Presence channel for typing and online users
        const presenceChannel = window.Echo.join(`presence-chat.channel.${activeChannel.id}`);

        presenceChannel
            .here((users: { id: number; name: string }[]) => {
                setOnlineUsers(activeChannel.id, users);
            })
            .joining((user: { id: number; name: string }) => {
                setOnlineUsers(activeChannel.id, [
                    ...(useChatStore.getState().onlineUsers[activeChannel.id] || []),
                    user,
                ]);
            })
            .leaving((user: { id: number; name: string }) => {
                setOnlineUsers(
                    activeChannel.id,
                    (useChatStore.getState().onlineUsers[activeChannel.id] || []).filter(
                        (u) => u.id !== user.id,
                    ),
                );
            })
            .listen('.user.typing', (data: { user_id: number; user_name: string; channel_id: number }) => {
                if (data.user_id === currentUserId) return;
                const typingUser: TypingUser = {
                    id: data.user_id,
                    name: data.user_name,
                    started_at: Date.now(),
                };
                addTypingUser(data.channel_id, typingUser);
                // Auto-clear after 5s
                setTimeout(() => removeTypingUser(data.channel_id, data.user_id), 5000);
            });

        return () => {
            window.Echo.leave(`chat.channel.${activeChannel.id}`);
            window.Echo.leave(`presence-chat.channel.${activeChannel.id}`);
            subscribedRef.current = null;
        };
    }, [activeChannel.id, currentUserId, addMessage, updateMessage, removeMessage, incrementUnread, addTypingUser, removeTypingUser, setOnlineUsers]);

    // Also subscribe to private channels for other member channels (unread counts)
    useEffect(() => {
        const otherChannels = channels.filter((c) => c.id !== activeChannel.id);
        const cleanups: (() => void)[] = [];

        otherChannels.forEach((channel) => {
            const ch = window.Echo.private(`chat.channel.${channel.id}`);
            ch.listen('.message.sent', (data: ChatMessage) => {
                addMessage(data.channel_id, data);
                incrementUnread(data.channel_id);
            });
            cleanups.push(() => window.Echo.leave(`chat.channel.${channel.id}`));
        });

        return () => cleanups.forEach((fn) => fn());
    }, [channels, activeChannel.id, addMessage, incrementUnread]);

    const threadMessage = activeThreadId
        ? channelMessages.find((m) => m.id === activeThreadId) || null
        : null;

    return (
        <>
            <Head title={`#${activeChannel.name}`} />
            <div className="flex h-[calc(100vh-3rem)]">
                {/* Channel sidebar */}
                <div className="w-60 shrink-0 border-r border-border">
                    <ChannelSidebar channels={channels} activeSlug={activeChannel.slug} />
                </div>

                {/* Main chat area */}
                <div className="flex min-w-0 flex-1 flex-col">
                    {/* Channel header */}
                    <div className="flex items-center gap-3 border-b border-border px-4 py-2.5">
                        <h2 className="text-sm font-semibold">#{activeChannel.name}</h2>
                        {activeChannel.description && (
                            <span className="text-xs text-muted-foreground">{activeChannel.description}</span>
                        )}
                        <span className="ml-auto text-xs text-muted-foreground">
                            {activeChannel.member_count} members
                        </span>
                    </div>

                    {/* Messages */}
                    <MessageListChat
                        messages={channelMessages}
                        channelId={activeChannel.id}
                        currentUserId={currentUserId}
                        onReply={openThread}
                    />

                    {/* Typing indicator */}
                    {channelTyping.length > 0 && (
                        <div className="px-4 py-1 text-xs text-muted-foreground">
                            {channelTyping.map((u) => u.name).join(', ')}{' '}
                            {channelTyping.length === 1 ? 'is' : 'are'} typing
                            <span className="inline-flex gap-0.5 ml-1">
                                <span className="animate-bounce" style={{ animationDelay: '0ms' }}>.</span>
                                <span className="animate-bounce" style={{ animationDelay: '150ms' }}>.</span>
                                <span className="animate-bounce" style={{ animationDelay: '300ms' }}>.</span>
                            </span>
                        </div>
                    )}

                    {/* Composer */}
                    <MessageComposer
                        channelSlug={activeChannel.slug}
                        channelId={activeChannel.id}
                        placeholder={`Message #${activeChannel.name}`}
                    />
                </div>

                {/* Thread panel */}
                {threadMessage && (
                    <ThreadPanel
                        parentMessage={threadMessage}
                        channelSlug={activeChannel.slug}
                        channelId={activeChannel.id}
                        currentUserId={currentUserId}
                    />
                )}
            </div>
        </>
    );
}
