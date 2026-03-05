<?php

declare(strict_types=1);
/**
 * Brane Core — Shared Infrastructure for MCP Server
 *
 * Standalone PHP classes (no Laravel) for:
 * - Tool definition and schema helpers (from appmesh-core.php)
 * - Database access (BraneDB)
 * - Embedding generation (BraneEmbedder)
 * - Content chunking (BraneChunker, from logbook-index)
 * - Configuration loading
 */

// ============================================================================
// Environment & Config Helpers
// ============================================================================

// Provide standalone env() for config files that use Laravel's env() helper
if (! function_exists('env')) {
    function env(string $key, mixed $default = null): mixed
    {
        $value = getenv($key);
        if ($value === false) {
            return $default;
        }

        // Handle common string-to-type conversions
        return match (strtolower($value)) {
            'true', '(true)' => true,
            'false', '(false)' => false,
            'null', '(null)' => null,
            '' => $default,
            default => $value,
        };
    }
}

function brane_env(string $key, string $default = ''): string
{
    return getenv($key) ?: $default;
}

function brane_config(): array
{
    static $config = null;
    if ($config === null) {
        $configFile = __DIR__.'/../config/brane.php';
        if (file_exists($configFile)) {
            $config = require $configFile;
        } else {
            $home = getenv('HOME') ?: '/home/markc';
            $config = [
                'domains' => [
                    'gh' => ['base_path' => "$home/.gh", 'patterns' => ['_journal/*.md', '_notes.md', '*/CLAUDE.md', '*/_doc/*.md', '*/_notes.md', '*/_journal/*.md']],
                    'ns' => ['base_path' => "$home/.ns", 'patterns' => ['CLAUDE.md', '_doc/*.md', '*/_notes.md', '*/_journal/*.md', '*/*/*/_notes.md', '*/*/*/_journal/*.md']],
                ],
                'chunking' => ['min_size' => 500, 'max_size' => 4000],
                'embedding' => ['model' => 'nomic-embed-text', 'host' => 'http://127.0.0.1:11434', 'dimensions' => 768, 'max_content_length' => 4000],
                'search' => ['vector_weight' => 0.5, 'keyword_weight' => 0.2, 'recency_weight' => 0.3, 'rrf_k' => 60, 'recency_decay_rate' => 0.995, 'candidate_multiplier' => 3, 'default_limit' => 10],
                'db' => ['dsn' => 'pgsql:host=127.0.0.1;dbname=markweb', 'user' => 'markweb', 'pass' => 'markweb_cachyos_2026'],
            ];
        }
    }

    return $config;
}

// ============================================================================
// Tool Definition (from appmesh-core.php)
// ============================================================================

final readonly class Tool
{
    public function __construct(
        public string $description,
        public array $inputSchema,
        /** @var callable(array): string */
        private mixed $handler,
    ) {}

    public function execute(array $args): string
    {
        return ($this->handler)($args);
    }
}

// ============================================================================
// Schema Builder Helpers (from appmesh-core.php)
// ============================================================================

function schema(array $properties = [], array $required = []): array
{
    return [
        'type' => 'object',
        'properties' => empty($properties) ? (object) [] : $properties,
        'required' => $required,
    ];
}

function prop(string $type, string $description, array $extra = []): array
{
    return ['type' => $type, 'description' => $description, ...$extra];
}

// ============================================================================
// Argument Validation (from appmesh-core.php)
// ============================================================================

function brane_validate(array $args, array $required): ?string
{
    $missing = [];
    foreach ($required as $key) {
        if (! isset($args[$key]) || (is_string($args[$key]) && trim($args[$key]) === '')) {
            $missing[] = $key;
        }
    }

    return $missing ? 'Missing required arguments: '.implode(', ', $missing) : null;
}

function brane_arg(array $args, string $key, mixed $default = null, string $type = 'string'): mixed
{
    $value = $args[$key] ?? $default;
    if ($value === null) {
        return $default;
    }

    return match ($type) {
        'int', 'integer' => (int) $value,
        'float', 'double' => (float) $value,
        'bool', 'boolean' => filter_var($value, FILTER_VALIDATE_BOOLEAN),
        'array' => is_array($value) ? $value : [$value],
        default => (string) $value,
    };
}

// ============================================================================
// Plugin Loader (from appmesh-core.php)
// ============================================================================

function brane_load_tools(string $toolsDir): array
{
    $tools = [];
    $toolFiles = glob($toolsDir.'/*.php');

    if ($toolFiles === false) {
        return $tools;
    }

    foreach ($toolFiles as $toolFile) {
        $toolSet = require $toolFile;
        if (is_array($toolSet)) {
            $tools = array_merge($tools, $toolSet);
        }
    }

    return $tools;
}

// ============================================================================
// BraneDB — PDO Database Access
// ============================================================================

class BraneDB
{
    private static ?PDO $pdo = null;

