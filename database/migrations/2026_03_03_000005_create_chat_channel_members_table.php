<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('chat_channel_members', function (Blueprint $table) {
            $table->foreignId('channel_id')->constrained('chat_channels')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('role', 20)->default('member');
            $table->timestamp('joined_at')->useCurrent();
            $table->timestamp('last_read_at')->nullable();
            $table->primary(['channel_id', 'user_id']);
        });

        // Seed #general channel with all existing users
        $userId = DB::table('users')->min('id');
        if ($userId) {
            $now = now();
            $channelId = DB::table('chat_channels')->insertGetId([
                'name' => 'general',
                'slug' => 'general',
                'type' => 'public',
                'description' => 'General discussion',
                'created_by' => $userId,
                'created_at' => $now,
                'updated_at' => $now,
            ]);

            $users = DB::table('users')->pluck('id');
            $members = $users->map(fn ($uid) => [
                'channel_id' => $channelId,
                'user_id' => $uid,
                'role' => $uid === $userId ? 'owner' : 'member',
                'joined_at' => $now,
            ])->all();

            DB::table('chat_channel_members')->insert($members);
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('chat_channel_members');
    }
};
