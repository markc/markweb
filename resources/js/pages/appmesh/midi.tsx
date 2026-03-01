import { Head } from '@inertiajs/react';
import { Cable, Loader2, RefreshCw, Trash2, Unplug } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

const csrf = () => document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content ?? '';

type MidiPort = {
    id: string;
    name: string;
    direction: 'output' | 'input';
};

type MidiLink = {
    output: string;
    input: string;
};

function parsePorts(text: string): MidiPort[] {
    if (!text) return [];
    const ports: MidiPort[] = [];
    const lines = text.split('\n');
    for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('MIDI')) continue;
        // Try to parse "id: name (direction)" style
        const match = trimmed.match(/^(\d+)\.\s+(.+?)(?:\s+\[(input|output)\])?$/i);
        if (match) {
            ports.push({
                id: match[1],
                name: match[2].trim(),
                direction: (match[3]?.toLowerCase() ?? 'output') as 'output' | 'input',
            });
        } else {
            // Fallback — treat each line as a port name
            ports.push({
                id: trimmed,
                name: trimmed,
                direction: trimmed.toLowerCase().includes('input') ? 'input' : 'output',
            });
        }
    }
    return ports;
}

function parseLinks(text: string): MidiLink[] {
    if (!text) return [];
    const links: MidiLink[] = [];
    const lines = text.split('\n');
    for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;
        // Try "output -> input" or "output → input"
        const match = trimmed.match(/^(.+?)\s*(?:->|→)\s*(.+)$/);
        if (match) {
            links.push({ output: match[1].trim(), input: match[2].trim() });
        }
    }
    return links;
}

