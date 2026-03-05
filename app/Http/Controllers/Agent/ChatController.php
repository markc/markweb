<?php

namespace App\Http\Controllers\Agent;

use App\DTOs\IncomingMessage;
use App\Events\SessionDeleted;
use App\Events\SessionUpdated;
use App\Http\Controllers\Controller;
use App\Jobs\ProcessChatMessage;
use App\Jobs\ProcessDocumentUpload;
use App\Models\AgentSession;
use App\Models\DocumentChunk;
use App\Services\Agent\ModelRegistry;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;

class ChatController extends Controller
{
    public function __construct(
        protected ModelRegistry $modelRegistry,
    ) {}

    /**
     * GET /agent/chat — New chat page.
     */
    public function index()
    {
        return Inertia::render('chat', [
            'session' => null,
            'availableModels' => $this->modelRegistry->getAvailableModels(),
        ]);
    }

    /**
     * GET /agent/chat/{agentSession} — Show existing chat.
     */
    public function show(AgentSession $agentSession)
    {
        $this->authorize('view', $agentSession);

        $agentSession->load('messages');

        return Inertia::render('chat', [
            'session' => $agentSession,
            'availableModels' => $this->modelRegistry->getAvailableModels(),
        ]);
    }

    /**
     * POST /agent/chat/send — Dispatch chat message to queue, return immediately.
     */
    public function send(Request $request): JsonResponse
    {
        $request->validate([
            'message' => 'required|string|max:32000',
            'session_key' => 'nullable|string',
            'model' => 'nullable|string',
            'provider' => 'nullable|string',
            'system_prompt' => 'nullable|string',
        ]);

        $user = $request->user();
        $sessionKey = $request->input('session_key')
            ?? 'web:'.$user->id.':'.Str::uuid7();

        $provider = $request->input('provider');
        $model = $request->input('model');

        // Auto-resolve provider from model if not provided
        if ($model && ! $provider) {
            $provider = $this->modelRegistry->resolveProvider($model);
        }

        $message = new IncomingMessage(
            channel: 'web',
            sessionKey: $sessionKey,
            content: $request->input('message'),
            sender: $user->name,
            userId: $user->id,
            provider: $provider,
            model: $model,
            systemPrompt: $request->input('system_prompt'),
        );

        ProcessChatMessage::dispatch($message);

        return response()->json([
            'session_key' => $sessionKey,
        ]);
    }

    /**
     * DELETE /agent/chat/{agentSession} — Delete a chat session.
     */
    public function destroy(AgentSession $agentSession)
    {
        $this->authorize('delete', $agentSession);

        $sessionId = $agentSession->id;
        $userId = $agentSession->user_id;

        $agentSession->delete();

        event(new SessionDeleted($sessionId, $userId));

        return redirect()->route('chat.index');
    }

    /**
     * POST /agent/chat/documents — Upload a document for RAG.
     */
    public function uploadDocument(Request $request): JsonResponse
    {
        $request->validate([
            'file' => [
                'required',
                'file',
                'max:'.(config('document.max_file_size') / 1024),
            ],
            'session_id' => 'nullable|integer|exists:agent_sessions,id',
        ]);

        $file = $request->file('file');
        $user = $request->user();

        $allowedMimes = config('document.allowed_mimes', []);
        if (! empty($allowedMimes) && ! in_array($file->getMimeType(), $allowedMimes)) {
            return response()->json(['error' => 'File type not supported.'], 422);
        }

        $path = $file->store('documents/'.$user->id, 'local');

        ProcessDocumentUpload::dispatch(
            userId: $user->id,
            storagePath: $path,
            filename: $file->getClientOriginalName(),
            mimeType: $file->getMimeType(),
            fileSize: $file->getSize(),
            sessionId: $request->input('session_id'),
        );

        return response()->json([
            'filename' => $file->getClientOriginalName(),
            'status' => 'processing',
        ]);
    }

