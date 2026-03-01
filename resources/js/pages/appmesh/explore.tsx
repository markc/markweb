import { Head } from '@inertiajs/react';
import { ChevronDown, ChevronRight, Loader2, Play, RefreshCw, Search } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useAppmeshStore } from '@/stores/appmesh';

const csrf = () => document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content ?? '';

type DbusNode = {
    name: string;
    type: 'interface' | 'method' | 'signal' | 'property' | 'node';
    children?: DbusNode[];
    args?: string;
    access?: string;
};

function parseIntrospection(xml: string): DbusNode[] {
    const nodes: DbusNode[] = [];
    const parser = new DOMParser();
    const doc = parser.parseFromString(xml, 'text/xml');
    const root = doc.documentElement;

    // Child nodes (sub-paths)
    for (const node of root.querySelectorAll(':scope > node')) {
        nodes.push({ name: node.getAttribute('name') ?? '', type: 'node' });
    }

    // Interfaces
    for (const iface of root.querySelectorAll(':scope > interface')) {
        const ifaceName = iface.getAttribute('name') ?? '';
        const children: DbusNode[] = [];

        for (const method of iface.querySelectorAll(':scope > method')) {
            const methodName = method.getAttribute('name') ?? '';
            const args = Array.from(method.querySelectorAll('arg'))
                .map(a => `${a.getAttribute('direction') ?? 'in'}: ${a.getAttribute('type') ?? '?'} ${a.getAttribute('name') ?? ''}`)
                .join(', ');
            children.push({ name: methodName, type: 'method', args });
        }

        for (const signal of iface.querySelectorAll(':scope > signal')) {
            const sigName = signal.getAttribute('name') ?? '';
            const args = Array.from(signal.querySelectorAll('arg'))
                .map(a => `${a.getAttribute('type') ?? '?'} ${a.getAttribute('name') ?? ''}`)
                .join(', ');
            children.push({ name: sigName, type: 'signal', args });
        }

        for (const prop of iface.querySelectorAll(':scope > property')) {
            children.push({
                name: prop.getAttribute('name') ?? '',
                type: 'property',
                args: prop.getAttribute('type') ?? '?',
                access: prop.getAttribute('access') ?? 'read',
            });
        }

        nodes.push({ name: ifaceName, type: 'interface', children });
    }

    return nodes;
}

