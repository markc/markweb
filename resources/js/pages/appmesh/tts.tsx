import { Head } from '@inertiajs/react';
import {
    CheckCircle2,
    Circle,
    Download,
    FileAudio,
    Film,
    Loader2,
    Mic,
    Play,
    RefreshCw,
    Sparkles,
    Square,
    Video,
    Volume2,
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

const csrf = () => document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content ?? '';

type Voice = {
    name: string;
    language?: string;
};

/** Extract a filename from a result line like "Audio: /home/.../speech_123.wav" */
function parseFilename(line: string): string | null {
    const match = line.match(/:\s*(.+)/);
    if (!match) return null;
    const path = match[1].trim();
    return path.split('/').pop() ?? null;
}

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

    // Full tutorial (one-shot)
    const [fullTutorialGenerating, setFullTutorialGenerating] = useState(false);
    const [fullTutorialResult, setFullTutorialResult] = useState<string | null>(null);

    // Pipeline state
    const [audioFilePath, setAudioFilePath] = useState<string | null>(null);
    const [videoFilePath, setVideoFilePath] = useState<string | null>(null);
    const [finalVideoPath, setFinalVideoPath] = useState<string | null>(null);

    // Recording
    const [recording, setRecording] = useState(false);
    const [recordingElapsed, setRecordingElapsed] = useState(0);
    const [recordingStatus, setRecordingStatus] = useState<string | null>(null);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // Combine
    const [combining, setCombining] = useState(false);
    const [combineResult, setCombineResult] = useState<string | null>(null);

    const fetchVoices = useCallback(async () => {
        setVoicesLoading(true);
        try {
            const res = await fetch('/api/appmesh/tts/voices', {
                headers: { Accept: 'application/json', 'X-CSRF-TOKEN': csrf() },
            });
            const data = await res.json();
            if (data.success && data.result) {
                const voiceLine = data.result.split('\n')[0].replace(/^Voices:\s*/, '');
                const parsed = voiceLine
                    .split(',')
                    .map((v: string) => {
                        const match = v.trim().match(/^(\w+)\s*(?:\(([^)]+)\))?$/);
                        return match ? { name: match[1], language: match[2] } : { name: v.trim() };
                    })
                    .filter((v: Voice) => v.name);
                setVoices(parsed);
            }
        } catch {
            /* ignore */
        }
        setVoicesLoading(false);
    }, []);

    useEffect(() => {
        fetchVoices();
    }, [fetchVoices]);

    // Check recording status on mount
    useEffect(() => {
        (async () => {
            try {
                const res = await fetch('/api/appmesh/tts/record', {
                    method: 'POST',
                    headers: { Accept: 'application/json', 'Content-Type': 'application/json', 'X-CSRF-TOKEN': csrf() },
                    body: JSON.stringify({ action: 'status' }),
                });
                const data = await res.json();
                if (data.success && data.result && !data.result.includes('No recording')) {
                    setRecording(true);
                    setRecordingStatus(data.result);
                }
            } catch {
                /* ignore */
            }
        })();
    }, []);

    // Timer for recording
    useEffect(() => {
        if (recording) {
            setRecordingElapsed(0);
            timerRef.current = setInterval(() => setRecordingElapsed((e) => e + 1), 1000);
        } else if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [recording]);

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
            const result = data.success ? data.result : `Error: ${data.error ?? data.message ?? 'Unknown error'}`;
            setTtsResult(result);
            // Parse audio filename into pipeline state
            if (data.success && data.result) {
                const audioLine = data.result.split('\n').find((l: string) => l.startsWith('Audio:'));
                if (audioLine) {
                    const fname = parseFilename(audioLine);
                    if (fname) setAudioFilePath(fname);
                }
            }
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
            setScript(data.success ? data.result : `Error: ${data.error ?? data.message ?? 'Unknown error'}`);
        } catch (e) {
            setScript(`Error: ${(e as Error).message}`);
        }
        setScriptGenerating(false);
    }, [topic, duration, style]);

    const handleFullTutorial = useCallback(async () => {
        if (!topic.trim()) return;
        setFullTutorialGenerating(true);
        setFullTutorialResult(null);
        try {
            const res = await fetch('/api/appmesh/tts/tutorial-full', {
                method: 'POST',
                headers: { Accept: 'application/json', 'Content-Type': 'application/json', 'X-CSRF-TOKEN': csrf() },
                body: JSON.stringify({
                    topic: topic.trim(),
                    voice: selectedVoice || undefined,
                    style,
                }),
            });
            const data = await res.json();
            const result = data.success ? data.result : `Error: ${data.error ?? data.message ?? 'Unknown error'}`;
            setFullTutorialResult(result);
            // Parse script + audio from result
            if (data.success && data.result) {
                const lines: string[] = data.result.split('\n');
                const scriptLine = lines.find((l: string) => l.startsWith('Script:'));
                const audioLine = lines.find((l: string) => l.startsWith('Audio:'));
                if (audioLine) {
                    const fname = parseFilename(audioLine);
                    if (fname) {
                        setAudioFilePath(fname);
                        setTtsResult(`Audio: ${audioLine.split(':').slice(1).join(':').trim()}`);
                    }
                }
                // Try to read script content from the result (lines after the header)
                if (scriptLine) {
                    // The script text may appear after a blank line
                    const headerEndIdx = lines.findIndex((l: string) => l.startsWith('Next:'));
                    if (headerEndIdx > 0) {
                        setScript(lines.slice(headerEndIdx + 1).join('\n').trim() || null);
                    }
                }
            }
        } catch (e) {
            setFullTutorialResult(`Error: ${(e as Error).message}`);
        }
        setFullTutorialGenerating(false);
    }, [topic, selectedVoice, style]);

    const useScriptForTts = useCallback(() => {
        if (script) {
            setText(script);
            setScript(null);
        }
    }, [script]);

    const handleRecordToggle = useCallback(async () => {
        const action = recording ? 'stop' : 'start';
        try {
            const res = await fetch('/api/appmesh/tts/record', {
                method: 'POST',
                headers: { Accept: 'application/json', 'Content-Type': 'application/json', 'X-CSRF-TOKEN': csrf() },
                body: JSON.stringify({ action }),
            });
            const data = await res.json();
            const result = data.success ? data.result : `Error: ${data.error ?? data.message ?? 'Unknown error'}`;
            setRecordingStatus(result);
            if (action === 'start' && data.success) {
                setRecording(true);
            } else if (action === 'stop') {
                setRecording(false);
                // Parse video filename
                if (data.success && data.result) {
                    const lines: string[] = data.result.split('\n');
                    for (const line of lines) {
                        if (line.includes('.mp4') || line.includes('Output:') || line.includes('stopped:')) {
                            const fname = parseFilename(line);
                            if (fname) {
                                setVideoFilePath(fname);
                                break;
                            }
                        }
                    }
                }
            }
        } catch (e) {
            setRecordingStatus(`Error: ${(e as Error).message}`);
        }
    }, [recording]);

    const handleCombine = useCallback(async () => {
        if (!audioFilePath || !videoFilePath) return;
        setCombining(true);
        setCombineResult(null);
        try {
            const res = await fetch('/api/appmesh/tts/combine', {
                method: 'POST',
                headers: { Accept: 'application/json', 'Content-Type': 'application/json', 'X-CSRF-TOKEN': csrf() },
                body: JSON.stringify({ video: videoFilePath, audio: audioFilePath }),
            });
            const data = await res.json();
            const result = data.success ? data.result : `Error: ${data.error ?? data.message ?? 'Unknown error'}`;
            setCombineResult(result);
            if (data.success && data.result) {
                const lines: string[] = data.result.split('\n');
                for (const line of lines) {
                    if (line.includes('.mp4') && (line.includes('Final') || line.includes('Output') || line.includes('video:'))) {
                        const fname = parseFilename(line);
                        if (fname) {
                            setFinalVideoPath(fname);
                            break;
                        }
                    }
                }
            }
        } catch (e) {
            setCombineResult(`Error: ${(e as Error).message}`);
        }
        setCombining(false);
    }, [audioFilePath, videoFilePath]);

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60)
            .toString()
            .padStart(2, '0');
        const s = (seconds % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };

    const pipelineSteps = [
        { label: 'Script', done: !!script || !!text.trim() },
        { label: 'Audio', done: !!audioFilePath },
        { label: 'Video', done: !!videoFilePath },
        { label: 'Final', done: !!finalVideoPath },
    ];

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
                                    onChange={(e) => setSelectedVoice(e.target.value)}
                                    className="flex-1 rounded-lg border bg-transparent px-3 py-2 text-sm outline-none focus:border-[var(--scheme-accent)]"
                                    disabled={voicesLoading}
                                >
                                    <option value="">Default voice</option>
                                    {voices.map((v) => (
                                        <option key={v.name} value={v.name}>
                                            {v.name}
                                            {v.language ? ` (${v.language})` : ''}
                                        </option>
                                    ))}
                                </select>
                                <button onClick={fetchVoices} className="rounded p-1.5 transition-colors hover:bg-muted" title="Refresh voices">
                                    <RefreshCw
                                        className={`h-4 w-4 ${voicesLoading ? 'animate-spin' : ''}`}
                                        style={{ color: 'var(--scheme-fg-muted)' }}
                                    />
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-medium mb-1" style={{ color: 'var(--scheme-fg-muted)' }}>
                                Text
                            </label>
                            <textarea
                                value={text}
                                onChange={(e) => setText(e.target.value)}
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
                                    <h3 className="text-xs font-semibold" style={{ color: 'var(--scheme-fg-muted)' }}>
                                        Result
                                    </h3>
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
                                onChange={(e) => setTopic(e.target.value)}
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
                                    onChange={(e) => setDuration(e.target.value)}
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
                                    onChange={(e) => setStyle(e.target.value)}
                                    className="w-full rounded-lg border bg-transparent px-3 py-2 text-sm outline-none focus:border-[var(--scheme-accent)]"
                                >
                                    <option value="tutorial">Tutorial</option>
                                    <option value="overview">Overview</option>
                                    <option value="walkthrough">Walkthrough</option>
                                    <option value="tips">Tips & Tricks</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <button
                                onClick={handleScriptGenerate}
                                disabled={scriptGenerating || fullTutorialGenerating || !topic.trim()}
                                className="flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-white transition-colors disabled:opacity-50"
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
                            <button
                                onClick={handleFullTutorial}
                                disabled={scriptGenerating || fullTutorialGenerating || !topic.trim()}
                                className="flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors disabled:opacity-50"
                                style={{
                                    color: 'var(--scheme-accent)',
                                    border: '1px solid var(--scheme-accent)',
                                }}
                            >
                                {fullTutorialGenerating ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Full...
                                    </>
                                ) : (
                                    <>
                                        <Film className="h-4 w-4" />
                                        Full Tutorial
                                    </>
                                )}
                            </button>
                        </div>

                        {fullTutorialResult && (
                            <div className="rounded-lg p-3" style={{ backgroundColor: 'var(--scheme-bg-secondary)' }}>
                                <div className="flex items-center gap-2 mb-1">
                                    <Film className="h-4 w-4" style={{ color: 'var(--scheme-accent)' }} />
                                    <h3 className="text-xs font-semibold" style={{ color: 'var(--scheme-fg-muted)' }}>
                                        Full Tutorial Result
                                    </h3>
                                </div>
                                <pre className="text-xs font-mono whitespace-pre-wrap" style={{ color: 'var(--scheme-fg-secondary)' }}>
                                    {fullTutorialResult}
                                </pre>
                            </div>
                        )}

                        {script && (
                            <div className="rounded-lg p-3" style={{ backgroundColor: 'var(--scheme-bg-secondary)' }}>
                                <div className="flex items-center justify-between mb-1">
                                    <h3 className="text-xs font-semibold" style={{ color: 'var(--scheme-fg-muted)' }}>
                                        Generated Script
                                    </h3>
                                    <button onClick={useScriptForTts} className="text-[10px] font-medium transition-colors" style={{ color: 'var(--scheme-accent)' }}>
                                        Use for TTS →
                                    </button>
                                </div>
                                <pre className="max-h-64 overflow-auto text-xs font-mono whitespace-pre-wrap" style={{ color: 'var(--scheme-fg-secondary)' }}>
                                    {script}
                                </pre>
                            </div>
                        )}
                    </div>
                </div>

                {/* Video Production Pipeline */}
                <div className="rounded-xl border p-4 space-y-4">
                    <div className="flex items-center gap-2">
                        <Film className="h-5 w-5" style={{ color: 'var(--scheme-accent)' }} />
                        <h2 className="text-lg font-semibold">Video Production</h2>
                    </div>

                    {/* Pipeline status badges */}
                    <div className="flex items-center gap-3">
                        <span className="text-xs font-medium" style={{ color: 'var(--scheme-fg-muted)' }}>
                            Pipeline:
                        </span>
                        {pipelineSteps.map((step) => (
                            <div key={step.label} className="flex items-center gap-1">
                                {step.done ? (
                                    <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                                ) : (
                                    <Circle className="h-3.5 w-3.5" style={{ color: 'var(--scheme-fg-muted)' }} />
                                )}
                                <span
                                    className="text-xs font-medium"
                                    style={{ color: step.done ? 'var(--scheme-fg)' : 'var(--scheme-fg-muted)' }}
                                >
                                    {step.label}
                                </span>
                            </div>
                        ))}
                    </div>

                    <div className="grid gap-4 lg:grid-cols-2">
                        {/* Screen Recording */}
                        <div className="space-y-3">
                            <h3 className="text-sm font-semibold" style={{ color: 'var(--scheme-fg-secondary)' }}>
                                Screen Recording
                            </h3>
                            <button
                                onClick={handleRecordToggle}
                                className="flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors"
                                style={
                                    recording
                                        ? { backgroundColor: '#dc2626', color: 'white' }
                                        : { backgroundColor: 'var(--scheme-accent)', color: 'white' }
                                }
                            >
                                {recording ? (
                                    <>
                                        <Square className="h-4 w-4" />
                                        Stop Recording
                                        <span className="ml-1 font-mono tabular-nums">{formatTime(recordingElapsed)}</span>
                                    </>
                                ) : (
                                    <>
                                        <span className="relative flex h-3 w-3">
                                            <span className="absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75 animate-ping" />
                                            <span className="relative inline-flex h-3 w-3 rounded-full bg-red-500" />
                                        </span>
                                        Start Recording
                                    </>
                                )}
                            </button>
                            {recordingStatus && (
                                <p className="text-xs font-mono" style={{ color: 'var(--scheme-fg-muted)' }}>
                                    {recordingStatus}
                                </p>
                            )}
                            {videoFilePath && (
                                <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--scheme-fg-secondary)' }}>
                                    <Video className="h-3.5 w-3.5" />
                                    <span className="font-mono">{videoFilePath}</span>
                                </div>
                            )}
                        </div>

                        {/* Combine Video + Audio */}
                        <div className="space-y-3">
                            <h3 className="text-sm font-semibold" style={{ color: 'var(--scheme-fg-secondary)' }}>
                                Combine Video + Audio
                            </h3>
                            <div className="text-xs space-y-1" style={{ color: 'var(--scheme-fg-muted)' }}>
                                <div className="flex items-center gap-1.5">
                                    <FileAudio className="h-3.5 w-3.5" />
                                    <span>Audio: </span>
                                    <span className="font-mono" style={{ color: audioFilePath ? 'var(--scheme-fg-secondary)' : undefined }}>
                                        {audioFilePath ?? 'none'}
                                    </span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <Video className="h-3.5 w-3.5" />
                                    <span>Video: </span>
                                    <span className="font-mono" style={{ color: videoFilePath ? 'var(--scheme-fg-secondary)' : undefined }}>
                                        {videoFilePath ?? 'none'}
                                    </span>
                                </div>
                            </div>
                            <button
                                onClick={handleCombine}
                                disabled={combining || !audioFilePath || !videoFilePath}
                                className="flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-white transition-colors disabled:opacity-50"
                                style={{ backgroundColor: 'var(--scheme-accent)' }}
                            >
                                {combining ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Combining...
                                    </>
                                ) : (
                                    <>
                                        <Film className="h-4 w-4" />
                                        Combine → Final Video
                                    </>
                                )}
                            </button>
                            {combineResult && (
                                <p className="text-xs font-mono" style={{ color: 'var(--scheme-fg-muted)' }}>
                                    {combineResult}
                                </p>
                            )}
                            {finalVideoPath && (
                                <div className="flex items-center gap-2">
                                    <a
                                        href={`/api/appmesh/tts/play?file=${encodeURIComponent(finalVideoPath)}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors"
                                        style={{
                                            color: 'var(--scheme-accent)',
                                            border: '1px solid var(--scheme-accent)',
                                        }}
                                    >
                                        <Play className="h-3.5 w-3.5" />
                                        Play
                                    </a>
                                    <a
                                        href={`/api/appmesh/tts/play?file=${encodeURIComponent(finalVideoPath)}`}
                                        download={finalVideoPath}
                                        className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors"
                                        style={{
                                            color: 'var(--scheme-accent)',
                                            border: '1px solid var(--scheme-accent)',
                                        }}
                                    >
                                        <Download className="h-3.5 w-3.5" />
                                        Download
                                    </a>
                                    <span className="text-xs font-mono" style={{ color: 'var(--scheme-fg-secondary)' }}>
                                        {finalVideoPath}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
