<?php

namespace App\Http\Controllers\Client;

use App\Http\Controllers\Controller;
use App\Models\Announcement;
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
            ->map(fn (Announcement $announcement) => [
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
            ]);

        return Inertia::render('client/clientpage', [
            'announcements' => $announcements,
        ]);
    }
}