    public static function connection(): PDO
    {
        if (self::$pdo === null) {
            $dsn = brane_env('BRANE_DB_DSN', brane_config()['db']['dsn']);
            $user = brane_env('BRANE_DB_USER', brane_config()['db']['user']);
            $pass = brane_env('BRANE_DB_PASS', brane_config()['db']['pass']);

            self::$pdo = new PDO($dsn, $user, $pass, [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_OBJ,
            ]);
        }

        return self::$pdo;
    }

    public static function query(string $sql, array $params = []): array
    {
        $stmt = self::connection()->prepare($sql);
        $stmt->execute($params);

        return $stmt->fetchAll();
    }

    public static function execute(string $sql, array $params = []): int
    {
        $stmt = self::connection()->prepare($sql);
        $stmt->execute($params);

        return $stmt->rowCount();
    }

    public static function fetchOne(string $sql, array $params = []): ?object
    {
        $stmt = self::connection()->prepare($sql);
        $stmt->execute($params);
        $result = $stmt->fetch();

        return $result ?: null;
    }

    /**
     * Insert with RETURNING id clause (PostgreSQL).
     * The SQL must include "RETURNING id".
     */
    public static function insertReturningId(string $sql, array $params = []): int
    {
        $stmt = self::connection()->prepare($sql);
        $stmt->execute($params);
        $row = $stmt->fetch(PDO::FETCH_OBJ);

        return $row ? (int) $row->id : 0;
    }

    /**
     * Get or create the brane agent ID.
     * Ensures an 'agents' record exists for brane memories.
     */
    public static function agentId(): int
    {
        static $id = null;
        if ($id !== null) {
            return $id;
        }

        $agent = self::fetchOne("SELECT id FROM agents WHERE slug = 'brane' LIMIT 1");
        if ($agent) {
            $id = (int) $agent->id;

            return $id;
        }

        self::execute(
            "INSERT INTO agents (name, slug, model, provider, config, tool_policy, prompt_overrides, is_default, created_at, updated_at)
             VALUES ('Brane', 'brane', 'nomic-embed-text', 'ollama', '{}', '{}', '{}', false, NOW(), NOW())"
        );
        $agent = self::fetchOne("SELECT id FROM agents WHERE slug = 'brane' LIMIT 1");
        $id = (int) $agent->id;

        return $id;
    }
}

// ============================================================================
// BraneEmbedder — Ollama Embedding with Task Prefixes
// ============================================================================

class BraneEmbedder
{
    /**
     * Generate embedding for storing a document.
     * Uses "search_document:" prefix for nomic-embed-text.
     *
     * @return float[]|null
     */
    public static function embedDocument(string $text): ?array
    {
        return self::embed('search_document: '.$text);
    }

    /**
     * Generate embedding for a search query.
     * Uses "search_query:" prefix for nomic-embed-text.
     *
     * @return float[]|null
     */
    public static function embedQuery(string $text): ?array
    {
        return self::embed('search_query: '.$text);
    }

    /**
     * @return float[]|null
     */
    private static function embed(string $text): ?array
    {
        $config = brane_config()['embedding'];
        $maxLen = $config['max_content_length'] ?? 4000;
        if (mb_strlen($text) > $maxLen + 20) { // +20 for prefix
            $text = mb_substr($text, 0, $maxLen + 20);
        }

        $host = brane_env('BRANE_OLLAMA_HOST', $config['host']);
        $model = $config['model'];

        $ch = curl_init("$host/api/embed");
        curl_setopt_array($ch, [
            CURLOPT_POST => true,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_HTTPHEADER => ['Content-Type: application/json'],
            CURLOPT_POSTFIELDS => json_encode([
                'model' => $model,
                'input' => $text,
            ]),
            CURLOPT_TIMEOUT => 30,
        ]);

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($httpCode !== 200 || $response === false) {
            return null;
        }

        $data = json_decode($response, true);

        return $data['embeddings'][0] ?? $data['embedding'] ?? null;
    }

    /**
     * Convert float array to PostgreSQL vector literal.
     */
    public static function toVector(array $embedding): string
    {
        return '['.implode(',', $embedding).']';
    }
}

// ============================================================================
// BraneChunker — Content Chunking (from logbook-index)
// ============================================================================

