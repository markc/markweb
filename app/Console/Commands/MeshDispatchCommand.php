<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Models\MeshTask;
use App\Services\Mesh\MeshTaskService;
use Illuminate\Console\Command;

class MeshDispatchCommand extends Command
{
    protected $signature = 'mesh:dispatch
        {prompt : The prompt to send}
        {--node= : Target node name (default: self)}
        {--provider= : LLM provider (e.g., anthropic, google)}
        {--model= : LLM model (e.g., claude-opus-4-6, gemini-2.5-pro)}
        {--system= : System prompt}
        {--fan-out= : Comma-separated node names for parallel dispatch}
        {--wait : Wait for task completion and display result}';

    protected $description = 'Dispatch an AI task to a mesh node';

    public function handle(MeshTaskService $service): int
    {
        $prompt = $this->argument('prompt');
        $fanOut = $this->option('fan-out');
        $wait = $this->option('wait');

        if ($fanOut) {
            return $this->handleFanOut($service, $prompt, $fanOut, $wait);
        }

        return $this->handleSingle($service, $prompt, $wait);
    }

    protected function handleSingle(MeshTaskService $service, string $prompt, bool $wait): int
    {
        $task = $service->dispatch(
            prompt: $prompt,
            targetNode: $this->option('node'),
            provider: $this->option('provider'),
            model: $this->option('model'),
            systemPrompt: $this->option('system'),
        );

        $this->info("Task dispatched: {$task->id}");
        $this->line("  Target: {$task->target_node}");
        $this->line("  Status: {$task->status}");

        if ($wait) {
            return $this->waitForTask($task);
        }

        return self::SUCCESS;
    }

    protected function handleFanOut(MeshTaskService $service, string $prompt, string $nodes, bool $wait): int
    {
        $targets = array_map('trim', explode(',', $nodes));

        $parent = $service->fanOut(
            prompt: $prompt,
            targets: $targets,
            systemPrompt: $this->option('system'),
        );

        $this->info("Fan-out dispatched: {$parent->id}");
        $this->line('  Targets: '.implode(', ', $targets));
        $this->line("  Children: {$parent->children()->count()}");

        if ($wait) {
            return $this->waitForTask($parent);
        }

        return self::SUCCESS;
    }

    protected function waitForTask(MeshTask $task): int
    {
        $this->line('');
        $this->line('Waiting for completion...');

        $maxWait = 600; // 10 minutes
        $elapsed = 0;

        while ($elapsed < $maxWait) {
            sleep(2);
            $elapsed += 2;

            $task->refresh();

            if ($task->isTerminal()) {
                break;
            }

            // Show progress for fan-out
            if ($task->meta['fan_out'] ?? false) {
                $total = $task->children()->count();
                $done = $task->children()->whereIn('status', ['completed', 'failed'])->count();
                $this->output->write("\r  Progress: {$done}/{$total} ");
            } else {
                $this->output->write("\r  Status: {$task->status} ({$elapsed}s) ");
            }
        }

        $this->line('');
        $this->line('');

        if (! $task->isTerminal()) {
            $this->error("Timed out after {$maxWait}s. Task still: {$task->status}");

            return self::FAILURE;
        }

        if ($task->isFailed()) {
            $this->error("Task failed: {$task->error}");

            return self::FAILURE;
        }

        // Display results
        $this->info('Completed!');

        if ($task->meta['fan_out'] ?? false) {
            foreach ($task->children as $child) {
                $this->line('');
                $this->comment("--- {$child->target_node}".($child->model ? " ({$child->model})" : '').' ---');

                if ($child->isCompleted()) {
                    $this->line($child->result);
                } else {
                    $this->error("  Failed: {$child->error}");
                }
            }
        } else {
            $this->line($task->result);
        }

        if ($task->usage) {
            $this->line('');
            $this->comment('Usage: '.json_encode($task->usage));
        }

        return self::SUCCESS;
    }
}
