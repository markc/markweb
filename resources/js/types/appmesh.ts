export type AppMeshPort = {
    name: string;
    commands: string[];
};

export type AppMeshTool = {
    name: string;
    description: string;
    inputSchema: {
        type: string;
        properties: Record<string, { type: string; description: string }>;
        required: string[];
    };
};

export type AppMeshPlugin = {
    name: string;
    tools: AppMeshTool[];
    toolCount?: number;
};

export type AppMeshStats = {
    available: boolean;
    hasFfi: boolean;
    toolCount: number;
    pluginCount: number;
    portCount: number;
    plugins: { name: string; toolCount: number }[];
};

export type AppMeshExecution = {
    id: string;
    type: 'tool' | 'port';
    name: string;
    args: Record<string, unknown>;
    status: 'pending' | 'running' | 'completed' | 'failed';
    result?: string;
    error?: string;
    startedAt: number;
    completedAt?: number;
};

export type AppMeshEvent = {
    id: string;
    type: 'dbus' | 'midi' | 'osc' | 'tool';
    source: string;
    message: string;
    timestamp: number;
};

export type DbusNode = {
    name: string;
    type: 'service' | 'interface' | 'method' | 'signal' | 'property' | 'node';
    children?: DbusNode[];
    args?: string;
    access?: string;
    value?: string;
};

export type MidiPort = {
    id: string;
    name: string;
    direction: 'input' | 'output';
    client: string;
};

export type MidiLink = {
    output: string;
    input: string;
};
