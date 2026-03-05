<?php

namespace App\Services\Search\Engines\Concerns;

use DOMDocument;
use DOMXPath;

trait ParsesHtml
{
    protected function createDom(string $html): DOMDocument
    {
        $dom = new DOMDocument;
        libxml_use_internal_errors(true);
        $dom->loadHTML('<?xml encoding="UTF-8">'.$html, LIBXML_NOWARNING | LIBXML_NOERROR);
        libxml_clear_errors();

        return $dom;
    }

    protected function createXpath(string $html): DOMXPath
    {
        return new DOMXPath($this->createDom($html));
    }

    protected function extractText(\DOMNode $node): string
    {
        return trim($node->textContent);
    }

    protected function extractAttribute(\DOMNode $node, string $attribute): ?string
    {
        if ($node instanceof \DOMElement) {
            return $node->getAttribute($attribute) ?: null;
        }

        return null;
    }

    protected function randomUserAgent(): string
    {
        $agents = config('searchx.user_agents', []);

        return $agents[array_rand($agents)] ?? 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36';
    }
}
