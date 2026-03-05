import { ExternalLink, Loader2, Search } from 'lucide-react';
import { useCallback, useRef, useState } from 'react';

interface SearchResult {
    url: string;
    title: string;
    content: string;
    template: string;
    thumbnail: string | null;
    img_src: string | null;
    published_date: string | null;
    engines: string[];
    score: number;
}

interface SearchResponse {
    results: SearchResult[];
    engines: Record<string, number>;
    total_time: number;
    total_results: number;
}

export default function SearchPanel() {
    const [query, setQuery] = useState('');
    const [category, setCategory] = useState<'general' | 'images' | 'videos'>('general');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [engines, setEngines] = useState<Record<string, number>>({});
    const [totalTime, setTotalTime] = useState(0);
    const [isSearching, setIsSearching] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleSearch = useCallback(async () => {
        const trimmed = query.trim();
        if (!trimmed || isSearching) return;

        setIsSearching(true);
        setHasSearched(true);

        try {
            const params = new URLSearchParams({ q: trimmed, category });
            const res = await fetch(`/api/searchx?${params}`, { credentials: 'same-origin' });
            const data: SearchResponse = await res.json();

            setResults(data.results);
            setEngines(data.engines);
            setTotalTime(data.total_time);
        } catch {
            setResults([]);
        } finally {
            setIsSearching(false);
        }
    }, [query, category, isSearching]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleSearch();
        }
    };

    const categories = [
        { value: 'general' as const, label: 'All' },
        { value: 'images' as const, label: 'Images' },
        { value: 'videos' as const, label: 'Videos' },
    ];

    return (
        <div className="flex h-full flex-col">
            {/* Search input */}
            <div className="border-b border-border p-3">
                <div className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-1.5">
                    <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Search the web..."
                        className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                    />
                    {isSearching && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                </div>

                {/* Category tabs */}
                <div className="mt-2 flex gap-1">
                    {categories.map((cat) => (
                        <button
                            key={cat.value}
                            onClick={() => setCategory(cat.value)}
                            className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                                category === cat.value
                                    ? 'bg-[var(--scheme-accent)] text-white'
                                    : 'text-muted-foreground hover:bg-muted'
                            }`}
                        >
                            {cat.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Results */}
            <div className="flex-1 overflow-y-auto">
                {isSearching && (
                    <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                    </div>
                )}

                {!isSearching && hasSearched && results.length === 0 && (
                    <p className="px-3 py-8 text-center text-sm text-muted-foreground">No results found</p>
                )}

                {!isSearching && results.length > 0 && (
                    <>
                        <div className="border-b border-border px-3 py-1.5 text-xs text-muted-foreground">
                            {results.length} results from {Object.keys(engines).join(', ')} ({totalTime}s)
                        </div>
                        {results.map((result, i) => (
                            <a
                                key={i}
                                href={result.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block border-b border-border px-3 py-2.5 transition-colors hover:bg-muted"
                            >
                                <div className="flex items-start gap-2">
                                    <div className="min-w-0 flex-1">
                                        <h3 className="truncate text-sm font-medium text-[var(--scheme-accent)]">
                                            {result.title || result.url}
                                        </h3>
                                        <p className="truncate text-xs text-muted-foreground">{new URL(result.url).hostname}</p>
                                        {result.content && (
                                            <p className="mt-0.5 line-clamp-2 text-xs text-foreground/80">{result.content}</p>
                                        )}
                                        <div className="mt-1 flex gap-1">
                                            {result.engines.map((eng) => (
                                                <span key={eng} className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                                                    {eng}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                    <ExternalLink className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                                </div>
                            </a>
                        ))}
                    </>
                )}

                {!hasSearched && (
                    <div className="px-3 py-8 text-center text-sm text-muted-foreground">
                        <Search className="mx-auto mb-2 h-8 w-8 opacity-30" />
                        <p>Search the web from here</p>
                        <p className="mt-1 text-xs">Results aggregated from multiple engines</p>
                    </div>
                )}
            </div>
        </div>
    );
}
