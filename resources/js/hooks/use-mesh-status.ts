import { useCallback, useEffect, useState } from 'react';
import { usePage } from '@inertiajs/react';

export type MeshNode = {
    id: number;
    name: string;
    wg_ip: string;
    status: 'online' | 'offline';
    last_heartbeat_at: string | null;
    meta: Record<string, unknown> | null;
};

export function useMeshStatus() {
    const [nodes, setNodes] = useState<MeshNode[]>([]);
    const { auth } = usePage<{ props: { auth: { user: { id: number } } } }>().props as unknown as {
        auth: { user: { id: number } };
    };

    const userId = auth?.user?.id;

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

        const channel = window.Echo.private('mesh');

        channel.listen('.MeshNodeUpdated', (e: MeshNode) => {
            setNodes((prev) => {
                const idx = prev.findIndex((n) => n.id === e.id);
                if (idx >= 0) {
                    const updated = [...prev];
                    updated[idx] = e;
                    return updated;
                }
                return [...prev, e];
            });
        });

        return () => {
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

    return { nodes, refresh };
}
