import { Deferred, Head, Link, usePage } from '@inertiajs/react';
import { Activity, Cable, Cpu, Loader2, Terminal, Zap } from 'lucide-react';
import { useEffect } from 'react';
import { useAppmeshStore } from '@/stores/appmesh';
import { useBasePath } from '@/hooks/use-base-path';
import type { AppMeshPort, AppMeshStats } from '@/types/appmesh';

type PageProps = {
    stats?: AppMeshStats;
    ports: Record<string, AppMeshPort>;
};

function StatsCards() {
    const { stats } = usePage<{ props: PageProps }>().props as unknown as PageProps;
    if (!stats) return null;

    const cards = [
        { label: 'Ports', value: stats.portCount, icon: Cable, detail: 'Rust FFI' },
        { label: 'Tools', value: stats.toolCount, icon: Terminal, detail: 'MCP plugins' },
        { label: 'Plugins', value: stats.pluginCount, icon: Zap, detail: 'loaded' },
        { label: 'Status', value: stats.available ? 'Online' : 'Offline', icon: Activity, detail: stats.hasFfi ? 'FFI active' : 'Subprocess' },
    ];

    return (
        <div className="grid gap-4 md:grid-cols-4">
            {cards.map(c => (
                <div key={c.label} className="rounded-xl border p-6">
                    <div className="flex items-center gap-2 mb-2">
                        <c.icon className="h-4 w-4 text-muted-foreground" />
                        <h3 className="text-sm font-medium text-muted-foreground">{c.label}</h3>
                    </div>
                    <p className="text-3xl font-bold">{c.value}</p>
                    <p className="text-xs text-muted-foreground mt-1">{c.detail}</p>
                </div>
            ))}
        </div>
    );
}

function StatsSkeleton() {
    return (
        <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            <span className="ml-2 text-sm text-muted-foreground">Loading AppMesh stats...</span>
        </div>
    );
}

function PluginsGrid() {
    const { stats } = usePage<{ props: PageProps }>().props as unknown as PageProps;
    if (!stats) return null;

    return (
        <div>
            <h2 className="text-lg font-semibold mb-3">Plugins</h2>
            <div className="grid gap-3 md:grid-cols-3">
                {stats.plugins.map(p => (
                    <div key={p.name} className="flex items-center gap-3 rounded-xl border p-4">
                        <div
                            className="h-2.5 w-2.5 rounded-full"
                            style={{ backgroundColor: 'var(--scheme-accent)' }}
                        />
                        <span className="text-sm font-medium capitalize">{p.name}</span>
                        <span className="text-xs text-muted-foreground ml-auto">
                            {p.toolCount} tool{p.toolCount !== 1 ? 's' : ''}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}

function PortsList() {
    const { ports } = usePage<{ props: PageProps }>().props as unknown as PageProps;

    return (
        <div>
            <h2 className="text-lg font-semibold mb-3">FFI Ports</h2>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {Object.values(ports).map(port => (
                    <div key={port.name} className="rounded-xl border p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Cpu className="h-4 w-4" style={{ color: 'var(--scheme-accent)' }} />
                            <h3 className="text-sm font-semibold capitalize">{port.name}</h3>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                            {port.commands.map(cmd => (
                                <span
                                    key={cmd}
                                    className="rounded-md px-2 py-0.5 text-xs font-mono"
                                    style={{
                                        backgroundColor: 'var(--scheme-accent-subtle)',
                                        color: 'var(--scheme-accent)',
                                    }}
                                >
                                    {cmd}
                                </span>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function QuickLinks() {
    const { url } = useBasePath();

    const links = [
        { href: url('/appmesh/explore'), label: 'D-Bus Explorer', desc: 'Browse services, interfaces, and methods', icon: '🔍' },
        { href: url('/appmesh/midi'), label: 'MIDI Routing', desc: 'PipeWire MIDI patch bay', icon: '🎹' },
        { href: url('/appmesh/tts'), label: 'TTS Studio', desc: 'Text-to-speech and tutorial generation', icon: '🗣️' },
    ];

    return (
        <div>
            <h2 className="text-lg font-semibold mb-3">Tools</h2>
            <div className="grid gap-3 md:grid-cols-3">
                {links.map(link => (
                    <Link
                        key={link.href}
                        href={link.href}
                        className="rounded-xl border p-4 transition-colors hover:border-[var(--scheme-accent)] hover:bg-[var(--scheme-accent-subtle)]"
                    >
                        <div className="text-2xl mb-2">{link.icon}</div>
                        <h3 className="text-sm font-semibold">{link.label}</h3>
                        <p className="text-xs text-muted-foreground mt-1">{link.desc}</p>
                    </Link>
                ))}
            </div>
        </div>
    );
}

function RecentExecutions() {
    const executions = useAppmeshStore(s => s.executions);
    if (executions.length === 0) return null;

    return (
        <div>
            <h2 className="text-lg font-semibold mb-3">Recent Executions</h2>
            <div className="rounded-xl border divide-y">
                {executions.slice(0, 10).map(exec => (
                    <div key={exec.id} className="flex items-center gap-3 px-4 py-3">
                        <div
                            className="h-2 w-2 rounded-full shrink-0"
                            style={{
                                backgroundColor:
                                    exec.status === 'completed' ? 'oklch(65% 0.15 150)' :
                                    exec.status === 'failed' ? 'oklch(55% 0.2 30)' :
                                    'oklch(70% 0.15 60)',
                            }}
                        />
                        <span className="text-sm font-mono flex-1 truncate">{exec.name}</span>
                        <span className="text-xs text-muted-foreground">
                            {exec.completedAt
                                ? `${exec.completedAt - exec.startedAt}ms`
                                : 'running...'}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default function AppMeshIndex() {
    const fetchTools = useAppmeshStore(s => s.fetchTools);

    useEffect(() => {
        fetchTools();
    }, [fetchTools]);

    return (
        <>
            <Head title="AppMesh" />
            <div className="mx-auto max-w-4xl space-y-8">
                <h1 className="text-2xl font-bold">AppMesh</h1>

                <Deferred data="stats" fallback={<StatsSkeleton />}>
                    <StatsCards />
                </Deferred>

                <QuickLinks />
                <PortsList />

                <Deferred data="stats" fallback={null}>
                    <PluginsGrid />
                </Deferred>

                <RecentExecutions />
            </div>
        </>
    );
}
