import { MessageSquare, Pencil, Smile, Trash2 } from 'lucide-react';
import { useState } from 'react';
import type { ChatMessage } from '@/types/text-chat';

interface Props {
    message: ChatMessage;
    currentUserId: number;
    onReply?: (messageId: number) => void;
    onEdit?: (messageId: number, content: string) => void;
    onDelete?: (messageId: number) => void;
    onReact?: (messageId: number, emoji: string) => void;
    showThreadButton?: boolean;
}

const QUICK_EMOJIS = ['\u{1F44D}', '\u{2764}\u{FE0F}', '\u{1F604}', '\u{1F914}', '\u{1F44F}', '\u{1F680}'];

export default function TextMessageBubble({
    message,
    currentUserId,
    onReply,
    onEdit,
    onDelete,
    onReact,
    showThreadButton = true,
}: Props) {
    const [showActions, setShowActions] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState(message.content);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);

    const isOwn = message.user_id === currentUserId;
    const isDeleted = !!message.deleted_at;
    const isEdited = message.updated_at !== message.created_at && !isDeleted;
    const time = new Date(message.created_at).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
    });

    const handleEdit = () => {
        if (editContent.trim() && editContent !== message.content) {
            onEdit?.(message.id, editContent);
        }
        setIsEditing(false);
    };

    const handleEditKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleEdit();
        }
        if (e.key === 'Escape') {
            setIsEditing(false);
            setEditContent(message.content);
        }
    };

    if (message.type === 'system') {
        return (
            <div className="py-1 text-center text-xs text-muted-foreground italic">
                {message.content}
            </div>
        );
    }

    return (
        <div
            className="group relative flex gap-3 px-4 py-1.5 hover:bg-muted/50"
            onMouseEnter={() => setShowActions(true)}
            onMouseLeave={() => {
                setShowActions(false);
                setShowEmojiPicker(false);
            }}
        >
            <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--scheme-accent)]/20 text-xs font-bold text-[var(--scheme-accent)]">
                {message.user?.name?.charAt(0).toUpperCase() ?? '?'}
            </div>

            <div className="min-w-0 flex-1">
                <div className="flex items-baseline gap-2">
                    <span className="text-sm font-semibold">{message.user?.name ?? 'Unknown'}</span>
                    <span className="text-[11px] text-muted-foreground">{time}</span>
                    {isEdited && <span className="text-[10px] text-muted-foreground">(edited)</span>}
                </div>

                {isDeleted ? (
                    <p className="text-sm text-muted-foreground italic">This message was deleted</p>
                ) : isEditing ? (
                    <div className="mt-1">
                        <textarea
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            onKeyDown={handleEditKeyDown}
                            className="w-full rounded border border-border bg-background p-2 text-sm"
                            rows={2}
                            autoFocus
                        />
                        <div className="mt-1 flex gap-2 text-xs">
                            <button onClick={handleEdit} className="text-[var(--scheme-accent)]">Save</button>
                            <button onClick={() => { setIsEditing(false); setEditContent(message.content); }} className="text-muted-foreground">Cancel</button>
                        </div>
                    </div>
                ) : (
                    <p className="whitespace-pre-wrap break-words text-sm">{message.content}</p>
                )}

                {message.reactions.length > 0 && (
                    <div className="mt-1 flex flex-wrap gap-1">
                        {message.reactions.map((r) => (
                            <button
                                key={r.emoji}
                                onClick={() => onReact?.(message.id, r.emoji)}
                                className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs transition-colors ${
                                    r.reacted
                                        ? 'border-[var(--scheme-accent)]/40 bg-[var(--scheme-accent)]/10'
                                        : 'border-border hover:bg-muted'
                                }`}
                                title={r.users.map((u) => u.name).join(', ')}
                            >
                                {r.emoji} {r.count}
                            </button>
                        ))}
                    </div>
                )}

                {showThreadButton && message.reply_count > 0 && (
                    <button
                        onClick={() => onReply?.(message.id)}
                        className="mt-1 flex items-center gap-1 text-xs text-[var(--scheme-accent)] hover:underline"
                    >
                        <MessageSquare className="h-3 w-3" />
                        {message.reply_count} {message.reply_count === 1 ? 'reply' : 'replies'}
                    </button>
                )}
            </div>

            {showActions && !isDeleted && !isEditing && (
                <div className="absolute -top-3 right-4 flex items-center gap-0.5 rounded border border-border bg-background p-0.5 shadow-sm">
                    <button
                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                        className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                        title="React"
                    >
                        <Smile className="h-3.5 w-3.5" />
                    </button>
                    {showThreadButton && (
                        <button
                            onClick={() => onReply?.(message.id)}
                            className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                            title="Reply in thread"
                        >
                            <MessageSquare className="h-3.5 w-3.5" />
                        </button>
                    )}
                    {isOwn && (
                        <>
                            <button
                                onClick={() => setIsEditing(true)}
                                className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                                title="Edit"
                            >
                                <Pencil className="h-3.5 w-3.5" />
                            </button>
                            <button
                                onClick={() => onDelete?.(message.id)}
                                className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-destructive"
                                title="Delete"
                            >
                                <Trash2 className="h-3.5 w-3.5" />
                            </button>
                        </>
                    )}
                </div>
            )}

            {showEmojiPicker && (
                <div className="absolute -top-10 right-4 flex gap-1 rounded border border-border bg-background p-1 shadow-md">
                    {QUICK_EMOJIS.map((emoji) => (
                        <button
                            key={emoji}
                            onClick={() => { onReact?.(message.id, emoji); setShowEmojiPicker(false); }}
                            className="rounded p-1 hover:bg-muted"
                        >
                            {emoji}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
