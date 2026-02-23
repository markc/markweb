export type * from './auth';
export type * from './navigation';
export type * from './ui';
export type * from './agent';

import type { Auth } from './auth';
import type { AgentSession, AvailableModels, SidebarStats } from './agent';

export type SharedData = {
    name: string;
    auth: Auth;
    sidebarOpen: boolean;
    sidebarConversations: AgentSession[];
    sidebarStats: SidebarStats | null;
    availableModels: AvailableModels;
    [key: string]: unknown;
};

export type PageProps<
    T extends Record<string, unknown> = Record<string, unknown>,
> = T & SharedData;
