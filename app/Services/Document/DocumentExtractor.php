<?php

namespace App\Services\Document;

use App\DTOs\ExtractedDocument;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Process;

class DocumentExtractor
{
    /**
     * Extract text and metadata from a document file.
     *
     * Uses the Rust docparse binary for PDF/DOCX/EML, falls back to
     * native PHP for plain text and markdown.
     */
    public function extract(string $filePath): ExtractedDocument
    {
        $ext = strtolower(pathinfo($filePath, PATHINFO_EXTENSION));

        // PHP-native for simple text formats
        if (in_array($ext, ['txt', 'md', 'csv', 'log'])) {
            return $this->extractPlainText($filePath);
        }

        // Use docparse binary for everything else
        return $this->extractWithDocparse($filePath);
    }

    protected function extractPlainText(string $filePath): ExtractedDocument
    {
        $text = file_get_contents($filePath);
        $filename = basename($filePath);

        return new ExtractedDocument(
            text: $text,
            metadata: [
                'filename' => $filename,
                'mime_type' => mime_content_type($filePath) ?: 'text/plain',
                'file_size' => filesize($filePath),
            ],
        );
    }

    protected function extractWithDocparse(string $filePath): ExtractedDocument
    {
        $binary = config('document.docparse_binary');

        if (! $binary || ! is_executable($binary)) {
            throw new \RuntimeException("docparse binary not found or not executable: {$binary}");
        }

        $result = Process::timeout(60)->run([
            $binary, '--json', $filePath,
        ]);

        if ($result->failed()) {
            Log::error('docparse failed', [
                'file' => $filePath,
                'stderr' => $result->errorOutput(),
                'exit_code' => $result->exitCode(),
            ]);
            throw new \RuntimeException('Document extraction failed: '.$result->errorOutput());
        }

        $data = json_decode($result->output(), true);

        if (! $data || ! isset($data['text'])) {
            throw new \RuntimeException('Invalid docparse output');
        }

        return new ExtractedDocument(
            text: $data['text'],
            metadata: $data['metadata'] ?? [],
        );
    }
}