class BraneChunker
{
    /**
     * Split content into section-level chunks.
     *
     * @return array<array{content: string, title: string}>
     */
    public static function chunk(string $content): array
    {
        $config = brane_config()['chunking'];
        $minSize = $config['min_size'] ?? 500;
        $maxSize = $config['max_size'] ?? 4000;

        $parts = null;

        // Primary split: on \n---\n (journal section separators)
        if (str_contains($content, "\n---\n")) {
            $parts = preg_split('/\n---\n/', $content);
        }
        // Fallback split: on \n## (H2 headers)
        elseif (preg_match('/\n## /', $content)) {
            $parts = preg_split('/(?=\n## )/', $content);
        }

        // No splits found: return whole file as single chunk
        if ($parts === null || count($parts) <= 1) {
            return [['content' => $content, 'title' => self::extractTitle($content)]];
        }

        // Remove empty parts
        $parts = array_values(array_filter($parts, fn ($p) => trim($p) !== ''));

        // Merge small chunks with adjacent chunk
        $merged = [];
        foreach ($parts as $part) {
            if (! empty($merged) && strlen(trim(end($merged))) < $minSize) {
                $merged[count($merged) - 1] .= "\n---\n".$part;
            } else {
                $merged[] = $part;
            }
        }
        // Merge last chunk backward if too small
        if (count($merged) > 1 && strlen(trim(end($merged))) < $minSize) {
            $last = array_pop($merged);
            $merged[count($merged) - 1] .= "\n---\n".$last;
        }

        // Handle oversized chunks
        $final = [];
        foreach ($merged as $chunk) {
            if (strlen($chunk) <= $maxSize) {
                $final[] = $chunk;

                continue;
            }
            // Try secondary split on ### headers
            if (preg_match('/\n### /', $chunk)) {
                $subParts = preg_split('/(?=\n### )/', $chunk);
                $subParts = array_values(array_filter($subParts, fn ($p) => trim($p) !== ''));
                $subMerged = [];
                foreach ($subParts as $sp) {
                    if (! empty($subMerged) && strlen(trim(end($subMerged))) < $minSize) {
                        $subMerged[count($subMerged) - 1] .= $sp;
                    } else {
                        $subMerged[] = $sp;
                    }
                }
                foreach ($subMerged as $sub) {
                    if (strlen($sub) <= $maxSize) {
                        $final[] = $sub;
                    } else {
                        foreach (self::hardSplit($sub, $maxSize) as $hs) {
                            $final[] = $hs;
                        }
                    }
                }
            } else {
                foreach (self::hardSplit($chunk, $maxSize) as $hs) {
                    $final[] = $hs;
                }
            }
        }

        // Build result with titles
        return array_map(fn ($chunk) => [
            'content' => $chunk,
            'title' => self::extractTitle($chunk),
        ], $final);
    }

    /**
     * Extract title from first ## or ### line, or first non-empty line.
     */
    public static function extractTitle(string $text): string
    {
        foreach (explode("\n", $text) as $line) {
            $line = trim($line);
            if ($line === '' || $line === '---') {
                continue;
            }
            if (preg_match('/^#{2,3}\s+(.+)/', $line, $m)) {
                return mb_substr($m[1], 0, 80);
            }

            return mb_substr($line, 0, 80);
        }

        return '(untitled)';
    }

    /**
     * Hard split text at last paragraph break before maxLen.
     *
     * @return string[]
     */
    private static function hardSplit(string $text, int $maxLen): array
    {
        $parts = [];
        while (strlen($text) > $maxLen) {
            $cut = strrpos(substr($text, 0, $maxLen), "\n\n");
            if ($cut === false || $cut < 200) {
                $cut = strrpos(substr($text, 0, $maxLen), "\n");
            }
            if ($cut === false || $cut < 200) {
                $cut = $maxLen;
            }
            $parts[] = substr($text, 0, $cut);
            $text = substr($text, $cut);
        }
        if (trim($text) !== '') {
            $parts[] = $text;
        }

        return $parts;
    }
}

// ============================================================================
// Path Helpers
// ============================================================================

/**
 * Detect domain ('gh' or 'ns') from an absolute path.
 */
function brane_detect_domain(string $path): ?string
{
    $home = getenv('HOME') ?: '/home/markc';
    if (str_starts_with($path, "$home/.gh/") || str_starts_with($path, "$home/.gh")) {
        return 'gh';
    }
    if (str_starts_with($path, "$home/.ns/") || str_starts_with($path, "$home/.ns")) {
        return 'ns';
    }
    // Check cwd
    $cwd = getcwd() ?: '';
    if (str_contains($cwd, '/.gh/') || str_ends_with($cwd, '/.gh')) {
        return 'gh';
    }
    if (str_contains($cwd, '/.ns/') || str_ends_with($cwd, '/.ns')) {
        return 'ns';
    }

    return null;
}

/**
 * Extract project name from an absolute path.
 */
function brane_detect_project(string $path): ?string
{
    $home = getenv('HOME') ?: '/home/markc';

    // .gh/projectname/... → projectname
    if (preg_match('#^'.preg_quote($home, '#').'/\.gh/([^/]+)/#', $path, $m)) {
        // Skip cross-project files
        if (! str_starts_with($m[1], '_')) {
            return $m[1];
        }
    }

    // .ns/vsite/... → vsite
    if (preg_match('#^'.preg_quote($home, '#').'/\.ns/([^/]+)/#', $path, $m)) {
        return $m[1];
    }

    return null;
}

/**
 * Make path relative to home directory.
 */
function brane_relative_path(string $path): string
{
    $home = getenv('HOME') ?: '/home/markc';
    if (str_starts_with($path, $home.'/')) {
        return substr($path, strlen($home) + 1);
    }

    return $path;
}
