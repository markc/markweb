<?php

namespace App\Jobs;

use App\Events\DocumentProcessed;
use App\Models\DocumentChunk;
use App\Services\Document\DocumentExtractor;
use App\Services\Document\TextChunker;
use App\Services\Memory\EmbeddingService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class ProcessDocumentUpload implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 2;

    public int $timeout = 300;

    public function __construct(
        public int $userId,
        public string $storagePath,
        public string $filename,
        public string $mimeType,
        public int $fileSize,
        public ?int $sessionId = null,
    ) {}

    public function handle(
        DocumentExtractor $extractor,
        TextChunker $chunker,
        EmbeddingService $embeddingService,
    ): void {
        $fullPath = Storage::disk('local')->path($this->storagePath);

        try {
            // Extract text from document
            $doc = $extractor->extract($fullPath);

            // Chunk the text
            $chunks = $chunker->chunk($doc->text);

            if (empty($chunks)) {
                Log::warning('ProcessDocumentUpload: no chunks produced', [
                    'filename' => $this->filename,
                ]);

                return;
            }

            $contentHash = hash('sha256', $doc->text);

            // Generate embeddings in batch
            $embeddings = $embeddingService->embedBatch($chunks);

            // Store all chunks
            foreach ($chunks as $index => $chunkContent) {
                $vector = isset($embeddings[$index])
                    ? $embeddingService->toVector($embeddings[$index])
                    : null;

                $chunk = DocumentChunk::create([
                    'user_id' => $this->userId,
                    'session_id' => $this->sessionId,
                    'filename' => $this->filename,
                    'storage_path' => $this->storagePath,
                    'mime_type' => $this->mimeType,
                    'file_size' => $this->fileSize,
                    'chunk_index' => $index,
                    'chunk_content' => $chunkContent,
                    'metadata' => $doc->metadata,
                    'content_hash' => $contentHash,
                    'status' => $vector ? 'ready' : 'processing',
                ]);

                if ($vector) {
                    DB::statement(
                        'UPDATE document_chunks SET embedding = ?::vector WHERE id = ?',
                        [$vector, $chunk->id]
                    );
                }
            }

            // Mark any remaining processing chunks as ready
            DocumentChunk::where('user_id', $this->userId)
                ->where('filename', $this->filename)
                ->where('content_hash', $contentHash)
                ->where('status', 'processing')
                ->update(['status' => 'ready']);

            event(new DocumentProcessed($this->userId, $this->filename, count($chunks)));

            Log::info('ProcessDocumentUpload: completed', [
                'filename' => $this->filename,
                'chunks' => count($chunks),
            ]);
        } catch (\Throwable $e) {
            // Mark chunks as failed
            DocumentChunk::where('user_id', $this->userId)
                ->where('filename', $this->filename)
                ->where('status', 'processing')
                ->update(['status' => 'failed']);

            event(new DocumentProcessed($this->userId, $this->filename, 0, $e->getMessage()));

            throw $e;
        }
    }

    public function failed(\Throwable $e): void
    {
        Log::error('ProcessDocumentUpload failed', [
            'filename' => $this->filename,
            'error' => $e->getMessage(),
        ]);
    }
}
