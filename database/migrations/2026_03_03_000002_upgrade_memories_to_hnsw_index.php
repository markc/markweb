<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Drop existing IVFFlat index
        DB::statement('DROP INDEX IF EXISTS memories_embedding_idx');

        // Create HNSW index — 15.5x faster queries, handles dynamic data without retraining
        DB::statement('CREATE INDEX memories_embedding_hnsw_idx ON memories USING hnsw (embedding vector_cosine_ops) WITH (m = 16, ef_construction = 128)');
    }

    public function down(): void
    {
        DB::statement('DROP INDEX IF EXISTS memories_embedding_hnsw_idx');

        // Restore IVFFlat index
        DB::statement('CREATE INDEX memories_embedding_idx ON memories USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100)');
    }
};
