<?php

namespace App\Services\Document;

use App\Models\DocumentChunk;
use App\Services\Memory\EmbeddingService;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class DocumentSearchService
{
    public function __construct(
        protected EmbeddingService $embeddingService,
    ) {}

    /**
     * Hybrid search combining vector similarity and keyword matching via RRF.
     *
     * @return Collection<int, DocumentChunk>
     */
    public function search(string $query, int $userId, int $limit = 5, ?string $filename = null): Collection
    {
        $k = config('memory.search.rrf_k', 60);
        $candidateLimit = $limit * config('memory.search.candidate_multiplier', 3);

        $vectorResults = $this->vectorSearch($query, $userId, $candidateLimit, $filename);
        $keywordResults = $this->keywordSearch($query, $userId, $candidateLimit, $filename);

        return $this->reciprocalRankFusion($vectorResults, $keywordResults, $k, $limit);
    }

    /**
     * @return Collection<int, array{id: int, rank: int}>
     */
    protected function vectorSearch(string $query, int $userId, int $limit, ?string $filename): Collection
    {
        try {
            $embedding = $this->embeddingService->embed($query);
            $vector = $this->embeddingService->toVector($embedding);

            $sql = '
                SELECT id, embedding <=> ?::vector AS distance
                FROM document_chunks
                WHERE user_id = ? AND status = ? AND embedding IS NOT NULL
            ';
            $params = [$vector, $userId, 'ready'];

            if ($filename) {
                $sql .= ' AND filename = ?';
                $params[] = $filename;
            }

            $sql .= ' ORDER BY embedding <=> ?::vector LIMIT ?';
            $params[] = $vector;
            $params[] = $limit;

            $results = DB::select($sql, $params);

            return collect($results)->values()->map(fn ($row, $index) => [
                'id' => $row->id,
                'rank' => $index + 1,
            ]);
        } catch (\Throwable $e) {
            Log::warning('Document vector search failed', ['error' => $e->getMessage()]);

            return collect();
        }
    }

    /**
     * @return Collection<int, array{id: int, rank: int}>
     */
    protected function keywordSearch(string $query, int $userId, int $limit, ?string $filename): Collection
    {
        $sql = "
            SELECT id, ts_rank_cd(content_tsv, plainto_tsquery('english', ?)) AS rank_score
            FROM document_chunks
            WHERE user_id = ? AND status = ? AND content_tsv @@ plainto_tsquery('english', ?)
        ";
        $params = [$query, $userId, 'ready', $query];

        if ($filename) {
            $sql .= ' AND filename = ?';
            $params[] = $filename;
        }

        $sql .= ' ORDER BY rank_score DESC LIMIT ?';
        $params[] = $limit;

        $results = DB::select($sql, $params);

        return collect($results)->values()->map(fn ($row, $index) => [
            'id' => $row->id,
            'rank' => $index + 1,
        ]);
    }

    /**
     * @return Collection<int, DocumentChunk>
     */
    protected function reciprocalRankFusion(
        Collection $vectorResults,
        Collection $keywordResults,
        int $k,
        int $limit,
    ): Collection {
        $vectorWeight = config('memory.search.vector_weight', 0.7);
        $keywordWeight = config('memory.search.keyword_weight', 0.3);

        $scores = [];

        foreach ($vectorResults as $result) {
            $id = $result['id'];
            $scores[$id] = ($scores[$id] ?? 0) + ($vectorWeight / ($k + $result['rank']));
        }

        foreach ($keywordResults as $result) {
            $id = $result['id'];
            $scores[$id] = ($scores[$id] ?? 0) + ($keywordWeight / ($k + $result['rank']));
        }

        arsort($scores);
        $topIds = array_slice(array_keys($scores), 0, $limit);

        if (empty($topIds)) {
            return collect();
        }

        $chunks = DocumentChunk::whereIn('id', $topIds)->get()->keyBy('id');

        return collect($topIds)
            ->map(fn ($id) => $chunks->get($id))
            ->filter();
    }
}
