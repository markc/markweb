<?php

declare(strict_types=1);

namespace App\Services\AppMesh;

use Illuminate\Support\Facades\Process;

/**
 * Bridge between markweb (Laravel) and the AppMesh MCP server.
 *
 * Calls tools by invoking the MCP plugin handlers directly via a PHP subprocess,
 * or falls back to the AppMesh API if the project root is unavailable.
 */
class AppMeshService
{
    private ?string $projectRoot;
    private ?array $toolCache = null;

    public function __construct()
    {
        $root = config('appmesh.project_root');
        $this->projectRoot = $root && is_dir($root) ? realpath($root) : null;
    }

    private function processEnv(): array
    {
        return ['HOME' => getenv('HOME') ?: posix_getpwuid(posix_getuid())['dir']];
    }

    /**
     * Check if AppMesh is available on this node.
     */
    public function isAvailable(): bool
    {
        return $this->projectRoot !== null
            && file_exists($this->projectRoot . '/server/appmesh-core.php');
    }

    /**
     * Check if the FFI library is available.
     */
    public function hasFfi(): bool
    {
        if (! $this->projectRoot) {
            return false;
        }

        $paths = [
            $this->projectRoot . '/target/release/libappmesh_core.so',
            ($_SERVER['HOME'] ?? '/root') . '/.local/lib/libappmesh_core.so',
            '/usr/local/lib/libappmesh_core.so',
        ];

        $envPath = config('appmesh.lib_path');
        if ($envPath) {
            array_unshift($paths, $envPath);
        }

        foreach ($paths as $path) {
            if (file_exists($path)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Get all available tools grouped by plugin.
     *
     * @return array<string, array{name: string, description: string, inputSchema: array}>
     */
    public function getTools(): array
    {
        if ($this->toolCache !== null) {
            return $this->toolCache;
        }

        if (! $this->isAvailable()) {
            return [];
        }

        $script = <<<'PHP'
        require_once $argv[1] . '/server/appmesh-core.php';
        $tools = appmesh_load_plugins($argv[1] . '/server/plugins');
        $result = [];
        foreach ($tools as $name => $tool) {
            $result[$name] = [
                'name' => $name,
                'description' => $tool->description,
                'inputSchema' => $tool->inputSchema,
            ];
        }
        echo json_encode($result);
        PHP;

        $result = Process::env($this->processEnv())->run([
            'php', '-r', $script, $this->projectRoot,
        ]);

        if ($result->successful()) {
            $this->toolCache = json_decode($result->output(), true) ?? [];
        } else {
            $this->toolCache = [];
        }

        return $this->toolCache;
    }

    /**
     * Get tools grouped by plugin name.
     *
     * @return array<string, array{name: string, tools: array}>
     */
    public function getToolsByPlugin(): array
    {
        $tools = $this->getTools();
        $plugins = [];

        foreach ($tools as $name => $tool) {
            // Extract plugin from tool name: appmesh_dbus_call -> dbus
            $parts = explode('_', $name);
            $plugin = $parts[1] ?? 'unknown';

            if (! isset($plugins[$plugin])) {
                $plugins[$plugin] = ['name' => $plugin, 'tools' => []];
            }
            $plugins[$plugin]['tools'][] = $tool;
        }

        return $plugins;
    }

    /**
     * Get the Rust FFI ports (not MCP tools — native ports).
     *
     * @return array<string, array{name: string, commands: string[]}>
     */
    public function getPorts(): array
    {
        return [
            'input' => ['name' => 'input', 'commands' => ['type_text', 'send_key']],
            'clipboard' => ['name' => 'clipboard', 'commands' => ['get', 'set']],
            'notify' => ['name' => 'notify', 'commands' => ['send']],
            'screenshot' => ['name' => 'screenshot', 'commands' => ['take']],
            'windows' => ['name' => 'windows', 'commands' => ['list', 'activate']],
        ];
    }

    /**
     * Execute an MCP tool by name.
     */
    public function executeTool(string $toolName, array $args = []): array
    {
        if (! $this->isAvailable()) {
            return ['success' => false, 'error' => 'AppMesh not available on this node'];
        }

        $argsJson = json_encode($args);

        $script = <<<'PHP'
        require_once $argv[1] . '/server/appmesh-core.php';
        AppMeshLogger::disable();
        $tools = appmesh_load_plugins($argv[1] . '/server/plugins');
        $name = $argv[2];
        $args = json_decode($argv[3], true) ?? [];
        if (!isset($tools[$name])) {
            echo json_encode(['success' => false, 'error' => "Unknown tool: $name"]);
            exit;
        }
        try {
            $result = $tools[$name]->execute($args);
            echo json_encode(['success' => true, 'result' => $result]);
        } catch (\Throwable $e) {
            echo json_encode(['success' => false, 'error' => $e->getMessage()]);
        }
        PHP;

        $result = Process::timeout(120)->env($this->processEnv())->run([
            'php', '-r', $script, $this->projectRoot, $toolName, $argsJson,
        ]);

        if ($result->successful()) {
            return json_decode($result->output(), true) ?? ['success' => false, 'error' => 'Invalid response'];
        }

        return ['success' => false, 'error' => 'Tool execution failed: ' . $result->errorOutput()];
    }

    /**
     * Execute a Rust FFI port command.
     */
    public function executePort(string $port, string $command, array $args = []): array
    {
        if (! $this->isAvailable()) {
            return ['success' => false, 'error' => 'AppMesh not available'];
        }

        $argsJson = json_encode($args);

        $script = <<<'PHP'
        require_once $argv[1] . '/server/appmesh-core.php';
        require_once $argv[1] . '/server/appmesh-ffi.php';
        AppMeshLogger::disable();
        $ffi = AppMeshFFI::instance();
        if (!$ffi) {
            echo json_encode(['success' => false, 'error' => 'FFI not available']);
            exit;
        }
        $result = $ffi->portExecute($argv[2], $argv[3], json_decode($argv[4] ?? '{}', true) ?? []);
        if ($result === null) {
            echo json_encode(['success' => false, 'error' => 'Port execution returned null']);
        } else {
            echo json_encode(['success' => true, 'result' => $result]);
        }
        PHP;

        $result = Process::timeout(10)->env($this->processEnv())->run([
            'php', '-r', $script, $this->projectRoot, $port, $command, $argsJson,
        ]);

        if ($result->successful()) {
            return json_decode($result->output(), true) ?? ['success' => false, 'error' => 'Invalid response'];
        }

        return ['success' => false, 'error' => 'Port execution failed: ' . $result->errorOutput()];
    }

    /**
     * Get summary stats for the dashboard.
     */
    public function getStats(): array
    {
        $tools = $this->getTools();
        $plugins = $this->getToolsByPlugin();
        $ports = $this->getPorts();

        return [
            'available' => $this->isAvailable(),
            'hasFfi' => $this->hasFfi(),
            'toolCount' => count($tools),
            'pluginCount' => count($plugins),
            'portCount' => count($ports),
            'plugins' => array_map(fn ($p) => [
                'name' => $p['name'],
                'toolCount' => count($p['tools']),
            ], array_values($plugins)),
        ];
    }
}
