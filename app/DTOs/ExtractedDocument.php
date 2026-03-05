<?php

namespace App\DTOs;

class ExtractedDocument
{
    public function __construct(
        public readonly string $text,
        public readonly array $metadata = [],
    ) {}
}
