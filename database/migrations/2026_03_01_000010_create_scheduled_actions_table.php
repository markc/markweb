<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('scheduled_actions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('agent_id')->constrained('agents')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('name');
            $table->string('schedule');
            $table->text('prompt');
            $table->string('trigger_type', 20)->default('cron');
            $table->string('event_class')->nullable();
            $table->json('event_filter')->nullable();
            $table->string('webhook_token', 64)->nullable()->unique();
            $table->json('health_check')->nullable();
            $table->integer('max_retries')->default(1);
            $table->integer('retry_count')->default(0);
            $table->text('last_error')->nullable();
            $table->integer('last_duration_ms')->nullable();
            $table->integer('cooldown_seconds')->default(0);
            $table->json('metadata')->nullable();
            $table->string('session_key')->nullable();
            $table->boolean('is_enabled')->default(true);
            $table->timestamp('last_run_at')->nullable();
            $table->timestamp('next_run_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('scheduled_actions');
    }
};