export default function MidiRouting() {
    const [ports, setPorts] = useState<MidiPort[]>([]);
    const [links, setLinks] = useState<MidiLink[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [connecting, setConnecting] = useState(false);

    // Connect state
    const [selectedOutput, setSelectedOutput] = useState<string>('');
    const [selectedInput, setSelectedInput] = useState<string>('');

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch('/api/appmesh/midi/ports', {
                headers: { 'X-CSRF-TOKEN': csrf() },
            });
            const data = await res.json();

            if (data.ports?.success) {
                setPorts(parsePorts(data.ports.result));
            }
            if (data.links?.success) {
                setLinks(parseLinks(data.links.result));
            }
        } catch (e) {
            setError((e as Error).message);
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleConnect = useCallback(async () => {
        if (!selectedOutput || !selectedInput) return;
        setConnecting(true);
        try {
            await fetch('/api/appmesh/midi/connect', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': csrf() },
                body: JSON.stringify({ action: 'connect', output: selectedOutput, input: selectedInput }),
            });
            await fetchData();
            setSelectedOutput('');
            setSelectedInput('');
        } catch { /* ignore */ }
        setConnecting(false);
    }, [selectedOutput, selectedInput, fetchData]);

    const handleDisconnect = useCallback(async (link: MidiLink) => {
        try {
            await fetch('/api/appmesh/midi/connect', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': csrf() },
                body: JSON.stringify({ action: 'disconnect', output: link.output, input: link.input }),
            });
            await fetchData();
        } catch { /* ignore */ }
    }, [fetchData]);

    const outputs = ports.filter(p => p.direction === 'output');
    const inputs = ports.filter(p => p.direction === 'input');

    return (
        <>
            <Head title="MIDI Routing" />
            <div className="mx-auto max-w-4xl space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">MIDI Routing</h1>
                    <button
                        onClick={fetchData}
                        className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors hover:bg-muted"
                    >
                        <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </button>
                </div>

                {error && (
                    <div className="rounded-xl border p-4 text-sm" style={{ borderColor: 'oklch(55% 0.2 30)', color: 'oklch(55% 0.2 30)' }}>
                        {error}
                    </div>
                )}

                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                        <span className="ml-2 text-sm text-muted-foreground">Loading MIDI ports...</span>
                    </div>
                ) : (
                    <>
                        {/* Connect new */}
                        <div className="rounded-xl border p-4">
                            <h2 className="text-sm font-semibold mb-3">New Connection</h2>
                            <div className="flex items-end gap-3">
                                <div className="flex-1">
                                    <label className="block text-xs font-medium mb-1" style={{ color: 'var(--scheme-fg-muted)' }}>
                                        Output
                                    </label>
                                    <select
                                        value={selectedOutput}
                                        onChange={e => setSelectedOutput(e.target.value)}
                                        className="w-full rounded-lg border bg-transparent px-3 py-2 text-sm outline-none focus:border-[var(--scheme-accent)]"
                                    >
                                        <option value="">Select output...</option>
                                        {outputs.map(p => (
                                            <option key={p.id} value={p.name}>{p.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="pb-2">
                                    <Cable className="h-5 w-5" style={{ color: 'var(--scheme-fg-muted)' }} />
                                </div>
                                <div className="flex-1">
                                    <label className="block text-xs font-medium mb-1" style={{ color: 'var(--scheme-fg-muted)' }}>
                                        Input
                                    </label>
                                    <select
                                        value={selectedInput}
                                        onChange={e => setSelectedInput(e.target.value)}
                                        className="w-full rounded-lg border bg-transparent px-3 py-2 text-sm outline-none focus:border-[var(--scheme-accent)]"
                                    >
                                        <option value="">Select input...</option>
                                        {inputs.map(p => (
                                            <option key={p.id} value={p.name}>{p.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <button
                                    onClick={handleConnect}
                                    disabled={!selectedOutput || !selectedInput || connecting}
                                    className="rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors disabled:opacity-50"
                                    style={{ backgroundColor: 'var(--scheme-accent)' }}
                                >
                                    {connecting ? 'Connecting...' : 'Connect'}
                                </button>
                            </div>
                        </div>

                        {/* Active connections */}
                        <div>
                            <h2 className="text-lg font-semibold mb-3">
                                Active Connections
                                {links.length > 0 && (
                                    <span className="ml-2 text-xs font-normal text-muted-foreground">
                                        ({links.length})
                                    </span>
                                )}
                            </h2>
                            {links.length === 0 ? (
                                <div className="rounded-xl border p-8 text-center">
                                    <Unplug className="h-8 w-8 mx-auto mb-2" style={{ color: 'var(--scheme-fg-muted)' }} />
                                    <p className="text-sm" style={{ color: 'var(--scheme-fg-muted)' }}>
                                        No active MIDI connections
                                    </p>
                                </div>
                            ) : (
                                <div className="rounded-xl border divide-y">
                                    {links.map((link, i) => (
                                        <div key={i} className="flex items-center gap-3 px-4 py-3">
                                            <span className="text-sm font-mono flex-1 truncate" style={{ color: 'var(--scheme-fg-primary)' }}>
                                                {link.output}
                                            </span>
                                            <Cable className="h-4 w-4 shrink-0" style={{ color: 'var(--scheme-accent)' }} />
                                            <span className="text-sm font-mono flex-1 truncate" style={{ color: 'var(--scheme-fg-primary)' }}>
                                                {link.input}
                                            </span>
                                            <button
                                                onClick={() => handleDisconnect(link)}
                                                className="rounded p-1 transition-colors hover:bg-destructive/10"
                                                title="Disconnect"
                                            >
                                                <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Port lists */}
                        <div className="grid gap-4 md:grid-cols-2">
                            <div>
                                <h2 className="text-lg font-semibold mb-3">Outputs ({outputs.length})</h2>
                                <div className="rounded-xl border divide-y">
                                    {outputs.length === 0 ? (
                                        <p className="p-4 text-sm text-muted-foreground">No output ports found</p>
                                    ) : (
                                        outputs.map(p => (
                                            <div key={p.id} className="px-4 py-2">
                                                <span className="text-sm font-mono" style={{ color: 'var(--scheme-fg-primary)' }}>
                                                    {p.name}
                                                </span>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold mb-3">Inputs ({inputs.length})</h2>
                                <div className="rounded-xl border divide-y">
                                    {inputs.length === 0 ? (
                                        <p className="p-4 text-sm text-muted-foreground">No input ports found</p>
                                    ) : (
                                        inputs.map(p => (
                                            <div key={p.id} className="px-4 py-2">
                                                <span className="text-sm font-mono" style={{ color: 'var(--scheme-fg-primary)' }}>
                                                    {p.name}
                                                </span>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </>
    );
}
