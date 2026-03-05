<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('document_chunks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('session_id')->nullable()->constrained('agent_sessions')->nullOnDelete();
            $table->string('filename');
            $table->string('storage_path');
            $table->string('mime_type', 100);
            $table->unsignedInteger('file_size');
            $table->smallInteger('chunk_index');
            $table->text('chunk_content');
            $table->json('metadata')->default('{}');
            $table->string('content_hash', 64);
            $table->string('status', 20)->default('processing');
            $table->timestamps();

            $table->index(['user_id', 'status']);
            $table->index(['user_id', 'filename']);
        });

        // Add pgvector embedding column (768-dim for nomic-embed-text)
        DB::statement('ALTER TABLE document_chunks ADD COLUMN embedding vector(768)');

        // Create HNSW index for efficient similarity search
        DB::statement('CREATE INDEX document_chunks_embedding_hnsw_idx ON document_chunks USING hnsw (embedding vector_cosine_ops) WITH (m = 16, ef_construction = 128)');

        // Add tsvector column for full-text search
        DB::statement('ALTER TABLE document_chunks ADD COLUMN content_tsv tsvector');

        // Create GIN index for fast full-text search
        DB::statement('CREATE INDEX document_chunks_content_tsv_idx ON document_chunks USING gin (content_tsv)');

        // Create trigger to auto-populate content_tsv on INSERT/UPDATE
        DB::statement("
            CREATE OR REPLACE FUNCTION document_chunks_content_tsv_trigger() RETURNS trigger AS \$\$
            BEGIN
                NEW.content_tsv := to_tsvector('english', COALESCE(NEW.chunk_content, ''));
                RETURN NEW;
            END;
            \$\$ LANGUAGE plpgsql;
        ");

        DB::statement('
            CREATE TRIGGER document_chunks_content_tsv_update
            BEFORE INSERT OR UPDATE OF chunk_content ON document_chunks
            FOR EACH ROW EXECUTE FUNCTION document_chunks_content_tsv_trigger();
        ');
    }

    public function down(): void
    {
        DB::statement('DROP TRIGGER IF EXISTS document_chunks_content_tsv_update ON document_chunks');
        DB::statement('DROP FUNCTION IF EXISTS document_chunks_content_tsv_trigger()');
        Schema::dropIfExists('document_chunks');
    }
};
