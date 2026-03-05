<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DocumentChunk extends Model
{
    protected $fillable = [
        'user_id',
        'session_id',
        'filename',
        'storage_path',
        'mime_type',
        'file_size',
        'chunk_index',
        'chunk_content',
        'metadata',
        'content_hash',
        'status',
        'embedding',
    ];

    protected function casts(): array
    {
        return [
            'metadata' => 'array',
            'chunk_index' => 'integer',
            'file_size' => 'integer',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function session(): BelongsTo
    {
        return $this->belongsTo(AgentSession::class, 'session_id');
    }

    public function scopeReady($query)
    {
        return $query->where('status', 'ready');
    }

    public function scopeForUser($query, int $userId)
    {
        return $query->where('user_id', $userId);
    }
}
