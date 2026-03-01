<?php

namespace App\Http\Controllers;

use App\Services\AppMesh\AppMeshService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class AppMeshController extends Controller
{
    public function __construct(
        private readonly AppMeshService $appMesh,
    ) {}

    /**
     * Dashboard — port status, tool stats, recent activity.
     */
    public function index(): Response
    {
        return Inertia::render('appmesh/index', [
            'stats' => Inertia::defer(fn () => $this->appMesh->getStats()),
            'ports' => $this->appMesh->getPorts(),
        ]);
    }

    /**
     * D-Bus explorer — interactive service/interface/method browser.
     */
    public function explore(): Response
    {
        return Inertia::render('appmesh/explore');
    }

    /**
     * MIDI routing — PipeWire MIDI patch bay.
     */
    public function midi(): Response
    {
        return Inertia::render('appmesh/midi');
    }

    /**
     * TTS studio — script generation, voice selection, audio/video pipeline.
     */
    public function tts(): Response
    {
        return Inertia::render('appmesh/tts');
    }

    /**
     * API: Get all tools grouped by plugin.
     */
    public function tools(): JsonResponse
    {
        return response()->json($this->appMesh->getToolsByPlugin());
    }

    /**
     * API: Execute a tool.
     */
    public function execute(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'tool' => 'required|string',
            'args' => 'nullable|array',
        ]);

        $result = $this->appMesh->executeTool(
            $validated['tool'],
            $validated['args'] ?? [],
        );

        return response()->json($result);
    }

    /**
     * API: Execute a port command.
     */
    public function portExecute(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'port' => 'required|string',
            'command' => 'required|string',
            'args' => 'nullable|array',
        ]);

        $result = $this->appMesh->executePort(
            $validated['port'],
            $validated['command'],
            $validated['args'] ?? [],
        );

        return response()->json($result);
    }

    /**
     * API: D-Bus service discovery.
     */
    public function dbusServices(): JsonResponse
    {
        $result = $this->appMesh->executeTool('appmesh_dbus_list', [
            'action' => 'services',
        ]);

        return response()->json($result);
    }

    /**
     * API: D-Bus introspection.
     */
    public function dbusIntrospect(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'service' => 'required|string',
            'path' => 'nullable|string',
        ]);

        $result = $this->appMesh->executeTool('appmesh_dbus_list', [
            'action' => 'introspect',
            'service' => $validated['service'],
            'path' => $validated['path'] ?? '/',
        ]);

        return response()->json($result);
    }

    /**
     * API: MIDI ports and connections.
     */
    public function midiPorts(): JsonResponse
    {
        $ports = $this->appMesh->executeTool('appmesh_midi_list', []);
        $links = $this->appMesh->executeTool('appmesh_midi_links', []);

        return response()->json([
            'ports' => $ports,
            'links' => $links,
        ]);
    }

    /**
     * API: MIDI connect/disconnect.
     */
    public function midiConnect(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'action' => 'required|in:connect,disconnect',
            'output' => 'required|string',
            'input' => 'required|string',
        ]);

        $tool = $validated['action'] === 'connect'
            ? 'appmesh_midi_connect'
            : 'appmesh_midi_disconnect';

        $result = $this->appMesh->executeTool($tool, [
            'output' => $validated['output'],
            'input' => $validated['input'],
        ]);

        return response()->json($result);
    }

    /**
     * API: TTS voices list.
     */
    public function ttsVoices(): JsonResponse
    {
        $result = $this->appMesh->executeTool('appmesh_tts_voices', []);

        return response()->json($result);
    }

    /**
     * API: TTS generate speech.
     */
    public function ttsGenerate(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'text' => 'required|string|max:5000',
            'voice' => 'nullable|string',
            'output' => 'nullable|string',
        ]);

        $result = $this->appMesh->executeTool('appmesh_tts', $validated);

        return response()->json($result);
    }

    /**
     * API: Stream a TTS audio file for playback.
     */
    public function ttsPlay(Request $request): BinaryFileResponse
    {
        $validated = $request->validate([
            'file' => 'required|string',
        ]);

        $filename = basename($validated['file']);
        $dir = getenv('HOME') ?: posix_getpwuid(posix_getuid())['dir'];
        $path = "{$dir}/Videos/appmesh-tutorials/{$filename}";

        abort_unless(file_exists($path), 404);

        return response()->file($path, ['Content-Type' => 'audio/wav']);
    }

    /**
     * API: Generate tutorial script.
     */
    public function tutorialScript(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'topic' => 'required|string|max:500',
            'duration' => 'nullable|string',
            'style' => 'nullable|string',
        ]);

        $result = $this->appMesh->executeTool('appmesh_tutorial_script', $validated);

        return response()->json($result);
    }
}
