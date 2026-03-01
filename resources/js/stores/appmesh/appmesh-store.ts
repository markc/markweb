import { create } from 'zustand';
import type { AppMeshExecution, AppMeshEvent, AppMeshPlugin, AppMeshTool } from '@/types/appmesh';

const csrf = () => document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content ?? '';

interface AppmeshState {
    // Tools
    plugins: AppMeshPlugin[];
    toolsLoading: boolean;
    toolsError: string | null;
    fetchTools: () => Promise<void>;

    // Executions
    executions: AppMeshExecution[];
    isExecuting: boolean;
    executeTool: (toolName: string, args: Record<string, unknown>) => Promise<void>;
    executePort: (port: string, command: string, args: Record<string, unknown>) => Promise<void>;
    clearExecutions: () => void;

    // Events
    events: AppMeshEvent[];
    maxEvents: number;
    eventsPaused: boolean;
    eventFilters: Set<string>;
    addEvent: (event: Omit<AppMeshEvent, 'id' | 'timestamp'>) => void;
    toggleEventFilter: (type: string) => void;
    toggleEventsPaused: () => void;
    clearEvents: () => void;
}

let executionCounter = 0;
let eventCounter = 0;

export const useAppmeshStore = create<AppmeshState>((set, get) => ({
    // Tools state
    plugins: [],
    toolsLoading: false,
    toolsError: null,

    fetchTools: async () => {
        set({ toolsLoading: true, toolsError: null });
        try {
            const res = await fetch('/api/appmesh/tools', {
                headers: { 'X-CSRF-TOKEN': csrf() },
            });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data: Record<string, AppMeshPlugin> = await res.json();
            set({ plugins: Object.values(data), toolsLoading: false });
        } catch (e) {
            set({ toolsLoading: false, toolsError: (e as Error).message });
        }
    },

    // Execution state
    executions: [],
    isExecuting: false,

    executeTool: async (toolName, args) => {
        const id = `exec-${++executionCounter}`;
        const execution: AppMeshExecution = {
            id,
            type: 'tool',
            name: toolName,
            args,
            status: 'running',
            startedAt: Date.now(),
        };
        set(s => ({ executions: [execution, ...s.executions].slice(0, 50), isExecuting: true }));

        try {
            const res = await fetch('/api/appmesh/execute', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrf(),
                },
                body: JSON.stringify({ tool: toolName, args }),
            });
            const data = await res.json();
            set(s => ({
                isExecuting: false,
                executions: s.executions.map(e =>
                    e.id === id
                        ? {
                              ...e,
                              status: data.success ? 'completed' : 'failed',
                              result: data.result,
                              error: data.error,
                              completedAt: Date.now(),
                          }
                        : e
                ),
            }));
        } catch (e) {
            set(s => ({
                isExecuting: false,
                executions: s.executions.map(ex =>
                    ex.id === id ? { ...ex, status: 'failed', error: (e as Error).message, completedAt: Date.now() } : ex
                ),
            }));
        }
    },

    executePort: async (port, command, args) => {
        const id = `exec-${++executionCounter}`;
        const execution: AppMeshExecution = {
            id,
            type: 'port',
            name: `${port}.${command}`,
            args,
            status: 'running',
            startedAt: Date.now(),
        };
        set(s => ({ executions: [execution, ...s.executions].slice(0, 50), isExecuting: true }));

        try {
            const res = await fetch('/api/appmesh/port', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrf(),
                },
                body: JSON.stringify({ port, command, args }),
            });
            const data = await res.json();
            set(s => ({
                isExecuting: false,
                executions: s.executions.map(e =>
                    e.id === id
                        ? {
                              ...e,
                              status: data.success ? 'completed' : 'failed',
                              result: typeof data.result === 'string' ? data.result : JSON.stringify(data.result, null, 2),
                              error: data.error,
                              completedAt: Date.now(),
                          }
                        : e
                ),
            }));
        } catch (e) {
            set(s => ({
                isExecuting: false,
                executions: s.executions.map(ex =>
                    ex.id === id ? { ...ex, status: 'failed', error: (e as Error).message, completedAt: Date.now() } : ex
                ),
            }));
        }
    },

    clearExecutions: () => set({ executions: [] }),

    // Events state
    events: [],
    maxEvents: 200,
    eventsPaused: false,
    eventFilters: new Set(['dbus', 'midi', 'osc', 'tool']),

    addEvent: (event) => {
        if (get().eventsPaused) return;
        const full: AppMeshEvent = { ...event, id: `ev-${++eventCounter}`, timestamp: Date.now() };
        set(s => ({ events: [full, ...s.events].slice(0, s.maxEvents) }));
    },

    toggleEventFilter: (type) => {
        set(s => {
            const filters = new Set(s.eventFilters);
            if (filters.has(type)) filters.delete(type);
            else filters.add(type);
            return { eventFilters: filters };
        });
    },

    toggleEventsPaused: () => set(s => ({ eventsPaused: !s.eventsPaused })),
    clearEvents: () => set({ events: [] }),
}));
