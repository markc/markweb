import { X } from 'lucide-react';
import TextMessageBubble from './text-message-bubble';
import MessageComposer from './message-composer';
import { useChatStore } from '@/stores/chatStore';
import type { ChatMessage } from '@/types/text-chat';

interface Props {
    parentMessage: ChatMessage;
    channelSlug: string;
    channelId: number;
    currentUserId: number;
}

export default function ThreadPanel({ parentMessage, channelSlug, channelId, currentUserId }: Props) {
    const { threadMessages, closeThread } = useChatStore();

    return (
        <div className="flex h-full w-80 flex-col border-l border-border bg-background">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
                <h3 className="text-sm font-semibold">Thread</h3>
                <button
                    onClick={closeThread}
                    className="rounded p-1 text-muted-foreground hover:text-foreground"
                >
                    <X className="h-4 w-4" />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto">
                {/* Parent message */}
                <div className="border-b border-border pb-2">
                    <TextMessageBubble
                        message={parentMessage}
                        currentUserId={currentUserId}
                        showThreadButton={false}
                    />
                </div>

                {/* Thread replies */}
                <div className="py-2">
                    {threadMessages.length === 0 ? (
                        <p className="px-4 py-8 text-center text-xs text-muted-foreground">
                            No replies yet
                        </p>
                    ) : (
                        threadMessages.map((msg) => (
                            <TextMessageBubble
                                key={msg.id}
                                message={msg}
                                currentUserId={currentUserId}
                                showThreadButton={false}
                            />
                        ))
                    )}
                </div>
            </div>

            <MessageComposer
                channelSlug={channelSlug}
                channelId={channelId}
                parentId={parentMessage.id}
                placeholder="Reply in thread..."
            />
        </div>
    );
}
