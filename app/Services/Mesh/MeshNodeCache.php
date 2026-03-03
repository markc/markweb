<?php

declare(strict_types=1);

namespace App\Services\Mesh;

use Illuminate\Support\Facades\Redis;

/**
 * Redis-backed ephemeral storage for mesh node status.
 *
 * Each node is a Redis hash at mesh:node:{name} with a TTL.
 * No database writes — if a node stops heartbeating, its key expires
 * and it disappears from the dashboard automatically.
 */
class MeshNodeCache
{
    private const PREFIX = 'mesh:node:';

    private const TTL = 90; // seconds — 6x the 15s heartbeat interval

    /**
     * Update a node's status in Redis.
     *
     * @param  array<string, mixed>  $data
     */
    public function put(string $name, array $data): void
    {
        $key = self::PREFIX.$name;

        $data['name'] = $name;
        $data['updated_at'] = now()->toISOString();

        // Store meta as JSON string in Redis hash
        if (isset($data['meta']) && is_array($data['meta'])) {
            $data['meta'] = json_encode($data['meta']);
        }

        Redis::hmset($key, $data);
        Redis::expire($key, self::TTL);
    }

    /**
     * Get a single node's status.
     *
     * @return array<string, mixed>|null
     */
    public function get(string $name): ?array
    {
        $key = self::PREFIX.$name;
        $data = Redis::hgetall($key);

        if (empty($data)) {
            return null;
        }

        return $this->hydrate($data);
    }

    /**
     * Get all nodes currently in Redis.
     *
     * @return array<int, array<string, mixed>>
     */
    public function all(): array
    {
        $keys = Redis::keys(self::PREFIX.'*');

        if (empty($keys)) {
            return [];
        }

        // Strip the Redis prefix (e.g. "markweb-database-mesh:node:mko" → "mesh:node:mko")
        $prefix = config('database.redis.options.prefix', '');

        $nodes = [];
        foreach ($keys as $key) {
            $cleanKey = str_starts_with($key, $prefix) ? substr($key, strlen($prefix)) : $key;
            $data = Redis::hgetall($cleanKey);
            if (! empty($data)) {
                $nodes[] = $this->hydrate($data);
            }
        }

        // Sort by name for consistent ordering
        usort($nodes, fn ($a, $b) => strcmp($a['name'], $b['name']));

        return $nodes;
    }

    /**
     * Mark a node offline (update status, keep the key until TTL expires).
     */
    public function markOffline(string $name): void
    {
        $key = self::PREFIX.$name;

        if (Redis::exists($key)) {
            Redis::hset($key, 'status', 'offline');
            // Short TTL — offline nodes fade out after 5 minutes
            Redis::expire($key, 300);
        }
    }

    /**
     * Hydrate a Redis hash into a structured array.
     *
     * @param  array<string, string>  $data
     * @return array<string, mixed>
     */
    private function hydrate(array $data): array
    {
        $meta = isset($data['meta']) ? json_decode($data['meta'], true) : null;

        return [
            'id' => crc32($data['name'] ?? 'unknown'), // stable numeric ID for React keys
            'name' => $data['name'] ?? 'unknown',
            'wg_ip' => $data['wg_ip'] ?? null,
            'status' => $data['status'] ?? 'offline',
            'last_heartbeat_at' => $data['last_heartbeat_at'] ?? null,
            'meta' => is_array($meta) ? $meta : null,
        ];
    }
}
