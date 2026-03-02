<?php

declare(strict_types=1);

namespace App\DTOs;

/**
 * PHP mirror of the Rust AmpMessage struct.
 *
 * Wire format:
 *   ---
 *   key: value
 *   key: value
 *   ---
 *   optional body text
 */
class AmpMessage
{
    public function __construct(
        public array $headers = [],
        public string $body = '',
    ) {}

    /**
     * Parse a raw AMP wire message.
     *
     * Returns null if the input doesn't start with "---\n" or lacks a closing "---\n".
     */
    public static function parse(string $raw): ?self
    {
        if (! str_starts_with($raw, "---\n")) {
            return null;
        }

        $content = substr($raw, 4); // strip leading "---\n"

        $closingPos = strpos($content, "\n---\n");
        if ($closingPos !== false) {
            $frontmatter = substr($content, 0, $closingPos);
            $body = substr($content, $closingPos + 5); // skip "\n---\n"
        } elseif (str_ends_with($content, "---\n")) {
            // Empty message: "---\n---\n"
            $frontmatter = rtrim(substr($content, 0, -4), "\n");
            $body = '';
        } else {
            return null;
        }

        $headers = [];
        foreach (explode("\n", $frontmatter) as $line) {
            if ($line === '') {
                continue;
            }
            $colonPos = strpos($line, ': ');
            if ($colonPos !== false) {
                $key = trim(substr($line, 0, $colonPos));
                $value = trim(substr($line, $colonPos + 2));
                $headers[$key] = $value;
            }
        }

        return new self($headers, $body);
    }

    /**
     * Serialize to AMP wire format.
     */
    public function toWire(): string
    {
        $out = "---\n";
        foreach ($this->headers as $key => $value) {
            $out .= "{$key}: {$value}\n";
        }
        $out .= "---\n";

        if ($this->body !== '') {
            $out .= $this->body;
            if (! str_ends_with($this->body, "\n")) {
                $out .= "\n";
            }
        }

        return $out;
    }

    /**
     * Get a header value.
     */
    public function get(string $key): ?string
    {
        return $this->headers[$key] ?? null;
    }

    /**
     * Check if this is the empty message (heartbeat/keepalive).
     */
    public function isEmpty(): bool
    {
        return $this->headers === [] && $this->body === '';
    }

    /**
     * Get the 'command' header.
     */
    public function command(): ?string
    {
        return $this->get('command');
    }

    /**
     * Get 'args' header as decoded JSON array.
     */
    public function args(): ?array
    {
        $raw = $this->get('args');
        if ($raw === null) {
            return null;
        }

        $decoded = json_decode($raw, true);

        return is_array($decoded) ? $decoded : null;
    }
}