function NodeTree({ nodes, service, path, onCall, depth = 0 }: {
    nodes: DbusNode[];
    service: string;
    path: string;
    onCall: (service: string, path: string, iface: string, method: string) => void;
    depth?: number;
}) {
    const [expanded, setExpanded] = useState<Record<string, boolean>>({});
    const [childNodes, setChildNodes] = useState<Record<string, DbusNode[]>>({});
    const [loading, setLoading] = useState<Record<string, boolean>>({});

    const toggleNode = useCallback(async (node: DbusNode) => {
        const key = node.name;
        if (node.type === 'node' && !childNodes[key]) {
            setLoading(prev => ({ ...prev, [key]: true }));
            try {
                const childPath = path === '/' ? `/${key}` : `${path}/${key}`;
                const res = await fetch('/api/appmesh/dbus/introspect', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': csrf() },
                    body: JSON.stringify({ service, path: childPath }),
                });
                const data = await res.json();
                if (data.success && data.result) {
                    const parsed = parseIntrospection(data.result);
                    setChildNodes(prev => ({ ...prev, [key]: parsed }));
                }
            } catch { /* ignore */ }
            setLoading(prev => ({ ...prev, [key]: false }));
        }
        setExpanded(prev => ({ ...prev, [key]: !prev[key] }));
    }, [service, path, childNodes]);

    const typeIcons: Record<string, { color: string; label: string }> = {
        interface: { color: 'oklch(60% 0.15 220)', label: 'I' },
        method: { color: 'oklch(60% 0.15 150)', label: 'M' },
        signal: { color: 'oklch(60% 0.15 45)', label: 'S' },
        property: { color: 'oklch(60% 0.15 30)', label: 'P' },
        node: { color: 'var(--scheme-fg-muted)', label: '/' },
    };

    return (
        <>
            {nodes.map(node => {
                const key = node.name;
                const isOpen = expanded[key];
                const hasChildren = node.type === 'interface' || node.type === 'node';
                const icon = typeIcons[node.type];

                return (
                    <div key={key}>
                        <div
                            className="flex items-center gap-1.5 py-1 px-2 text-sm transition-colors hover:bg-[var(--scheme-accent-subtle)] cursor-pointer"
                            style={{ paddingLeft: `${depth * 16 + 8}px` }}
                            onClick={() => hasChildren ? toggleNode(node) : undefined}
                        >
                            {hasChildren ? (
                                isOpen
                                    ? <ChevronDown className="h-3 w-3 shrink-0" style={{ color: 'var(--scheme-fg-muted)' }} />
                                    : <ChevronRight className="h-3 w-3 shrink-0" style={{ color: 'var(--scheme-fg-muted)' }} />
                            ) : (
                                <span className="w-3" />
                            )}
                            <span
                                className="h-4 w-4 rounded text-[10px] font-bold flex items-center justify-center shrink-0"
                                style={{ backgroundColor: icon.color + '22', color: icon.color }}
                            >
                                {icon.label}
                            </span>
                            <span className="font-mono text-xs truncate" style={{ color: 'var(--scheme-fg-primary)' }}>
                                {node.name}
                            </span>
                            {node.type === 'method' && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        // Find parent interface
                                        const parentIface = nodes.find(n => n.type === 'interface' && n.children?.includes(node));
                                        onCall(service, path, parentIface?.name ?? '', node.name);
                                    }}
                                    className="ml-auto rounded p-0.5 transition-colors hover:bg-[var(--scheme-accent)]"
                                    style={{ color: 'var(--scheme-fg-muted)' }}
                                    title="Call method"
                                >
                                    <Play className="h-3 w-3" />
                                </button>
                            )}
                            {loading[key] && <Loader2 className="h-3 w-3 animate-spin ml-auto" style={{ color: 'var(--scheme-fg-muted)' }} />}
                        </div>
                        {node.args && (
                            <div
                                className="text-[10px] font-mono py-0.5"
                                style={{ paddingLeft: `${depth * 16 + 36}px`, color: 'var(--scheme-fg-muted)' }}
                            >
                                {node.args}
                            </div>
                        )}
                        {isOpen && node.children && (
                            <NodeTree
                                nodes={node.children}
                                service={service}
                                path={path}
                                onCall={onCall}
                                depth={depth + 1}
                            />
                        )}
                        {isOpen && childNodes[key] && (
                            <NodeTree
                                nodes={childNodes[key]}
                                service={service}
                                path={path === '/' ? `/${key}` : `${path}/${key}`}
                                onCall={onCall}
                                depth={depth + 1}
                            />
                        )}
                    </div>
                );
            })}
        </>
    );
}

