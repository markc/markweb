<?php

namespace App\Services\Document;

class TextChunker
{
    /**
     * Split text into overlapping chunks at paragraph boundaries.
     *
     * @return array<int, string>
     */
    public function chunk(string $text, ?int $chunkSize = null, ?int $overlap = null): array
    {
        $chunkSize = $chunkSize ?? config('document.chunk_size', 1500);
        $overlap = $overlap ?? config('document.chunk_overlap', 200);

        // Normalize line endings
        $text = str_replace("\r\n", "\n", $text);

        // Split into paragraphs (double newline or more)
        $paragraphs = preg_split('/\n{2,}/', $text);
        $paragraphs = array_filter(array_map('trim', $paragraphs));
        $paragraphs = array_values($paragraphs);

        if (empty($paragraphs)) {
            return [];
        }

        $chunks = [];
        $current = '';

        foreach ($paragraphs as $paragraph) {
            $candidate = $current === '' ? $paragraph : $current."\n\n".$paragraph;

            if (mb_strlen($candidate) > $chunkSize && $current !== '') {
                $chunks[] = trim($current);

                // Start next chunk with overlap from end of current
                $overlapText = $this->getOverlap($current, $overlap);
                $current = $overlapText === '' ? $paragraph : $overlapText."\n\n".$paragraph;
            } else {
                $current = $candidate;
            }
        }

        // Don't forget the last chunk
        if (trim($current) !== '') {
            $chunks[] = trim($current);
        }

        return $chunks;
    }

    /**
     * Get the tail portion of text for overlap.
     */
    protected function getOverlap(string $text, int $maxLength): string
    {
        if (mb_strlen($text) <= $maxLength) {
            return $text;
        }

        $tail = mb_substr($text, -$maxLength);

        // Try to break at a paragraph or sentence boundary
        $breakPos = mb_strpos($tail, "\n\n");
        if ($breakPos !== false && $breakPos < mb_strlen($tail) / 2) {
            return mb_substr($tail, $breakPos + 2);
        }

        // Fall back to sentence boundary
        $breakPos = mb_strpos($tail, '. ');
        if ($breakPos !== false && $breakPos < mb_strlen($tail) / 2) {
            return mb_substr($tail, $breakPos + 2);
        }

        return $tail;
    }
}
