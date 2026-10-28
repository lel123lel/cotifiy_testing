<?php

namespace App\Http\Controllers\Client;

use App\Http\Controllers\Controller;
use App\Models\Announcement;
use App\Models\Conversation;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class AnnouncementDiscussionController extends Controller
{
    public function store(Request $request, Announcement $announcement): RedirectResponse
    {
        $validated = $request->validate([
            'content' => ['required', 'string', 'max:5000'],
        ]);

        $conversation = Conversation::query()->firstOrCreate(
            [
                'announcement_id' => $announcement->id,
                'client_id' => $request->user()->id,
            ],
            [
                'type' => 'announcement',
                'name' => $announcement->title,
            ],
        );

        $conversation->messages()->create([
            'sender_id' => $request->user()->id,
            'content' => trim($validated['content']),
        ]);

        $conversation->touch();

        return back();
    }
}
