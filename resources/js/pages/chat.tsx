import { Head, usePage } from '@inertiajs/react';
import { useLayoutEffect } from 'react';
import ChatInterface from '@/components/chat/chat-interface';
import { useTheme } from '@/contexts/theme-context';
import type { AgentSession, AvailableModels, PageProps } from '@/types';

interface Props {
    session: AgentSession | null;
    availableModels: AvailableModels;
}

export default function Chat() {
    const { session, availableModels } = usePage<PageProps & Props>().props;
    const { setNoPadding, setPanel } = useTheme();
    const title = session?.title ?? 'New Chat';

    useLayoutEffect(() => {
        setNoPadding(true);
        setPanel('left', 1);
        return () => setNoPadding(false);
    }, [setNoPadding, setPanel]);

    return (
        <>
            <Head title={title} />
            <ChatInterface session={session} availableModels={availableModels} />
        </>
    );
}
