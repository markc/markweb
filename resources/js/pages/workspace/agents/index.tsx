import { Head, Link, router } from '@inertiajs/react';
import { Bot, Plus, Pencil, Trash2 } from 'lucide-react';
import AppDualSidebarLayout from '@/layouts/app/app-dual-sidebar-layout';

interface Agent {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    icon: string | null;
    model: string;
    provider: string;
    temperature: number;
    user_id: number | null;
    updated_at: string;
}

interface Props {
    agents: Agent[];
}

export default function AgentsIndex({ agents }: Props) {
    return (
        <AppDualSidebarLayout>
            <Head title="Agents" />
            <div className="mx-auto max-w-4xl px-4 py-6">
                <div className="mb-6 flex items-center justify-between">
                    <h1 className="text-xl font-semibold">Agents</h1>
                    <Link
                        href="/workspace/agents/create"
                        className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors hover:opacity-90"
                        style={{ backgroundColor: 'var(--scheme-accent)' }}
                    >
                        <Plus className="h-4 w-4" />
                        New Agent
                    </Link>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {agents.map((agent) => (
                        <div
                            key={agent.id}
                            className="group relative rounded-xl border p-4 transition-colors hover:border-[var(--scheme-accent)]"
                            style={{ borderColor: 'var(--scheme-border)', background: 'var(--glass)' }}
                        >
                            <div className="mb-3 flex items-center gap-3">
                                <div
                                    className="flex h-10 w-10 items-center justify-center rounded-lg text-lg"
                                    style={{ backgroundColor: 'var(--scheme-bg-secondary)' }}
                                >
                                    {agent.icon || <Bot className="h-5 w-5" style={{ color: 'var(--scheme-fg-muted)' }} />}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <h3 className="truncate text-sm font-medium">{agent.name}</h3>
                                    <p className="text-xs" style={{ color: 'var(--scheme-fg-muted)' }}>
                                        {agent.provider}/{agent.model}
                                    </p>
                                </div>
                            </div>

                            {agent.description && (
                                <p className="mb-3 line-clamp-2 text-xs" style={{ color: 'var(--scheme-fg-secondary)' }}>
                                    {agent.description}
                                </p>
                            )}

                            <div className="flex items-center justify-between text-[10px]" style={{ color: 'var(--scheme-fg-muted)' }}>
                                <span>temp: {agent.temperature}</span>
                                <span>{agent.user_id ? 'Custom' : 'System'}</span>
                            </div>

                            {agent.user_id && (
                                <div className="absolute right-2 top-2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                                    <Link
                                        href={`/workspace/agents/${agent.id}/edit`}
                                        className="rounded p-1 hover:bg-accent/10"
                                    >
                                        <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                                    </Link>
                                    <button
                                        onClick={() => router.delete(`/workspace/agents/${agent.id}`, { preserveScroll: true })}
                                        className="rounded p-1 hover:bg-destructive/10"
                                    >
                                        <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}

                    {agents.length === 0 && (
                        <div className="col-span-full py-12 text-center">
                            <Bot className="mx-auto mb-3 h-12 w-12 text-muted-foreground" />
                            <p className="text-sm text-muted-foreground">No agents yet. Create one to get started.</p>
                        </div>
                    )}
                </div>
            </div>
        </AppDualSidebarLayout>
    );
}