    /**
     * GET /agent/chat/documents — List user's uploaded documents.
     */
    public function documents(Request $request): JsonResponse
    {
        $documents = DocumentChunk::forUser($request->user()->id)
            ->select('filename', 'mime_type', 'file_size', 'status')
            ->selectRaw('MIN(created_at) as uploaded_at')
            ->selectRaw('COUNT(*) as chunk_count')
            ->groupBy('filename', 'mime_type', 'file_size', 'status')
            ->orderByDesc('uploaded_at')
            ->get();

        return response()->json($documents);
    }

    /**
     * DELETE /agent/chat/documents/{filename} — Delete a user's document.
     */
    public function deleteDocument(Request $request, string $filename): JsonResponse
    {
        $deleted = DocumentChunk::forUser($request->user()->id)
            ->where('filename', $filename)
            ->delete();

        return response()->json(['deleted' => $deleted]);
    }

    /**
     * GET /agent/chat/{agentSession}/export — Export chat as markdown or JSON.
     */
    public function export(Request $request, AgentSession $agentSession)
    {
        $this->authorize('view', $agentSession);

        $format = $request->query('format', 'md');
        $agentSession->load('messages');

        if ($format === 'json') {
            return response()->json([
                'title' => $agentSession->title,
                'model' => $agentSession->model,
                'provider' => $agentSession->provider,
                'created_at' => $agentSession->created_at->toISOString(),
                'messages' => $agentSession->messages->map(fn ($m) => [
                    'role' => $m->role,
                    'content' => $m->content,
                    'created_at' => $m->created_at->toISOString(),
                ]),
            ])->header('Content-Disposition', 'attachment; filename="chat-export.json"');
        }

        // Markdown format
        $lines = ["# {$agentSession->title}\n"];
        $lines[] = "Model: {$agentSession->model} ({$agentSession->provider})";
        $lines[] = "Date: {$agentSession->created_at->format('Y-m-d H:i')}\n";
        $lines[] = "---\n";

        foreach ($agentSession->messages as $msg) {
            $label = $msg->role === 'user' ? '**User**' : '**Assistant**';
            $time = $msg->created_at->format('H:i');
            $lines[] = "{$label} ({$time}):\n";
            $lines[] = $msg->content."\n";
        }

        $content = implode("\n", $lines);

        return response($content)
            ->header('Content-Type', 'text/markdown')
            ->header('Content-Disposition', 'attachment; filename="chat-export.md"');
    }

    /**
     * POST /agent/chat/{agentSession}/fork — Fork a chat from a specific message.
     */
    public function fork(Request $request, AgentSession $agentSession): JsonResponse
    {
        $this->authorize('view', $agentSession);

        $request->validate([
            'from_message' => 'required|integer',
        ]);

        $fromMessageId = $request->input('from_message');
        $user = $request->user();

        // Create new session as a copy
        $newSession = AgentSession::create([
            'agent_id' => $agentSession->agent_id,
            'user_id' => $user->id,
            'session_key' => 'web:'.$user->id.':'.Str::uuid7(),
            'title' => $agentSession->title.' (fork)',
            'channel' => $agentSession->channel,
            'trust_level' => $agentSession->trust_level,
            'model' => $agentSession->model,
            'provider' => $agentSession->provider,
            'system_prompt' => $agentSession->system_prompt,
        ]);

        // Copy messages up to and including the fork point
        $messages = $agentSession->messages()
            ->where('id', '<=', $fromMessageId)
            ->get();

        foreach ($messages as $msg) {
            $newSession->messages()->create([
                'role' => $msg->role,
                'content' => $msg->content,
                'attachments' => $msg->attachments,
                'tool_calls' => $msg->tool_calls,
                'tool_results' => $msg->tool_results,
                'usage' => $msg->usage,
                'meta' => $msg->meta,
            ]);
        }

        event(new \App\Events\SessionCreated($newSession));

        return response()->json([
            'session_id' => $newSession->id,
            'session_key' => $newSession->session_key,
        ]);
    }

    /**
     * PATCH /agent/chat/{agentSession} — Rename a chat session.
     */
    public function update(Request $request, AgentSession $agentSession)
    {
        $this->authorize('update', $agentSession);

        $request->validate([
            'title' => 'required|string|max:255',
        ]);

        $agentSession->update(['title' => $request->input('title')]);

        event(new SessionUpdated($agentSession->fresh()));

        return back();
    }
}
