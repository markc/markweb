import { Head } from '@inertiajs/react';
import { FileAudio, Loader2, Mic, Play, RefreshCw, Sparkles, Square, Volume2 } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

const csrf = () => document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content ?? '';

type Voice = {
    name: string;
    language?: string;
};

export default function TtsStudio() {
    // Voice list
    const [voices, setVoices] = useState<Voice[]>([]);
    const [voicesLoading, setVoicesLoading] = useState(false);

    // TTS form
    const [text, setText] = useState('');
    const [selectedVoice, setSelectedVoice] = useState('');
    const [generating, setGenerating] = useState(false);
    const [ttsResult, setTtsResult] = useState<string | null>(null);
    const [playing, setPlaying] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    // Tutorial script form
    const [topic, setTopic] = useState('');
    const [duration, setDuration] = useState('60');
    const [style, setStyle] = useState('tutorial');
    const [scriptGenerating, setScriptGenerating] = useState(false);
    const [script, setScript] = useState<string | null>(null);

    const fetchVoices = useCallback(async () => {
        setVoicesLoading(true);
        try {
            const res = await fetch('/api/appmesh/tts/voices', {
                headers: { Accept: 'application/json', 'X-CSRF-TOKEN': csrf() },
            });
            const data = await res.json();
            if (data.success && data.result) {
                // Result format: "Voices: Kore (clear female), Charon (deep male), ...\n\nTest at: ..."
                const voiceLine = data.result.split('\n')[0].replace(/^Voices:\s*/, '');
                const parsed = voiceLine.split(',').map((v: string) => {
                    const match = v.trim().match(/^(\w+)\s*(?:\(([^)]+)\))?$/);
                    return match
                        ? { name: match[1], language: match[2] }
                        : { name: v.trim() };
                }).filter((v: Voice) => v.name);
                setVoices(parsed);
            }
        } catch { /* ignore */ }
        setVoicesLoading(false);
    }, []);

    useEffect(() => {
        fetchVoices();
    }, [fetchVoices]);

    const handleGenerate = useCallback(async () => {
        if (!text.trim()) return;
        setGenerating(true);
        setTtsResult(null);
        try {
            const res = await fetch('/api/appmesh/tts/generate', {
                method: 'POST',
                headers: { Accept: 'application/json', 'Content-Type': 'application/json', 'X-CSRF-TOKEN': csrf() },
                body: JSON.stringify({
                    text: text.trim(),
                    voice: selectedVoice || undefined,
                }),
            });
            const data = await res.json();
            setTtsResult(data.success ? data.result : `Error: ${data.error}`);
        } catch (e) {
            setTtsResult(`Error: ${(e as Error).message}`);
        }
        setGenerating(false);
    }, [text, selectedVoice]);

    const audioFile = ttsResult?.startsWith('Audio: ') ? ttsResult.slice(7).split('/').pop() : null;

    const handlePlayStop = useCallback(() => {
        if (playing && audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
            setPlaying(false);
            return;
        }
        if (!audioFile) return;
        const audio = new Audio(`/api/appmesh/tts/play?file=${encodeURIComponent(audioFile)}`);
        audioRef.current = audio;
        audio.onended = () => setPlaying(false);
        audio.onerror = () => setPlaying(false);
        audio.play();
        setPlaying(true);
    }, [playing, audioFile]);

    const handleScriptGenerate = useCallback(async () => {
        if (!topic.trim()) return;
        setScriptGenerating(true);
        setScript(null);
        try {
            const res = await fetch('/api/appmesh/tts/tutorial', {
                method: 'POST',
                headers: { Accept: 'application/json', 'Content-Type': 'application/json', 'X-CSRF-TOKEN': csrf() },
                body: JSON.stringify({
                    topic: topic.trim(),
                    duration,
                    style,
                }),
            });
            const data = await res.json();
            setScript(data.success ? data.result : `Error: ${data.error}`);
        } catch (e) {
            setScript(`Error: ${(e as Error).message}`);
        }
        setScriptGenerating(false);
    }, [topic, duration, style]);

    const useScriptForTts = useCallback(() => {
        if (script) {
            setText(script);
            setScript(null);
        }
    }, [script]);

    return (
        <>
            <Head title="TTS Studio" />
            <div className="mx-auto max-w-4xl space-y-6">
                <h1 className="text-2xl font-bold">TTS Studio</h1>

                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Text-to-Speech */}
                    <div className="rounded-xl border p-4 space-y-4">
                        <div className="flex items-center gap-2">
                            <Volume2 className="h-5 w-5" style={{ color: 'var(--scheme-accent)' }} />
                            <h2 className="text-lg font-semibold">Text to Speech</h2>
                        </div>

                        <div>
                            <label className="block text-xs font-medium mb-1" style={{ color: 'var(--scheme-fg-muted)' }}>
                                Voice
                            </label>
                            <div className="flex items-center gap-2">
                                <select
                                    value={selectedVoice}
                                    onChange={e => setSelectedVoice(e.target.value)}
                                    className="flex-1 rounded-lg border bg-transparent px-3 py-2 text-sm outline-none focus:border-[var(--scheme-accent)]"
                                    disabled={voicesLoading}
                                >
                                    <option value="">Default voice</option>
                                    {voices.map(v => (
                                        <option key={v.name} value={v.name}>
                                            {v.name}{v.language ? ` (${v.language})` : ''}
                                        </option>
                                    ))}
                                </select>
                                <button
                                    onClick={fetchVoices}
                                    className="rounded p-1.5 transition-colors hover:bg-muted"
                                    title="Refresh voices"
                                >
                                    <RefreshCw className={`h-4 w-4 ${voicesLoading ? 'animate-spin' : ''}`} style={{ color: 'var(--scheme-fg-muted)' }} />
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-medium mb-1" style={{ color: 'var(--scheme-fg-muted)' }}>
                                Text
                            </label>
                            <textarea
                                value={text}
                                onChange={e => setText(e.target.value)}
                                rows={8}
                                placeholder="Enter text to convert to speech..."
                                className="w-full rounded-lg border bg-transparent px-3 py-2 text-sm outline-none resize-none focus:border-[var(--scheme-accent)]"
                            />
                            <div className="flex items-center justify-between mt-1">
                                <span className="text-[10px]" style={{ color: 'var(--scheme-fg-muted)' }}>
                                    {text.length} / 5000 characters
                                </span>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <button
                                onClick={handleGenerate}
                                disabled={generating || !text.trim()}
                                className="flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-white transition-colors disabled:opacity-50"
                                style={{ backgroundColor: 'var(--scheme-accent)' }}
                            >
                                {generating ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Generating...
                                    </>
                                ) : (
                                    <>
                                        <Mic className="h-4 w-4" />
                                        Generate Speech
                                    </>
                                )}
                            </button>
                            <button
                                onClick={handlePlayStop}
                                disabled={!audioFile}
                                className="flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors disabled:opacity-50"
                                style={{
                                    backgroundColor: playing ? 'var(--scheme-accent)' : 'transparent',
                                    color: playing ? 'white' : 'var(--scheme-accent)',
                                    border: `1px solid var(--scheme-accent)`,
                                }}
                            >
                                {playing ? <Square className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                                {playing ? 'Stop' : 'Play'}
                            </button>
                        </div>

                        {ttsResult && (
                            <div className="rounded-lg p-3" style={{ backgroundColor: 'var(--scheme-bg-secondary)' }}>
                                <div className="flex items-center gap-2 mb-1">
                                    <FileAudio className="h-4 w-4" style={{ color: 'var(--scheme-accent)' }} />
                                    <h3 className="text-xs font-semibold" style={{ color: 'var(--scheme-fg-muted)' }}>Result</h3>
                                </div>
                                <pre className="text-xs font-mono whitespace-pre-wrap" style={{ color: 'var(--scheme-fg-secondary)' }}>
                                    {ttsResult}
                                </pre>
                            </div>
                        )}
                    </div>

                    {/* Tutorial Script Generator */}
                    <div className="rounded-xl border p-4 space-y-4">
                        <div className="flex items-center gap-2">
                            <Sparkles className="h-5 w-5" style={{ color: 'var(--scheme-accent)' }} />
                            <h2 className="text-lg font-semibold">Tutorial Script</h2>
                        </div>

                        <div>
                            <label className="block text-xs font-medium mb-1" style={{ color: 'var(--scheme-fg-muted)' }}>
                                Topic
                            </label>
                            <input
                                type="text"
                                value={topic}
                                onChange={e => setTopic(e.target.value)}
                                placeholder="e.g., How to use KDE Activities"
                                className="w-full rounded-lg border bg-transparent px-3 py-2 text-sm outline-none focus:border-[var(--scheme-accent)]"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-medium mb-1" style={{ color: 'var(--scheme-fg-muted)' }}>
                                    Duration (seconds)
                                </label>
                                <select
                                    value={duration}
                                    onChange={e => setDuration(e.target.value)}
                                    className="w-full rounded-lg border bg-transparent px-3 py-2 text-sm outline-none focus:border-[var(--scheme-accent)]"
                                >
                                    <option value="30">30s</option>
                                    <option value="60">60s</option>
                                    <option value="120">2 min</option>
                                    <option value="180">3 min</option>
                                    <option value="300">5 min</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-medium mb-1" style={{ color: 'var(--scheme-fg-muted)' }}>
                                    Style
                                </label>
                                <select
                                    value={style}
                                    onChange={e => setStyle(e.target.value)}
                                    className="w-full rounded-lg border bg-transparent px-3 py-2 text-sm outline-none focus:border-[var(--scheme-accent)]"
                                >
                                    <option value="tutorial">Tutorial</option>
                                    <option value="overview">Overview</option>
                                    <option value="walkthrough">Walkthrough</option>
                                    <option value="tips">Tips & Tricks</option>
                                </select>
                            </div>
                        </div>

                        <button
                            onClick={handleScriptGenerate}
                            disabled={scriptGenerating || !topic.trim()}
                            className="flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-white transition-colors disabled:opacity-50"
                            style={{ backgroundColor: 'var(--scheme-accent)' }}
                        >
                            {scriptGenerating ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Generating Script...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="h-4 w-4" />
                                    Generate Script
                                </>
                            )}
                        </button>

                        {script && (
                            <div className="rounded-lg p-3" style={{ backgroundColor: 'var(--scheme-bg-secondary)' }}>
                                <div className="flex items-center justify-between mb-1">
                                    <h3 className="text-xs font-semibold" style={{ color: 'var(--scheme-fg-muted)' }}>
                                        Generated Script
                                    </h3>
                                    <button
                                        onClick={useScriptForTts}
                                        className="text-[10px] font-medium transition-colors"
                                        style={{ color: 'var(--scheme-accent)' }}
                                    >
                                        Use for TTS →
                                    </button>
                                </div>
                                <pre
                                    className="max-h-64 overflow-auto text-xs font-mono whitespace-pre-wrap"
                                    style={{ color: 'var(--scheme-fg-secondary)' }}
                                >
                                    {script}
                                </pre>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
