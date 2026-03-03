import { useCallback, useEffect, useRef, useState } from 'react';
import { usePage } from '@inertiajs/react';

export type MeshNode = {
    id: number;
    name: string;
    wg_ip: string;
    status: 'online' | 'offline';
    last_heartbeat_at: string | null;
    meta: Record<string, unknown> | null;
};

export type MeshStats = {
    totalMessages: number;
    totalBytes: number;
    msgsPerSec: number;
    bytesPerSec: number;
    uptimeSeconds: number;
};

export function useMeshStatus() {
    const [nodes, setNodes] = useState<MeshNode[]>([]);
    const [stats, setStats] = useState<MeshStats>({
        totalMessages: 0,
        totalBytes: 0,
        msgsPerSec: 0,
        bytesPerSec: 0,
        uptimeSeconds: 0,
    });
    const { auth } = usePage<{ props: { auth: { user: { id: number } } } }>().props as unknown as {
        auth: { user: { id: number } };
    };

    const userId = auth?.user?.id;

    // Accumulate stats in refs to avoid re-render per message
    const counters = useRef({ messages: 0, bytes: 0, startTime: 0 });
    // Sliding window for msgs/sec calculation (last 10 seconds)
    const recentMessages = useRef<{ time: number; bytes: number }[]>([]);

    // Load existing nodes on mount
    useEffect(() => {
        if (!userId) return;

        fetch('/api/mesh/nodes', {
            headers: { Accept: 'application/json' },
            credentials: 'same-origin',
        })
            .then((r) => r.json())
            .then((data: MeshNode[]) => {
                if (Array.isArray(data)) setNodes(data);
            })
            .catch(() => {});
    }, [userId]);

    // Subscribe to real-time updates via Reverb/Echo
    useEffect(() => {
        if (!userId || !window.Echo) return;

        counters.current.startTime = Date.now();

        const channel = window.Echo.private('mesh');

        type NodeDelta = { name: string; status?: 'online' | 'offline'; load?: string };

        channel.listen('.MeshNodesUpdated', (e: { nodes: NodeDelta[] }) => {
            // Track stats — one WS frame for the whole batch
            const msgBytes = JSON.stringify(e).length;
            counters.current.messages++;
            counters.current.bytes += msgBytes;
            recentMessages.current.push({ time: Date.now(), bytes: msgBytes });

            // Merge deltas into existing node state
            const now = new Date().toISOString();
            setNodes((prev) => {
                const updated = [...prev];
                for (const delta of e.nodes) {
                    const idx = updated.findIndex((n) => n.name === delta.name);
                    if (idx >= 0) {
                        const node = { ...updated[idx], last_heartbeat_at: now };
                        if (delta.status !== undefined) node.status = delta.status;
                        if (delta.load !== undefined) node.meta = { ...node.meta, load: delta.load };
                        updated[idx] = node;
                    }
                }
                return updated;
            });
        });

        // Update displayed stats every second
        const statsInterval = setInterval(() => {
            const now = Date.now();
            const windowMs = 10_000;
            // Prune messages older than window
            recentMessages.current = recentMessages.current.filter(
                (m) => now - m.time < windowMs,
            );
            const windowSecs = windowMs / 1000;
            const recentBytes = recentMessages.current.reduce((sum, m) => sum + m.bytes, 0);

            setStats({
                totalMessages: counters.current.messages,
                totalBytes: counters.current.bytes,
                msgsPerSec: recentMessages.current.length / windowSecs,
                bytesPerSec: recentBytes / windowSecs,
                uptimeSeconds: Math.floor((now - counters.current.startTime) / 1000),
            });
        }, 1000);

        return () => {
            clearInterval(statsInterval);
            window.Echo.leave('mesh');
        };
    }, [userId]);

    const refresh = useCallback(async () => {
        const r = await fetch('/api/mesh/nodes', {
            headers: { Accept: 'application/json' },
            credentials: 'same-origin',
        });
        const data: MeshNode[] = await r.json();
        if (Array.isArray(data)) setNodes(data);
    }, []);

    return { nodes, stats, refresh };
}
