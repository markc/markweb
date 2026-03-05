import { Head, router } from '@inertiajs/react';
import { FormEvent, useState } from 'react';
import AppDualSidebarLayout from '@/layouts/app/app-dual-sidebar-layout';
import type { AvailableModels } from '@/types';

interface Props {
    availableModels: AvailableModels;
}

export default function AgentsCreate({ availableModels }: Props) {
    const [form, setForm] = useState({
        name: '',
        description: '',
        icon: '',
        model: '',
        provider: '',
        temperature: 0.7,
        top_p: 1.0,
        system_prompt: '',
    });

    // Set default model from first available
    if (!form.model && Object.keys(availableModels).length > 0) {
        const firstProvider = Object.keys(availableModels)[0];
        const firstModel = availableModels[firstProvider]?.[0];
        if (firstModel) {
            form.model = firstModel.id;
            form.provider = firstModel.provider;
        }
    }

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        router.post('/workspace/agents', form);
    };

    return (
        <AppDualSidebarLayout>
            <Head title="Create Agent" />
            <div className="mx-auto max-w-2xl px-4 py-6">
                <h1 className="mb-6 text-xl font-semibold">Create Agent</h1>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="mb-1 block text-sm font-medium">Name</label>
                        <input
                            type="text"
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            required
                            className="w-full rounded-lg border bg-transparent px-3 py-2 text-sm outline-none focus:border-[var(--scheme-accent)]"
                            style={{ borderColor: 'var(--scheme-border)' }}
                        />
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium">Description</label>
                        <textarea
                            value={form.description}
                            onChange={(e) => setForm({ ...form, description: e.target.value })}
                            rows={2}
                            className="w-full rounded-lg border bg-transparent px-3 py-2 text-sm outline-none focus:border-[var(--scheme-accent)]"
                            style={{ borderColor: 'var(--scheme-border)' }}
                        />
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium">Icon (emoji)</label>
                        <input
                            type="text"
                            value={form.icon}
                            onChange={(e) => setForm({ ...form, icon: e.target.value })}
                            maxLength={10}
                            className="w-24 rounded-lg border bg-transparent px-3 py-2 text-center text-lg outline-none focus:border-[var(--scheme-accent)]"
                            style={{ borderColor: 'var(--scheme-border)' }}
                        />
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium">Model</label>
                        <select
                            value={`${form.provider}:${form.model}`}
                            onChange={(e) => {
                                const [provider, ...modelParts] = e.target.value.split(':');
                                setForm({ ...form, provider, model: modelParts.join(':') });
                            }}
                            className="w-full rounded-lg border bg-transparent px-3 py-2 text-sm outline-none focus:border-[var(--scheme-accent)]"
                            style={{ borderColor: 'var(--scheme-border)' }}
                        >
                            {Object.entries(availableModels).map(([provider, models]) => (
                                <optgroup key={provider} label={provider.charAt(0).toUpperCase() + provider.slice(1)}>
                                    {models.map((m) => (
                                        <option key={m.id} value={`${m.provider}:${m.id}`}>
                                            {m.name}
                                        </option>
                                    ))}
                                </optgroup>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="mb-1 block text-sm font-medium">
                                Temperature: {form.temperature.toFixed(2)}
                            </label>
                            <input
                                type="range"
                                min="0"
                                max="2"
                                step="0.05"
                                value={form.temperature}
                                onChange={(e) => setForm({ ...form, temperature: parseFloat(e.target.value) })}
                                className="w-full"
                            />
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium">
                                Top P: {form.top_p.toFixed(2)}
                            </label>
                            <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.05"
                                value={form.top_p}
                                onChange={(e) => setForm({ ...form, top_p: parseFloat(e.target.value) })}
                                className="w-full"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium">System Prompt</label>
                        <textarea
                            value={form.system_prompt}
                            onChange={(e) => setForm({ ...form, system_prompt: e.target.value })}
                            rows={6}
                            placeholder="Custom system prompt for this agent..."
                            className="w-full rounded-lg border bg-transparent px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus:border-[var(--scheme-accent)]"
                            style={{ borderColor: 'var(--scheme-border)' }}
                        />
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button
                            type="submit"
                            className="rounded-lg px-6 py-2 text-sm font-medium text-white transition-colors hover:opacity-90"
                            style={{ backgroundColor: 'var(--scheme-accent)' }}
                        >
                            Create Agent
                        </button>
                        <button
                            type="button"
                            onClick={() => window.history.back()}
                            className="rounded-lg border px-6 py-2 text-sm transition-colors hover:bg-accent/10"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </AppDualSidebarLayout>
    );
}
