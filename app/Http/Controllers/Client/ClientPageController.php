<?php

namespace App\Http\Controllers\Client;

use App\Http\Controllers\Controller;
use App\Models\Announcement;
use App\Models\Conversation;
use App\Models\Message;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class ClientPageController extends Controller
{
    public function __invoke(): Response
    {
        $announcements = Announcement::query()
            ->orderByDesc('date')
            ->orderByDesc('id')
            ->get()
            ->map(fn (Announcement $announcement) => $this->announcementData($announcement));

        return Inertia::render('client/clientpage', [
            'announcements' => $announcements,
        ]);
    }

    public function show(Request $request, Announcement $announcement): Response
    {
        $conversation = Conversation::query()
            ->where('announcement_id', $announcement->id)
            ->where('client_id', $request->user()->id)
            ->with([
                'messages' => fn ($query) => $query
                    ->with(['sender', 'adminSender'])
                    ->orderBy('created_at')
                    ->orderBy('id'),
            ])
            ->first();

        return Inertia::render('client/clientReadmore', [
            'announcement' => $this->announcementData($announcement),
            'messages' => $conversation?->messages
                ->map(fn (Message $message) => [
                    'id' => $message->id,
                    'parent_message_id' => $message->parent_message_id,
                    'author' => $message->sender_admin_id === null
                        ? $message->sender->name
                        : $message->adminSender->name,
                    'role' => $message->sender_admin_id === null ? 'Client' : 'Admin',
                    'content' => $message->content,
                    'sent_at' => $message->created_at?->toIso8601String(),
                    'is_mine' => $message->sender_id === $request->user()->id,
                ])
                ->values() ?? [],
        ]);
    }

    /**
     * @return array<string, int|string|null>
     */
    private function announcementData(Announcement $announcement): array
    {
        return [
            'id' => $announcement->id,
            'title' => $announcement->title,
            'category' => $announcement->category,
            'posted_by' => $announcement->posted_by,
            'date' => $announcement->date->toDateString(),
            'content' => $announcement->body,
            'image' => $announcement->image
                ? Storage::disk('public')->url($announcement->image)
                : null,
            'event_date' => $announcement->event_date?->toDateString(),
            'start_time' => $announcement->start_time,
            'end_time' => $announcement->end_time,
            'location' => $announcement->location,
        ];
    }
}
