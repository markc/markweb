import { Link, usePage } from '@inertiajs/react';
import { Hash, Lock, MessageCircle } from 'lucide-react';
import { useChatStore } from '@/stores/chatStore';

export default function ChannelsPanel() {
    const { url: pageUrl } = usePage();
    const channels = useChatStore((s) => s.channels);
    const unreadCounts = useChatStore((s) => s.unreadCounts);

    const ChannelIcon = ({ type }: { type: string }) => {
        switch (type) {
            case 'private': return <Lock className="h-3.5 w-3.5 shrink-0" />;
            case 'dm': return <MessageCircle className="h-3.5 w-3.5 shrink-0" />;
            default: return <Hash className="h-3.5 w-3.5 shrink-0" />;
        }
    };

    return (
        <nav className="flex flex-col py-2">
            <div className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Text Chat
            </div>
            {channels.length === 0 ? (
                <Link
                    href="/text-chat"
                    className="flex items-center gap-3 px-3 py-2 text-sm text-muted-foreground hover:text-foreground"
                >
                    <Hash className="h-4 w-4" />
                    Open Text Chat
                </Link>
            ) : (
                channels.map((channel) => {
                    const href = `/text-chat/${channel.slug}`;
                    const isActive = pageUrl.startsWith(href);
                    const unread = unreadCounts[channel.id] || 0;

                    return (
                        <Link
                            key={channel.id}
                            href={href}
                            className={`flex items-center gap-3 border-l-[3px] px-3 py-2 text-sm transition-colors ${
                                isActive
                                    ? 'border-[var(--scheme-accent)] bg-background text-[var(--scheme-accent)]'
                                    : 'border-transparent hover:border-muted-foreground hover:bg-background'
                            }`}
                            style={{ color: isActive ? 'var(--scheme-accent)' : undefined }}
                        >
                            <ChannelIcon type={channel.type} />
                            <span className="flex-1 truncate">{channel.name}</span>
                            {unread > 0 && (
                                <span className="rounded-full bg-[var(--scheme-accent)] px-1.5 py-0.5 text-[10px] font-bold text-white">
                                    {unread}
                                </span>
                            )}
                        </Link>
                    );
                })
            )}
        </nav>
    );
}
