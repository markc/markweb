import { Pause, Play, Trash2 } from 'lucide-react';
import { useAppmeshStore } from '@/stores/appmesh';

const typeColors: Record<string, string> = {
    dbus: 'oklch(60% 0.15 220)',
    midi: 'oklch(60% 0.15 150)',
    osc: 'oklch(60% 0.15 45)',
    tool: 'oklch(60% 0.15 30)',
};

const typeLabels: Record<string, string> = {
    dbus: 'D-Bus',
    midi: 'MIDI',
    osc: 'OSC',
    tool: 'Tool',
};

function formatTime(ts: number): string {
    const d = new Date(ts);
    return d.toLocaleTimeString('en-AU', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

export default function AppmeshEventsPanel() {
    const events = useAppmeshStore(s => s.events);
    const paused = useAppmeshStore(s => s.eventsPaused);
    const filters = useAppmeshStore(s => s.eventFilters);
    const toggleFilter = useAppmeshStore(s => s.toggleEventFilter);
    const togglePaused = useAppmeshStore(s => s.toggleEventsPaused);
    const clearEvents = useAppmeshStore(s => s.clearEvents);

    const filteredEvents = events.filter(e => filters.has(e.type));

    return (
        <div className="flex h-full flex-col">
            {/* Filter toggles */}
            <div
                className="flex items-center gap-1 border-b px-3 py-2"
                style={{ borderColor: 'var(--glass-border)' }}
            >
                {['dbus', 'midi', 'osc', 'tool'].map(type => (
                    <button
                        key={type}
                        onClick={() => toggleFilter(type)}
                        className="flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium transition-colors"
                        style={{
                            backgroundColor: filters.has(type) ? typeColors[type] + '22' : 'transparent',
                            color: filters.has(type) ? typeColors[type] : 'var(--scheme-fg-muted)',
                            border: `1px solid ${filters.has(type) ? typeColors[type] : 'var(--scheme-border)'}`,
                        }}
                    >
                        <span
                            className="h-1.5 w-1.5 rounded-full"
                            style={{ backgroundColor: typeColors[type] }}
                        />
                        {typeLabels[type]}
                    </button>
                ))}
                <div className="flex-1" />
                <button
                    onClick={togglePaused}
                    className="rounded p-1 transition-colors hover:bg-[var(--scheme-bg-secondary)]"
                    style={{ color: 'var(--scheme-fg-muted)' }}
                    title={paused ? 'Resume' : 'Pause'}
                >
                    {paused ? <Play className="h-3 w-3" /> : <Pause className="h-3 w-3" />}
                </button>
                <button
                    onClick={clearEvents}
                    className="rounded p-1 transition-colors hover:bg-[var(--scheme-bg-secondary)]"
                    style={{ color: 'var(--scheme-fg-muted)' }}
                    title="Clear events"
                >
                    <Trash2 className="h-3 w-3" />
                </button>
            </div>

            {/* Event list */}
            <div className="flex-1 overflow-y-auto">
                {filteredEvents.length === 0 ? (
                    <div className="flex items-center justify-center py-8">
                        <p className="text-xs" style={{ color: 'var(--scheme-fg-muted)' }}>
                            {paused ? 'Paused' : 'No events yet'}
                        </p>
                    </div>
                ) : (
                    <div className="divide-y" style={{ borderColor: 'var(--glass-border)' }}>
                        {filteredEvents.map(event => (
                            <div key={event.id} className="px-3 py-1.5">
                                <div className="flex items-center gap-1.5">
                                    <span
                                        className="h-1.5 w-1.5 rounded-full shrink-0"
                                        style={{ backgroundColor: typeColors[event.type] }}
                                    />
                                    <span className="text-[10px] font-mono" style={{ color: 'var(--scheme-fg-muted)' }}>
                                        {formatTime(event.timestamp)}
                                    </span>
                                    <span className="text-[11px] font-medium truncate" style={{ color: 'var(--scheme-fg-secondary)' }}>
                                        {event.source}
                                    </span>
                                </div>
                                <p className="ml-4 text-[10px] truncate" style={{ color: 'var(--scheme-fg-muted)' }}>
                                    {event.message}
                                </p>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Status bar */}
            <div
                className="flex items-center justify-between border-t px-3 py-1"
                style={{ borderColor: 'var(--glass-border)' }}
            >
                <span className="text-[10px]" style={{ color: 'var(--scheme-fg-muted)' }}>
                    {filteredEvents.length} event{filteredEvents.length !== 1 ? 's' : ''}
                </span>
                {paused && (
                    <span className="text-[10px] font-medium" style={{ color: 'oklch(60% 0.15 45)' }}>
                        Paused
                    </span>
                )}
            </div>
        </div>
    );
}
