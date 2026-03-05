import { Link } from '@inertiajs/react';
import { Hash, Lock, MessageCircle, Plus } from 'lucide-react';
import { useState } from 'react';
import type { ChatChannel } from '@/types/text-chat';
import { useChatStore } from '@/stores/chatStore';

interface Props {
    channels: ChatChannel[];
    activeSlug: string | null;
}

export default function ChannelSidebar({ channels, activeSlug }: Props) {
    const [showCreate, setShowCreate] = useState(false);
    const [newName, setNewName] = useState('');
    const [newType, setNewType] = useState<'public' | 'private'>('public');
    const unreadCounts = useChatStore((s) => s.unreadCounts);

    const publicChannels = channels.filter((c) => c.type === 'public');
    const privateChannels = channels.filter((c) => c.type === 'private');
    const dmChannels = channels.filter((c) => c.type === 'dm');

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newName.trim()) return;

        const res = await fetch('/text-chat/channels', {
            method: 'POST',
            credentials: 'same-origin',
            headers: {
                'Content-Type': 'application/json',
                'X-XSRF-TOKEN': decodeURIComponent(
                    document.cookie.match(/XSRF-TOKEN=([^;]+)/)?.[1] ?? '',
                ),
                Accept: 'application/json',
            },
            body: JSON.stringify({ name: newName, type: newType }),
        });

        if (res.redirected) {
            window.location.href = res.url;
        }

        setShowCreate(false);
        setNewName('');
    };

    const ChannelIcon = ({ type }: { type: string }) => {
        switch (type) {
            case 'private':
                return <Lock className="h-3.5 w-3.5 shrink-0" />;
            case 'dm':
                return <MessageCircle className="h-3.5 w-3.5 shrink-0" />;
            default:
                return <Hash className="h-3.5 w-3.5 shrink-0" />;
        }
    };

    const ChannelItem = ({ channel }: { channel: ChatChannel }) => {
        const isActive = channel.slug === activeSlug;
        const unread = unreadCounts[channel.id] || 0;

        return (
            <Link
                href={`/text-chat/${channel.slug}`}
                className={`flex items-center gap-2 rounded px-2 py-1.5 text-sm transition-colors ${
                    isActive
                        ? 'bg-[var(--scheme-accent)]/15 text-[var(--scheme-accent)]'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
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
    };

    return (
        <div className="flex h-full flex-col">
            <div className="flex items-center justify-between border-b border-border px-3 py-2">
                <h2 className="text-sm font-semibold">Channels</h2>
                <button
                    onClick={() => setShowCreate(!showCreate)}
                    className="rounded p-1 text-muted-foreground transition-colors hover:text-foreground"
                >
                    <Plus className="h-4 w-4" />
                </button>
            </div>

            {showCreate && (
                <form onSubmit={handleCreate} className="border-b border-border p-3">
                    <input
                        type="text"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        placeholder="Channel name"
                        className="mb-2 w-full rounded border border-border bg-background px-2 py-1 text-sm"
                        autoFocus
                    />
                    <div className="flex items-center gap-2">
                        <select
                            value={newType}
                            onChange={(e) => setNewType(e.target.value as 'public' | 'private')}
                            className="rounded border border-border bg-background px-2 py-1 text-xs"
                        >
                            <option value="public">Public</option>
                            <option value="private">Private</option>
                        </select>
                        <button
                            type="submit"
                            className="rounded bg-[var(--scheme-accent)] px-3 py-1 text-xs text-white"
                        >
                            Create
                        </button>
                    </div>
                </form>
            )}

            <div className="flex-1 overflow-y-auto p-2">
                {publicChannels.length > 0 && (
                    <div className="mb-3">
                        <div className="mb-1 px-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                            Public
                        </div>
                        {publicChannels.map((c) => (
                            <ChannelItem key={c.id} channel={c} />
                        ))}
                    </div>
                )}
                {privateChannels.length > 0 && (
                    <div className="mb-3">
                        <div className="mb-1 px-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                            Private
                        </div>
                        {privateChannels.map((c) => (
                            <ChannelItem key={c.id} channel={c} />
                        ))}
                    </div>
                )}
                {dmChannels.length > 0 && (
                    <div>
                        <div className="mb-1 px-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                            Direct Messages
                        </div>
                        {dmChannels.map((c) => (
                            <ChannelItem key={c.id} channel={c} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
