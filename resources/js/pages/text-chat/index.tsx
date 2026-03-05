import { Head, usePage } from '@inertiajs/react';
import { useLayoutEffect } from 'react';
import { useTheme } from '@/contexts/theme-context';
import ChannelSidebar from '@/components/chat/channel-sidebar';
import type { ChatChannel } from '@/types/text-chat';
import type { PageProps } from '@/types';
import { useChatStore } from '@/stores/chatStore';

interface Props {
    channels: ChatChannel[];
}

export default function TextChatIndex() {
    const { channels } = usePage<PageProps & Props>().props;
    const { setNoPadding, setPanel } = useTheme();
    const setChannels = useChatStore((s) => s.setChannels);

    useLayoutEffect(() => {
        setNoPadding(true);
        setPanel('left', 6); // L6 channels panel
        return () => setNoPadding(false);
    }, [setNoPadding, setPanel]);

    useLayoutEffect(() => {
        setChannels(channels);
    }, [channels, setChannels]);

    return (
        <>
            <Head title="Text Chat" />
            <div className="flex h-[calc(100vh-3rem)]">
                <div className="w-60 shrink-0 border-r border-border">
                    <ChannelSidebar channels={channels} activeSlug={null} />
                </div>
                <div className="flex flex-1 items-center justify-center text-muted-foreground">
                    <p className="text-sm">Select a channel to start chatting</p>
                </div>
            </div>
        </>
    );
}
