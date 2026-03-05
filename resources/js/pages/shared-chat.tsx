import { Head } from '@inertiajs/react';
import { createCodePlugin } from '@streamdown/code';
import { Streamdown } from 'streamdown';

const codePlugin = createCodePlugin({ theme: 'github-dark' } as any);

interface SharedMessage {
    id: number;
    role: 'user' | 'assistant';
    content: string;
    created_at: string;
}

interface Props {
    session: {
        title: string;
        model: string | null;
        messages: SharedMessage[];
    };
}

export default function SharedChat({ session }: Props) {
    return (
        <>
            <Head title={session.title || 'Shared Chat'} />
            <div className="mx-auto max-w-3xl px-4 py-8">
                <div className="mb-6">
                    <h1 className="text-xl font-semibold">{session.title || 'Shared Chat'}</h1>
                    {session.model && (
                        <p className="mt-1 text-sm text-muted-foreground">Model: {session.model}</p>
                    )}
                </div>

                <div className="space-y-4">
                    {session.messages.map((msg) => (
                        <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div
                                className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                                    msg.role === 'user'
                                        ? 'bg-primary text-primary-foreground'
                                        : 'bg-muted'
                                }`}
                            >
                                {msg.role === 'user' ? (
                                    <div className="whitespace-pre-wrap text-sm">{msg.content}</div>
                                ) : (
                                    <div className="prose prose-sm dark:prose-invert max-w-none text-sm">
                                        <Streamdown mode="static" plugins={[codePlugin] as any} linkSafety={{ enabled: false }}>
                                            {msg.content}
                                        </Streamdown>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-8 border-t pt-4 text-center text-xs text-muted-foreground">
                    Shared from MarkWeb
                </div>
            </div>
        </>
    );
}
