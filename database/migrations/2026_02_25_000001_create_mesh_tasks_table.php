<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('mesh_tasks', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('origin_node', 100);
            $table->string('target_node', 100);
            $table->string('status', 20)->default('pending');
            $table->string('type', 20)->default('prompt'); // prompt, embed, tool

            $table->text('prompt');
            $table->text('result')->nullable();
            $table->text('error')->nullable();

            $table->string('provider')->nullable();
            $table->string('model')->nullable();
            $table->text('system_prompt')->nullable();
            $table->string('callback_url')->nullable();

            $table->uuid('parent_id')->nullable();
            $table->json('chain_config')->nullable();
            $table->json('meta')->nullable();
            $table->json('usage')->nullable();

            $table->timestamp('dispatched_at')->nullable();
            $table->timestamp('started_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();

            $table->foreign('parent_id')->references('id')->on('mesh_tasks')->nullOnDelete();
            $table->index('status');
            $table->index('origin_node');
            $table->index('target_node');
            $table->index('parent_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('mesh_tasks');
    }
};
