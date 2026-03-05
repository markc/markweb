<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('agents', function (Blueprint $table) {
            $table->foreignId('user_id')->nullable()->after('id')->constrained('users')->nullOnDelete();
            $table->text('description')->nullable()->after('slug');
            $table->string('icon', 50)->nullable()->after('description');
            $table->decimal('temperature', 3, 2)->default(0.7)->after('provider');
            $table->decimal('top_p', 3, 2)->default(1.0)->after('temperature');
            $table->json('knowledge_files')->nullable()->after('prompt_overrides');
        });
    }

    public function down(): void
    {
        Schema::table('agents', function (Blueprint $table) {
            $table->dropForeign(['user_id']);
            $table->dropColumn(['user_id', 'description', 'icon', 'temperature', 'top_p', 'knowledge_files']);
        });
    }
};
