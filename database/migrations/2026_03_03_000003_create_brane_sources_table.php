<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('brane_sources', function (Blueprint $table) {
            $table->uuid('id')->primary()->default(DB::raw('gen_random_uuid()'));
            $table->text('file_path')->unique();
            $table->string('domain', 10);
            $table->string('project', 100)->nullable();
            $table->string('file_hash', 64);
            $table->integer('chunks_count')->default(0);
            $table->timestampTz('last_indexed');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('brane_sources');
    }
};
