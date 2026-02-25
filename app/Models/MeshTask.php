<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class MeshTask extends Model
{
    use HasUuids;

    protected $fillable = [
        'id',
        'origin_node',
        'target_node',
        'status',
        'type',
        'prompt',
        'result',
        'error',
        'provider',
        'model',
        'system_prompt',
        'callback_url',
        'parent_id',
        'chain_config',
        'meta',
        'usage',
        'dispatched_at',
        'started_at',
        'completed_at',
    ];

    protected function casts(): array
    {
        return [
            'chain_config' => 'array',
            'meta' => 'array',
            'usage' => 'array',
            'dispatched_at' => 'datetime',
            'started_at' => 'datetime',
            'completed_at' => 'datetime',
        ];
    }

    // --- Relations ---

    public function parent(): BelongsTo
    {
        return $this->belongsTo(self::class, 'parent_id');
    }

    public function children(): HasMany
    {
        return $this->hasMany(self::class, 'parent_id');
    }

    public function targetMeshNode(): BelongsTo
    {
        return $this->belongsTo(MeshNode::class, 'target_node', 'name');
    }

    public function originMeshNode(): BelongsTo
    {
        return $this->belongsTo(MeshNode::class, 'origin_node', 'name');
    }

    // --- Status helpers ---

    public function isPending(): bool
    {
        return $this->status === 'pending';
    }

    public function isDispatched(): bool
    {
        return $this->status === 'dispatched';
    }

    public function isProcessing(): bool
    {
        return $this->status === 'processing';
    }

    public function isCompleted(): bool
    {
        return $this->status === 'completed';
    }

    public function isFailed(): bool
    {
        return $this->status === 'failed';
    }

    public function isTerminal(): bool
    {
        return in_array($this->status, ['completed', 'failed', 'canceled']);
    }

    public function isCanceled(): bool
    {
        return $this->status === 'canceled';
    }

    public function markDispatched(): void
    {
        $this->update([
            'status' => 'dispatched',
            'dispatched_at' => now(),
        ]);
    }

    public function markReceived(): void
    {
        $this->update(['status' => 'received']);
    }

    public function markProcessing(): void
    {
        $this->update([
            'status' => 'processing',
            'started_at' => now(),
        ]);
    }

    public function markCompleted(string $result, array $usage = []): void
    {
        $this->update([
            'status' => 'completed',
            'result' => $result,
            'usage' => $usage ?: null,
            'completed_at' => now(),
        ]);
    }

    public function markFailed(string $error): void
    {
        $this->update([
            'status' => 'failed',
            'error' => $error,
            'completed_at' => now(),
        ]);
    }

    /**
     * Check if all sibling tasks (children of same parent) are terminal.
     */
    public function allSiblingsComplete(): bool
    {
        if (! $this->parent_id) {
            return true;
        }

        return ! self::where('parent_id', $this->parent_id)
            ->whereNotIn('status', ['completed', 'failed'])
            ->exists();
    }
}
