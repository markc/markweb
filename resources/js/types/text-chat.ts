export type ChatChannel = {
    id: number;
    name: string;
    slug: string;
    type: 'public' | 'private' | 'dm';
    description: string | null;
    created_by: number;
    member_count: number;
    unread_count: number;
};

export type ChatMessage = {
    id: number;
    channel_id: number;
    user_id: number;
    user: { id: number; name: string } | null;
    content: string;
    type: 'message' | 'system' | 'file';
    metadata: Record<string, unknown> | null;
    parent_id: number | null;
    reply_count: number;
    reactions: ChatReaction[];
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
};

export type ChatReaction = {
    emoji: string;
    count: number;
    users: { id: number; name: string }[];
    reacted: boolean;
};

export type PresenceUser = {
    id: number;
    name: string;
};

export type TypingUser = {
    id: number;
    name: string;
    started_at: number;
};
