<?php

namespace App\Http\Middleware;

use App\Models\AgentMessage;
use App\Models\AgentSession;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user();

        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'basePath' => $request->getBasePath(),
            'auth' => [
                'user' => $user,
            ],
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
            'sidebarSessions' => fn () => $user
                ? AgentSession::where('user_id', $user->id)
                    ->select(['id', 'title', 'model', 'updated_at'])
                    ->latest('updated_at')
                    ->limit(50)
                    ->get()
                : [],
            'sidebarStats' => $user ? $this->buildStats($user) : null,
            'sidebarDocs' => $this->buildDocs(),
        ];
    }

    private function buildStats($user): array
    {
        $sessionIds = AgentSession::where('user_id', $user->id)->pluck('id');
        $sessionCount = $sessionIds->count();

        if ($sessionCount === 0) {
            return [
                'sessions' => 0,
                'messages' => 0,
                'inputTokens' => 0,
                'outputTokens' => 0,
                'totalCost' => 0,
                'costByModel' => [],
            ];
        }

        $messages = AgentMessage::whereIn('session_id', $sessionIds);
        $messageCount = $messages->count();

        $usage = AgentMessage::whereIn('session_id', $sessionIds)
            ->whereNotNull('usage')
            ->get()
            ->reduce(function ($carry, $msg) {
                $u = $msg->usage ?? [];
                $carry['input'] += $u['input_tokens'] ?? 0;
                $carry['output'] += $u['output_tokens'] ?? 0;

                return $carry;
            }, ['input' => 0, 'output' => 0]);

        return [
            'sessions' => $sessionCount,
            'messages' => $messageCount,
            'inputTokens' => $usage['input'],
            'outputTokens' => $usage['output'],
            'totalCost' => 0,
            'costByModel' => [],
        ];
    }

    private function buildDocs(): array
    {
        $docsPath = base_path('docs');

        if (! File::isDirectory($docsPath)) {
            return [];
        }

        $docs = [];

        foreach (File::glob("{$docsPath}/*.md") as $file) {
            $slug = pathinfo($file, PATHINFO_FILENAME);
            $content = File::get($file);
            $title = $slug;

            if (preg_match('/^#\s+(.+)$/m', $content, $matches)) {
                $title = $matches[1];
            }

            $docs[] = ['slug' => $slug, 'title' => $title];
        }

        usort($docs, fn ($a, $b) => $a['title'] <=> $b['title']);

        return $docs;
    }
}
