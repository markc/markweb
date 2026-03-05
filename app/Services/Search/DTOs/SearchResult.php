<?php

namespace App\Services\Search\DTOs;

class SearchResult
{
    public float $score = 0;

    public array $engines = [];

    public array $positions = [];

    public function __construct(
        public string $url,
        public string $title,
        public string $content = '',
        public string $template = 'default',
        public ?string $thumbnail = null,
        public ?string $imgSrc = null,
        public ?string $publishedDate = null,
        public ?string $engine = null,
        public int $position = 0,
    ) {
        if ($engine) {
            $this->engines = [$engine];
            $this->positions[$engine] = $position;
        }
    }

    public function urlHash(): string
    {
        $parsed = parse_url($this->url);
        $key = ($parsed['host'] ?? '').($parsed['path'] ?? '').($parsed['query'] ?? '').($parsed['fragment'] ?? '');

        if ($this->imgSrc) {
            $key .= $this->imgSrc;
        }

        return md5($key);
    }

    public function mergeWith(self $other): void
    {
        foreach ($other->engines as $engine) {
            if (! in_array($engine, $this->engines)) {
                $this->engines[] = $engine;
            }
        }

        foreach ($other->positions as $engine => $position) {
            $this->positions[$engine] = $position;
        }

        if (strlen($other->content) > strlen($this->content)) {
            $this->content = $other->content;
        }

        if (strlen($other->title) > strlen($this->title)) {
            $this->title = $other->title;
        }

        if (! $this->thumbnail && $other->thumbnail) {
            $this->thumbnail = $other->thumbnail;
        }

        if (! $this->publishedDate && $other->publishedDate) {
            $this->publishedDate = $other->publishedDate;
        }
    }

    public function toArray(): array
    {
        return [
            'url' => $this->url,
            'title' => $this->title,
            'content' => $this->content,
            'template' => $this->template,
            'thumbnail' => $this->thumbnail,
            'img_src' => $this->imgSrc,
            'published_date' => $this->publishedDate,
            'engines' => $this->engines,
            'score' => round($this->score, 4),
            'positions' => $this->positions,
        ];
    }
}
