import { Activity, Network } from 'lucide-react';
import { useMeshStatus, type MeshNode, type MeshStats } from '@/hooks/use-mesh-status';

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

function formatBytes(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatUptime(seconds: number): string {
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins < 60) return `${mins}m ${secs}s`;
    const hrs = Math.floor(mins / 60);
    return `${hrs}h ${mins % 60}m`;
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

function WsStats({ stats }: { stats: MeshStats }) {
    if (stats.totalMessages === 0) return null;

    return (
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 rounded-lg border px-3 py-2 text-xs tabular-nums text-muted-foreground">
            <span className="flex items-center gap-1.5">
                <Activity className="h-3 w-3" />
                <span className="font-medium">{stats.msgsPerSec.toFixed(1)}</span> msg/s
            </span>
            <span>
                <span className="font-medium">{formatBytes(Math.round(stats.bytesPerSec))}</span>/s
            </span>
            <span className="border-l pl-4">
                <span className="font-medium">{stats.totalMessages.toLocaleString()}</span> msgs
            </span>
            <span>
                <span className="font-medium">{formatBytes(stats.totalBytes)}</span> total
            </span>
            <span className="border-l pl-4">
                uptime <span className="font-medium">{formatUptime(stats.uptimeSeconds)}</span>
            </span>
        </div>
    );
}

export function MeshStatus() {
    const { nodes, stats } = useMeshStatus();

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
                <>
                    <div className="grid gap-3 md:grid-cols-3">
                        {nodes.map((node) => (
                            <NodeCard key={node.id} node={node} />
                        ))}
                    </div>
                    <WsStats stats={stats} />
                </>
            )}
        </div>
    );
}
