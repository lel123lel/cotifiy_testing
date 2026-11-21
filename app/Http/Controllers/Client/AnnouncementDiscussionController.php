<?php

namespace App\Http\Controllers\Client;

use App\Http\Controllers\Controller;
use App\Models\AdminUser;
use App\Models\Announcement;
use App\Models\Conversation;
use App\Models\Message;
use App\Models\User;
use App\Notifications\AnnouncementDiscussionNotification;
use Illuminate\Database\Query\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Notification;
use Illuminate\Validation\Rule;

class AnnouncementDiscussionController extends Controller
{
    public function store(Request $request, Announcement $announcement): RedirectResponse
    {
        abort_if($announcement->status === 'Draft', 404);

        $client = $request->user('web');
        abort_unless($client instanceof User, 403);
        abort_unless($announcement->isVisibleTo($client), 404);

        $validated = $request->validate([
            'content' => ['required', 'string', 'max:5000'],
            'parent_message_id' => [
                'nullable',
                'integer',
                Rule::exists('messages', 'id')->where(
                    fn (Builder $query) => $query->whereIn(
                        'conversation_id',
                        Conversation::query()
                            ->select('id')
                            ->where('announcement_id', $announcement->id)
                            ->where(function ($query) use ($client): void {
                                $query->whereNull('client_id')
                                    ->orWhere('client_id', $client->id);
                            }),
                    ),
                ),
            ],
        ]);

        if (isset($validated['parent_message_id'])) {
            $conversation = Message::query()
                ->whereKey($validated['parent_message_id'])
                ->firstOrFail()
                ->conversation()
                ->firstOrFail();
        } else {
            $conversation = Conversation::query()->firstOrCreate(
                [
                    'announcement_id' => $announcement->id,
                    'client_id' => $client->id,
                ],
                [
                    'type' => 'announcement',
                    'name' => $announcement->title,
                ],
            );
        }

        $conversation->messages()->create([
            'parent_message_id' => $validated['parent_message_id'] ?? null,
            'sender_id' => $client->id,
            'content' => trim($validated['content']),
        ]);

        $conversation->touch();
        $this->notifyAnnouncementComment(
            $announcement,
            $client,
            isset($validated['parent_message_id']),
        );

        return back();
    }

    private function notifyAnnouncementComment(Announcement $announcement, User $commenter, bool $isReply): void
    {
        $recipients = collect([$announcement->staffAuthor])
            ->filter()
            ->concat(AdminUser::query()->get());

        Notification::send(
            $recipients,
            new AnnouncementDiscussionNotification($announcement, $commenter, $isReply),
        );
    }
}