export default function DbusExplore() {
    const executeTool = useAppmeshStore(s => s.executeTool);
    const [services, setServices] = useState<string[]>([]);
    const [filter, setFilter] = useState('');
    const [loading, setLoading] = useState(false);
    const [selectedService, setSelectedService] = useState<string | null>(null);
    const [serviceNodes, setServiceNodes] = useState<DbusNode[]>([]);
    const [serviceLoading, setServiceLoading] = useState(false);
    const [callResult, setCallResult] = useState<string | null>(null);

    const fetchServices = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/appmesh/dbus/services', {
                headers: { 'X-CSRF-TOKEN': csrf() },
            });
            const data = await res.json();
            if (data.success && data.result) {
                const lines = data.result.split('\n').filter((l: string) => l.trim());
                setServices(lines.sort());
            }
        } catch { /* ignore */ }
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchServices();
    }, [fetchServices]);

    const selectService = useCallback(async (service: string) => {
        setSelectedService(service);
        setServiceLoading(true);
        setServiceNodes([]);
        setCallResult(null);
        try {
            const res = await fetch('/api/appmesh/dbus/introspect', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': csrf() },
                body: JSON.stringify({ service, path: '/' }),
            });
            const data = await res.json();
            if (data.success && data.result) {
                setServiceNodes(parseIntrospection(data.result));
            }
        } catch { /* ignore */ }
        setServiceLoading(false);
    }, []);

    const handleCall = useCallback(async (service: string, path: string, iface: string, method: string) => {
        setCallResult(`Calling ${iface}.${method}...`);
        await executeTool('appmesh_dbus_call', {
            service,
            path,
            interface: iface,
            method,
        });
        const latest = useAppmeshStore.getState().executions[0];
        if (latest) {
            setCallResult(latest.result ?? latest.error ?? 'No response');
        }
    }, [executeTool]);

    const filtered = filter
        ? services.filter(s => s.toLowerCase().includes(filter.toLowerCase()))
        : services;

    return (
        <>
            <Head title="D-Bus Explorer" />
            <div className="mx-auto max-w-5xl space-y-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">D-Bus Explorer</h1>
                    <button
                        onClick={fetchServices}
                        className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors hover:bg-muted"
                    >
                        <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </button>
                </div>

                <div className="grid gap-4 lg:grid-cols-[300px_1fr]">
                    {/* Service list */}
                    <div className="rounded-xl border overflow-hidden">
                        <div className="border-b p-2" style={{ borderColor: 'var(--scheme-border)' }}>
                            <div className="relative">
                                <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5" style={{ color: 'var(--scheme-fg-muted)' }} />
                                <input
                                    type="text"
                                    value={filter}
                                    onChange={e => setFilter(e.target.value)}
                                    placeholder="Filter services..."
                                    className="w-full rounded border bg-transparent pl-7 pr-2 py-1.5 text-xs outline-none focus:border-[var(--scheme-accent)]"
                                    style={{ borderColor: 'var(--scheme-border)' }}
                                />
                            </div>
                        </div>
                        <div className="max-h-[70vh] overflow-y-auto">
                            {loading ? (
                                <div className="flex items-center justify-center py-8">
                                    <Loader2 className="h-5 w-5 animate-spin" style={{ color: 'var(--scheme-fg-muted)' }} />
                                </div>
                            ) : (
                                filtered.map(svc => (
                                    <button
                                        key={svc}
                                        onClick={() => selectService(svc)}
                                        className="w-full px-3 py-1.5 text-left text-xs font-mono transition-colors hover:bg-[var(--scheme-accent-subtle)] truncate"
                                        style={{
                                            color: selectedService === svc ? 'var(--scheme-accent)' : 'var(--scheme-fg-secondary)',
                                            backgroundColor: selectedService === svc ? 'var(--scheme-accent-subtle)' : undefined,
                                        }}
                                    >
                                        {svc}
                                    </button>
                                ))
                            )}
                            <div className="px-3 py-1 text-[10px]" style={{ color: 'var(--scheme-fg-muted)' }}>
                                {filtered.length} service{filtered.length !== 1 ? 's' : ''}
                            </div>
                        </div>
                    </div>

                    {/* Introspection tree */}
                    <div className="rounded-xl border overflow-hidden">
                        {!selectedService ? (
                            <div className="flex items-center justify-center py-12">
                                <p className="text-sm" style={{ color: 'var(--scheme-fg-muted)' }}>
                                    Select a service to introspect
                                </p>
                            </div>
                        ) : serviceLoading ? (
                            <div className="flex items-center justify-center py-12">
                                <Loader2 className="h-5 w-5 animate-spin" style={{ color: 'var(--scheme-fg-muted)' }} />
                                <span className="ml-2 text-sm" style={{ color: 'var(--scheme-fg-muted)' }}>
                                    Introspecting {selectedService}...
                                </span>
                            </div>
                        ) : (
                            <>
                                <div
                                    className="border-b px-3 py-2"
                                    style={{ borderColor: 'var(--scheme-border)', backgroundColor: 'var(--scheme-accent-subtle)' }}
                                >
                                    <h2 className="text-xs font-mono font-semibold" style={{ color: 'var(--scheme-accent)' }}>
                                        {selectedService}
                                    </h2>
                                </div>
                                <div className="max-h-[60vh] overflow-y-auto">
                                    <NodeTree
                                        nodes={serviceNodes}
                                        service={selectedService}
                                        path="/"
                                        onCall={handleCall}
                                    />
                                </div>
                                {callResult && (
                                    <div className="border-t p-3" style={{ borderColor: 'var(--scheme-border)' }}>
                                        <h3 className="text-xs font-semibold mb-1" style={{ color: 'var(--scheme-fg-muted)' }}>
                                            Result
                                        </h3>
                                        <pre
                                            className="max-h-32 overflow-auto rounded p-2 text-xs font-mono"
                                            style={{
                                                backgroundColor: 'var(--scheme-bg-secondary)',
                                                color: 'var(--scheme-fg-secondary)',
                                            }}
                                        >
                                            {callResult}
                                        </pre>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
