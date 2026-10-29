<?php

namespace App\Http\Controllers\Client;

use App\Http\Controllers\Controller;
use App\Models\Announcement;
use App\Models\Conversation;
use Illuminate\Database\Query\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class AnnouncementDiscussionController extends Controller
{
    public function store(Request $request, Announcement $announcement): RedirectResponse
    {
        $conversation = Conversation::query()
            ->where('announcement_id', $announcement->id)
            ->where('client_id', $request->user()->id)
            ->first();

        $validated = $request->validate([
            'content' => ['required', 'string', 'max:5000'],
            'parent_message_id' => [
                'nullable',
                'integer',
                Rule::exists('messages', 'id')->where(
                    fn (Builder $query) => $query->where('conversation_id', $conversation ? $conversation->id : 0),
                ),
            ],
        ]);

        $conversation ??= Conversation::query()->firstOrCreate(
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
            'parent_message_id' => $validated['parent_message_id'] ?? null,
            'sender_id' => $request->user()->id,
            'content' => trim($validated['content']),
        ]);

        $conversation->touch();

        return back();
    }
}
