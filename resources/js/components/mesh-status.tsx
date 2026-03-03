import { Network } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useMeshStatus, type MeshNode } from '@/hooks/use-mesh-status';

function timeAgo(iso: string | null): string {
    if (!iso) return 'never';
    const diff = Date.now() - new Date(iso).getTime();
    const secs = Math.floor(diff / 1000);
    if (secs < 60) return `${secs}s ago`;
    const mins = Math.floor(secs / 60);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    return `${hrs}h ago`;
}

function NodeCard({ node }: { node: MeshNode }) {
    const load = (node.meta as Record<string, string> | null)?.load;

    return (
        <div className="grid rounded-xl border p-4" style={{ gridTemplateColumns: 'auto 1fr auto' }}>
            <div className="row-span-2 flex items-center pr-3">
                <div
                    className={`h-2.5 w-2.5 rounded-full ${
                        node.status === 'online' ? 'bg-green-500' : 'bg-red-500'
                    }`}
                />
            </div>
            <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{node.name}</span>
                <span className="text-xs text-muted-foreground">{node.wg_ip}</span>
            </div>
            <span
                className={`text-right text-xs font-medium ${
                    node.status === 'online' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                }`}
            >
                {node.status}
            </span>
            <div className="text-xs tabular-nums text-muted-foreground">
                {load ? `load: ${load}` : '\u00A0'}
            </div>
            <div className="text-right text-xs tabular-nums text-muted-foreground">
                {timeAgo(node.last_heartbeat_at)}
            </div>
        </div>
    );
}

export function MeshStatus() {
    const { nodes } = useMeshStatus();

    // Tick every 15s to keep timeAgo labels fresh (matches heartbeat interval)
    const [, setTick] = useState(0);
    useEffect(() => {
        const id = setInterval(() => setTick((t) => t + 1), 15000);
        return () => clearInterval(id);
    }, []);

    return (
        <div>
            <div className="mb-3 flex items-center gap-2">
                <Network className="h-5 w-5 text-muted-foreground" />
                <h2 className="text-lg font-semibold">Mesh Nodes</h2>
                <span className="text-xs text-muted-foreground">
                    {nodes.filter((n) => n.status === 'online').length}/{nodes.length} online
                </span>
            </div>
            {nodes.length === 0 ? (
                <p className="text-sm text-muted-foreground">No mesh nodes registered yet.</p>
            ) : (
                <div className="grid gap-3 md:grid-cols-3">
                    {nodes.map((node) => (
                        <NodeCard key={node.id} node={node} />
                    ))}
                </div>
            )}
        </div>
    );
}
