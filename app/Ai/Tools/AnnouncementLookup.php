<?php

namespace App\Ai\Tools;

use App\Models\Announcement;
use App\Models\User;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Illuminate\Support\Str;
use Laravel\Ai\Contracts\Tool;
use Laravel\Ai\Tools\Request;
use Stringable;

class AnnouncementLookup implements Tool
{
    /**
     * @var list<string>
     */
    private const STOP_WORDS = [
        'about', 'announcement', 'announcements', 'are', 'any', 'find', 'for',
        'from', 'have', 'is', 'me', 'of', 'on', 'show', 'tell', 'the', 'there',
        'what', 'when', 'where', 'which', 'with',
    ];

    public function __construct(private readonly User $user) {}

    public function description(): Stringable|string
    {
        return 'Search current published Cotify announcements visible to the signed-in student. Search by meaningful keywords from the topic or announcement title. Use this tool before answering any question about whether an announcement exists or what a specific announcement says. Only report details returned by this tool.';
    }

    public function handle(Request $request): Stringable|string
    {
        $validated = $request->validate([
            'query' => ['required', 'string', 'max:120'],
        ]);

        $terms = collect(preg_split('/[^\pL\pN]+/u', Str::lower($validated['query'])) ?: [])
            ->filter(fn (string $term): bool => mb_strlen($term) >= 3 && ! in_array($term, self::STOP_WORDS, true))
            ->unique()
            ->take(8)
            ->values();

        if ($terms->isEmpty()) {
            return 'No searchable announcement keywords were provided. Ask for the announcement topic or title.';
        }

        $announcements = Announcement::query()
            ->visibleTo($this->user)
            ->where('status', 'Published')
            ->where(function ($query) use ($terms): void {
                foreach ($terms as $term) {
                    $query->where(function ($query) use ($term): void {
                        $pattern = '%'.$term.'%';
                        $query->where('title', 'like', $pattern)
                            ->orWhere('category', 'like', $pattern)
                            ->orWhere('body', 'like', $pattern);
                    });
                }
            })
            ->select([
                'id',
                'title',
                'category',
                'posted_by',
                'date',
                'body',
                'event_date',
                'event_end_date',
                'start_time',
                'end_time',
                'location',
            ])
            ->orderByDesc('date')
            ->orderByDesc('id')
            ->limit(5)
            ->get()
            ->map(fn (Announcement $announcement): array => [
                'id' => $announcement->id,
                'title' => $announcement->title,
                'category' => $announcement->category,
                'posted_by' => $announcement->posted_by,
                'date' => $announcement->date->toDateString(),
                'body' => Str::limit(Str::squish(html_entity_decode(strip_tags($announcement->body))), 1200),
                'event_date' => $announcement->event_date?->toDateString(),
                'event_end_date' => $announcement->event_end_date?->toDateString(),
                'start_time' => $announcement->start_time,
                'end_time' => $announcement->end_time,
                'location' => $announcement->location,
            ]);

        if ($announcements->isEmpty()) {
            return 'No published announcements matching those keywords were found among the announcements visible to this student.';
        }

        return $announcements->toJson(JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    }

    public function schema(JsonSchema $schema): array
    {
        return [
            'query' => $schema->string()
                ->description('A short set of meaningful keywords describing the announcement topic or title.')
                ->required(),
        ];
    }
}
