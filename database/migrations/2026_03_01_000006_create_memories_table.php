<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('memories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('agent_id')->constrained('agents')->cascadeOnDelete();
            $table->foreignId('session_id')->nullable()->constrained('agent_sessions')->nullOnDelete();
            $table->text('content');
            $table->json('metadata')->default('{}');
            $table->string('memory_type', 50)->default('conversation');
            $table->string('source_file')->nullable();
            $table->string('content_hash', 64)->nullable();
            $table->timestamps();

            $table->index(['agent_id', 'memory_type']);
        });

        // Add pgvector embedding column (768-dim for nomic-embed-text)
        DB::statement('ALTER TABLE memories ADD COLUMN embedding vector(768)');

        // Add IVFFlat index for efficient similarity search
        DB::statement('CREATE INDEX memories_embedding_idx ON memories USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100)');

        // Add tsvector column for full-text search
        DB::statement('ALTER TABLE memories ADD COLUMN content_tsv tsvector');

        // Create GIN index for fast full-text search
        DB::statement('CREATE INDEX memories_content_tsv_idx ON memories USING gin (content_tsv)');

        // Create trigger to auto-populate content_tsv on INSERT/UPDATE
        DB::statement("
            CREATE OR REPLACE FUNCTION memories_content_tsv_trigger() RETURNS trigger AS \$\$
            BEGIN
                NEW.content_tsv := to_tsvector('english', COALESCE(NEW.content, ''));
                RETURN NEW;
            END;
            \$\$ LANGUAGE plpgsql;
        ");

        DB::statement('
            CREATE TRIGGER memories_content_tsv_update
            BEFORE INSERT OR UPDATE OF content ON memories
            FOR EACH ROW EXECUTE FUNCTION memories_content_tsv_trigger();
        ');
    }

    public function down(): void
    {
        DB::statement('DROP TRIGGER IF EXISTS memories_content_tsv_update ON memories');
        DB::statement('DROP FUNCTION IF EXISTS memories_content_tsv_trigger()');
        Schema::dropIfExists('memories');
    }
};
