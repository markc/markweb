<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MeshNode extends Model
{
    protected $fillable = [
        'name',
        'wg_ip',
        'status',
        'last_heartbeat_at',
        'meta',
    ];

    protected function casts(): array
    {
        return [
            'meta' => 'array',
            'last_heartbeat_at' => 'datetime',
        ];
    }

    public function isOnline(): bool
    {
        return $this->status === 'online';
    }
}
