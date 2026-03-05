<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Add brane-specific columns to existing memories table
        DB::statement('ALTER TABLE memories ADD COLUMN IF NOT EXISTS domain VARCHAR(10)');
        DB::statement('ALTER TABLE memories ADD COLUMN IF NOT EXISTS project VARCHAR(100)');
        DB::statement('ALTER TABLE memories ADD COLUMN IF NOT EXISTS importance FLOAT DEFAULT 0.5');
        DB::statement('ALTER TABLE memories ADD COLUMN IF NOT EXISTS retrieval_count INT DEFAULT 0');
        DB::statement('ALTER TABLE memories ADD COLUMN IF NOT EXISTS last_accessed TIMESTAMPTZ');
        DB::statement("ALTER TABLE memories ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}'");

        // Indexes for domain filtering
        DB::statement('CREATE INDEX IF NOT EXISTS idx_memories_domain ON memories (domain)');
        DB::statement('CREATE INDEX IF NOT EXISTS idx_memories_domain_project ON memories (domain, project)');

        // GIN index for array column tag filtering
        DB::statement('CREATE INDEX IF NOT EXISTS idx_memories_tags ON memories USING gin (tags)');
    }

    public function down(): void
    {
        DB::statement('DROP INDEX IF EXISTS idx_memories_tags');
        DB::statement('DROP INDEX IF EXISTS idx_memories_domain_project');
        DB::statement('DROP INDEX IF EXISTS idx_memories_domain');

        Schema::table('memories', function ($table) {
            $table->dropColumn(['domain', 'project', 'importance', 'retrieval_count', 'last_accessed', 'tags']);
        });
    }
};
