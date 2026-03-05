<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Agent extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'name',
        'slug',
        'description',
        'icon',
        'model',
        'provider',
        'temperature',
        'top_p',
        'config',
        'workspace_path',
        'tool_policy',
        'prompt_overrides',
        'knowledge_files',
        'is_default',
    ];

    protected function casts(): array
    {
        return [
            'config' => 'array',
            'tool_policy' => 'array',
            'prompt_overrides' => 'array',
            'knowledge_files' => 'array',
            'is_default' => 'boolean',
            'temperature' => 'float',
            'top_p' => 'float',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function sessions(): HasMany
    {
        return $this->hasMany(AgentSession::class);
    }

    public function memories(): HasMany
    {
        return $this->hasMany(Memory::class);
    }

    public function scheduledActions(): HasMany
    {
        return $this->hasMany(ScheduledAction::class);
    }

    public static function default(): static
    {
        return static::where('is_default', true)->firstOrFail();
    }
}
