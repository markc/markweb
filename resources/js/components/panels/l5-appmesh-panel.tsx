import { ChevronDown, ChevronRight, Loader2, Play } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useAppmeshStore } from '@/stores/appmesh';
import type { AppMeshPlugin, AppMeshTool } from '@/types/appmesh';

function ToolItem({ tool }: { tool: AppMeshTool }) {
    const executeTool = useAppmeshStore(s => s.executeTool);
    const isExecuting = useAppmeshStore(s => s.isExecuting);
    const [expanded, setExpanded] = useState(false);
    const [args, setArgs] = useState<Record<string, string>>({});
    const [lastResult, setLastResult] = useState<string | null>(null);

    const requiredProps = tool.inputSchema?.required ?? [];
    const properties = tool.inputSchema?.properties ?? {};

    const handleExecute = async () => {
        await executeTool(tool.name, args);
        const latest = useAppmeshStore.getState().executions[0];
        if (latest?.result) {
            setLastResult(typeof latest.result === 'string' ? latest.result : JSON.stringify(latest.result));
        } else if (latest?.error) {
            setLastResult(`Error: ${latest.error}`);
        }
    };

    return (
        <div className="border-b last:border-b-0" style={{ borderColor: 'var(--glass-border)' }}>
            <button
                onClick={() => setExpanded(!expanded)}
                className="flex w-full items-center gap-2 px-3 py-1.5 text-xs font-mono transition-colors hover:bg-[var(--scheme-accent-subtle)]"
                style={{ color: 'var(--scheme-fg-secondary)' }}
            >
                {expanded
                    ? <ChevronDown className="h-3 w-3 shrink-0" />
                    : <ChevronRight className="h-3 w-3 shrink-0" />}
                <span className="truncate text-left flex-1">{tool.name.replace('appmesh_', '')}</span>
            </button>
            {expanded && (
                <div className="px-3 pb-2 space-y-1.5">
                    <p className="text-[11px]" style={{ color: 'var(--scheme-fg-muted)' }}>{tool.description}</p>
                    {Object.entries(properties).map(([key, prop]) => (
                        <div key={key}>
                            <label className="text-[10px] font-medium" style={{ color: 'var(--scheme-fg-muted)' }}>
                                {key}{requiredProps.includes(key) ? ' *' : ''}
                            </label>
                            <input
                                type="text"
                                value={args[key] ?? ''}
                                onChange={e => setArgs(prev => ({ ...prev, [key]: e.target.value }))}
                                placeholder={(prop as any).description ?? key}
                                className="mt-0.5 w-full rounded border bg-transparent px-2 py-1 text-xs outline-none focus:border-[var(--scheme-accent)]"
                                style={{ borderColor: 'var(--scheme-border)' }}
                            />
                        </div>
                    ))}
                    <button
                        onClick={handleExecute}
                        disabled={isExecuting}
                        className="flex items-center gap-1 rounded px-2 py-1 text-[11px] font-medium text-white transition-colors disabled:opacity-50"
                        style={{ backgroundColor: 'var(--scheme-accent)' }}
                    >
                        {isExecuting ? <Loader2 className="h-3 w-3 animate-spin" /> : <Play className="h-3 w-3" />}
                        Run
                    </button>
                    {lastResult && (
                        <pre
                            className="mt-1 max-h-24 overflow-auto rounded p-2 text-[10px] font-mono"
                            style={{
                                backgroundColor: 'var(--scheme-bg-secondary)',
                                color: 'var(--scheme-fg-secondary)',
                            }}
                        >
                            {lastResult.length > 500 ? lastResult.slice(0, 500) + '...' : lastResult}
                        </pre>
                    )}
                </div>
            )}
        </div>
    );
}

function PluginGroup({ plugin }: { plugin: AppMeshPlugin }) {
    const [open, setOpen] = useState(false);

    return (
        <div>
            <button
                onClick={() => setOpen(!open)}
                className="flex w-full items-center gap-2 px-3 py-2 text-sm font-semibold capitalize transition-colors hover:bg-[var(--scheme-accent-subtle)]"
                style={{ color: 'var(--scheme-fg-primary)' }}
            >
                {open
                    ? <ChevronDown className="h-3.5 w-3.5 shrink-0" style={{ color: 'var(--scheme-accent)' }} />
                    : <ChevronRight className="h-3.5 w-3.5 shrink-0" style={{ color: 'var(--scheme-fg-muted)' }} />}
                {plugin.name}
                <span className="text-[10px] font-normal ml-auto" style={{ color: 'var(--scheme-fg-muted)' }}>
                    {plugin.tools.length}
                </span>
            </button>
            {open && plugin.tools.map(tool => <ToolItem key={tool.name} tool={tool} />)}
        </div>
    );
}

export default function AppmeshPanel() {
    const plugins = useAppmeshStore(s => s.plugins);
    const loading = useAppmeshStore(s => s.toolsLoading);
    const error = useAppmeshStore(s => s.toolsError);
    const fetchTools = useAppmeshStore(s => s.fetchTools);

    useEffect(() => {
        if (plugins.length === 0 && !loading) {
            fetchTools();
        }
    }, [plugins.length, loading, fetchTools]);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-8">
                <Loader2 className="h-5 w-5 animate-spin" style={{ color: 'var(--scheme-fg-muted)' }} />
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 text-center">
                <p className="text-sm" style={{ color: 'var(--scheme-fg-muted)' }}>
                    AppMesh unavailable
                </p>
                <p className="text-xs mt-1" style={{ color: 'var(--scheme-fg-muted)' }}>{error}</p>
                <button
                    onClick={fetchTools}
                    className="mt-2 rounded px-3 py-1 text-xs font-medium transition-colors"
                    style={{ color: 'var(--scheme-accent)' }}
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="divide-y" style={{ '--tw-divide-opacity': 1, borderColor: 'var(--glass-border)' } as React.CSSProperties}>
            {plugins.map(plugin => (
                <PluginGroup key={plugin.name} plugin={plugin} />
            ))}
        </div>
    );
}
