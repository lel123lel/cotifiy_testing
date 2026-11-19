<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AdminUser;
use App\Models\Announcement;
use App\Models\Conversation;
use App\Models\Message;
use App\Models\StaffUser;
use App\Models\User;
use App\Notifications\AnnouncementPublished;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;
use RuntimeException;

class AnnouncementController extends Controller
{
    public function index(): Response
    {
        $monthStart = now()->startOfMonth();
        $nextMonthStart = $monthStart->copy()->addMonth();
        $lastMonthStart = $monthStart->copy()->subMonth();

        $announcements = Announcement::query()
            ->where('status', '!=', 'Draft')
            ->withCount([
                'readers',
                'savedByUsers as saved_count',
                'messages as comment_count',
            ])
            ->orderByDesc('date')
            ->orderByDesc('id')
            ->get();
        $publishedThisMonthCount = Announcement::query()
            ->where('status', 'Published')
            ->whereBetween('date', [$monthStart->toDateString(), $nextMonthStart->copy()->subDay()->toDateString()])
            ->count();
        $publishedLastMonthCount = Announcement::query()
            ->where('status', 'Published')
            ->whereBetween('date', [$lastMonthStart->toDateString(), $monthStart->copy()->subDay()->toDateString()])
            ->count();

        return Inertia::render('admin/admin', [
            'announcements' => $announcements->map(fn (Announcement $announcement) => $this->announcementData($announcement)),
            'recentAnnouncements' => $announcements->take(5)->map(fn (Announcement $announcement) => $this->announcementData($announcement)),
            'upcomingEvents' => Announcement::query()
                ->where('status', '!=', 'Draft')
                ->where('category', 'Event')
                ->where(function ($query) {
                    $query->whereDate('event_end_date', '>=', now()->toDateString())
                        ->orWhere(function ($query) {
                            $query->whereNull('event_end_date')
                                ->whereDate('event_date', '>=', now()->toDateString());
                        });
                })
                ->orderBy('event_date')
                ->orderBy('start_time')
                ->orderBy('id')
                ->limit(5)
                ->get()
                ->map(fn (Announcement $announcement) => [
                    'id' => $announcement->id,
                    'title' => $announcement->title,
                    'event_date' => $announcement->event_date->toDateString(),
                    'event_end_date' => $announcement->event_end_date?->toDateString() ?? $announcement->event_date->toDateString(),
                    'start_time' => $announcement->start_time,
                    'end_time' => $announcement->end_time,
                    'location' => $announcement->location,
                ]),
            'publishedThisMonthCount' => $publishedThisMonthCount,
            'publishedChangeFromLastMonth' => $publishedThisMonthCount - $publishedLastMonthCount,
            'eventCount' => Announcement::query()->where('status', '!=', 'Draft')->where('category', 'Event')->count(),
            'activeStudentCount' => $this->activeStudentCount(),
            'discussions' => $this->discussionData(),
            'announcementComments' => $this->announcementCommentData(),
        ]);
    }

    public function staffDashboard(Request $request): Response
    {
        $announcements = Announcement::query()
            ->where('status', '!=', 'Draft')
            ->withCount([
                'readers',
                'savedByUsers as saved_count',
                'messages as comment_count',
            ])
            ->orderByDesc('date')
            ->orderByDesc('id')
            ->get();

        return Inertia::render('staff/staff', [
            'recentAnnouncements' => $announcements->take(5)->map(fn (Announcement $announcement) => $this->announcementData($announcement)),
            'upcomingEvents' => Announcement::query()
                ->where('status', '!=', 'Draft')
                ->where('category', 'Event')
                ->where(function ($query) {
                    $query->whereDate('event_end_date', '>=', now()->toDateString())
                        ->orWhere(function ($query) {
                            $query->whereNull('event_end_date')
                                ->whereDate('event_date', '>=', now()->toDateString());
                        });
                })
                ->orderBy('event_date')
                ->orderBy('start_time')
                ->orderBy('id')
                ->limit(5)
                ->get()
                ->map(fn (Announcement $announcement) => [
                    'id' => $announcement->id,
                    'title' => $announcement->title,
                    'event_date' => $announcement->event_date?->toDateString() ?? $announcement->date->toDateString(),
                    'start_time' => $announcement->start_time,
                    'end_time' => $announcement->end_time,
                    'location' => $announcement->location,
                ]),
            'announcementCount' => Announcement::query()
                ->where('author_staff_id', $request->user('staff')->id)
                ->count(),
            'eventCount' => Announcement::query()->where('status', '!=', 'Draft')->where('category', 'Event')->count(),
            'userName' => $request->user('staff')->name,
        ]);
    }

    public function staffAnnouncements(Request $request): Response
    {
        Announcement::archiveExpiredUrgent();

        $announcements = Announcement::query()
            ->withCount([
                'readers',
                'savedByUsers as saved_count',
                'messages as comment_count',
            ])
            ->orderByDesc('date')
            ->orderByDesc('id')
            ->get();

        return Inertia::render('staff/staffannouncement', [
            'announcements' => $announcements->map(fn (Announcement $announcement) => $this->announcementData($announcement)),
            'discussions' => $this->discussionData(),
            'announcementComments' => $this->announcementCommentData(),
            'openAnnouncementId' => $request->integer('announcement') ?: null,
            'openAnnouncementSection' => $request->query('section') === 'comments' ? 'comments' : null,
            'staffName' => $request->user('staff')->name,
            'staffId' => $request->user('staff')->id,
            'staffDepartment' => $request->user('staff')->office?->name,
            'initialTab' => $request->query('tab') === 'my-posts' ? 'My Posts' : null,
            'initialCategoryFilter' => $request->query('category') === 'Event' ? 'Event' : null,
        ]);
    }

    public function staffEvents(Request $request): Response
    {
        $events = Announcement::query()
            ->where('status', '!=', 'Draft')
            ->where('category', 'Event')
            ->orderByDesc('event_date')
            ->orderByDesc('id')
            ->get()
            ->map(fn (Announcement $announcement) => [
                'id' => $announcement->id,
                'title' => $announcement->title,
                'body' => $announcement->body,
                'posted_by' => $announcement->posted_by,
                'image_url' => $announcement->image
                    ? Storage::disk('public')->url($announcement->image)
                    : null,
                'attachments' => $this->attachmentData($announcement),
                'date' => $announcement->event_date?->toDateString() ?? $announcement->date->toDateString(),
                'end_date' => $announcement->event_end_date?->toDateString() ?? $announcement->event_date?->toDateString() ?? $announcement->date->toDateString(),
                'time' => $announcement->start_time ?? '',
                'venue' => $announcement->location ?? '',
                'rsvp_count' => 0,
                'capacity' => null,
                'audience' => 'All',
                'status' => ($announcement->event_end_date?->toDateString() ?? $announcement->event_date?->toDateString() ?? $announcement->date->toDateString()) >= now()->toDateString()
                    ? 'Upcoming'
                    : 'Past',
                'start_time' => $announcement->start_time ?? '',
                'end_time' => $announcement->end_time ?? '',
                'is_mine' => $announcement->author_staff_id === $request->user('staff')->id,
            ]);

        return Inertia::render('admin/adminEvent', [
            'events' => $events,
            'staffMode' => true,
            'staffName' => $request->user('staff')->name,
            'staffDepartment' => $request->user('staff')->office?->name,
        ]);
    }

    public function announcements(Request $request): Response
    {
        $announcements = Announcement::query()
            ->withCount([
                'readers',
                'savedByUsers as saved_count',
                'messages as comment_count',
            ])
            ->orderByDesc('date')
            ->orderByDesc('id')
            ->get();

        return Inertia::render('admin/adminAnnouncemnt', [
            'announcements' => $announcements->map(fn (Announcement $announcement) => $this->announcementData($announcement)),
            'discussions' => $this->discussionData(),
            'announcementComments' => $this->announcementCommentData(),
            'adminId' => $request->user('admin')->id,
        ]);
    }

    public function events(Request $request): Response
    {
        $events = Announcement::query()
            ->where('status', '!=', 'Draft')
            ->where('category', 'Event')
            ->orderByDesc('event_date')
            ->orderByDesc('id')
            ->get()
            ->map(fn (Announcement $announcement) => [
                'id' => $announcement->id,
                'title' => $announcement->title,
                'body' => $announcement->body,
                'posted_by' => $announcement->posted_by,
                'image_url' => $announcement->image
                    ? Storage::disk('public')->url($announcement->image)
                    : null,
                'attachments' => $this->attachmentData($announcement),
                'date' => $announcement->event_date?->toDateString() ?? $announcement->date->toDateString(),
                'end_date' => $announcement->event_end_date?->toDateString() ?? $announcement->event_date?->toDateString() ?? $announcement->date->toDateString(),
                'time' => $announcement->start_time ?? '',
                'venue' => $announcement->location ?? '',
                'rsvp_count' => 0,
                'capacity' => null,
                'audience' => 'All',
                'status' => ($announcement->event_end_date?->toDateString() ?? $announcement->event_date?->toDateString() ?? $announcement->date->toDateString()) >= now()->toDateString()
                    ? 'Upcoming'
                    : 'Past',
                'start_time' => $announcement->start_time ?? '',
                'end_time' => $announcement->end_time ?? '',
                'is_mine' => $announcement->author_admin_id === $request->user('admin')->id,
            ]);

        return Inertia::render('admin/adminEvent', [
            'events' => $events,
        ]);
    }

    private function discussionData(): Collection
    {
        return Conversation::query()
            ->whereNotNull('announcement_id')
            ->whereNotNull('client_id')
            ->with([
                'announcement:id,title',
                'client:id,name',
                'messages' => fn ($query) => $query
                    ->with(['sender', 'adminSender', 'staffSender'])
                    ->orderBy('created_at')
                    ->orderBy('id'),
            ])
            ->whereHas('messages')
            ->orderByDesc('updated_at')
            ->limit(50)
            ->get()
            ->map(fn (Conversation $conversation) => [
                'id' => $conversation->id,
                'announcement_id' => $conversation->announcement_id,
                'announcement_title' => $conversation->announcement->title,
                'client_name' => $conversation->client->name,
                'messages' => $conversation->messages
                    ->map(fn (Message $message) => [
                        'id' => $message->id,
                        'parent_message_id' => $message->parent_message_id,
                        'author' => $message->sender_staff_id !== null
                            ? $message->staffSender->name
                            : ($message->sender_admin_id !== null
                                ? $message->adminSender->name
                                : $message->sender->name),
                        'role' => $message->sender_staff_id !== null
                            ? 'Staff'
                            : ($message->sender_admin_id === null ? 'Client' : 'Admin'),
                        'content' => $message->content,
                        'sent_at' => $message->created_at?->toIso8601String(),
                    ])
                    ->values(),
            ])
            ->values();
    }

    private function announcementCommentData(): Collection
    {
        return Conversation::query()
            ->whereNotNull('announcement_id')
            ->whereNull('client_id')
            ->with([
                'messages' => fn ($query) => $query
                    ->with(['sender', 'adminSender', 'staffSender'])
                    ->orderBy('created_at')
                    ->orderBy('id'),
            ])
            ->whereHas('messages')
            ->get()
            ->map(fn (Conversation $conversation) => [
                'announcement_id' => $conversation->announcement_id,
                'messages' => $conversation->messages
                    ->map(fn (Message $message) => [
                        'id' => $message->id,
                        'parent_message_id' => $message->parent_message_id,
                        'author' => $message->sender_staff_id !== null
                            ? $message->staffSender->name
                            : ($message->sender_admin_id !== null
                                ? $message->adminSender->name
                                : $message->sender->name),
                        'role' => $message->sender_staff_id !== null
                            ? 'Staff'
                            : ($message->sender_admin_id === null ? 'Client' : 'Admin'),
                        'content' => $message->content,
                        'sent_at' => $message->created_at?->toIso8601String(),
                    ])
                    ->values(),
            ])
            ->values();
    }

    public function store(Request $request): RedirectResponse
    {
        $isDraft = $request->input('status') === 'Draft';
        $isUrgent = $request->boolean('is_urgent');
        $staffDepartment = $request->user('staff')?->office?->name;
        $validated = $request->validate([
            'title' => [$isDraft ? 'nullable' : 'required', 'string', 'max:255'],
            'category' => [$isDraft ? 'nullable' : 'required', Rule::in(['General', 'Academic', 'Event', 'Service'])],
            'posted_by' => [$isDraft || $staffDepartment !== null ? 'nullable' : 'required', 'string', 'max:255'],
            'body' => [$isDraft ? 'nullable' : 'required', 'string'],
            'status' => ['nullable', Rule::in(['Draft', 'Published'])],
            'is_urgent' => ['sometimes', 'boolean'],
            'urgent_days' => [Rule::requiredIf($isUrgent && $request->has('is_urgent')), 'nullable', 'integer', 'between:1,3'],
            'image' => ['nullable', 'image', 'mimes:jpg,jpeg,png,gif,webp', 'max:5120'],
            'attachments' => ['sometimes', 'array', 'max:10'],
            'attachments.*' => ['file', 'mimes:pdf,doc,docx,xls,xlsx,ppt,pptx,txt,csv,odt,ods,odp', 'max:10240'],
            'event_date' => ['nullable', Rule::requiredIf(! $isDraft && $request->input('category') === 'Event'), 'date'],
            'event_end_date' => $isDraft ? ['nullable', 'date'] : ['nullable', 'date', 'after_or_equal:event_date'],
            'start_time' => $isDraft ? ['nullable', 'date_format:H:i'] : ['nullable', 'required_with:end_time', 'date_format:H:i'],
            'end_time' => $isDraft ? ['nullable', 'date_format:H:i'] : ['nullable', 'required_with:start_time', 'date_format:H:i', 'after:start_time'],
            'location' => ['nullable', Rule::requiredIf(! $isDraft && $request->input('category') === 'Event'), 'string', 'max:255'],
        ]);

        $validated['title'] = $validated['title'] ?: 'Untitled draft';
        $validated['category'] = $validated['category'] ?: 'General';
        $postedByFallback = ($validated['posted_by'] ?? '') ?: ($request->user('staff')->name ?? $request->user('admin')->name ?? 'Staff');
        $validated['posted_by'] = $staffDepartment ?? $postedByFallback;
        $validated['body'] = $validated['body'] ?? '';
        $validated['status'] = $isDraft ? 'Draft' : 'Published';
        $validated['is_urgent'] = $isUrgent;
        $validated['urgent_days'] = $isUrgent ? (int) $validated['urgent_days'] : null;
        $validated['urgent_until'] = $isUrgent && ! $isDraft
            ? now()->addDays($validated['urgent_days'])
            : null;

        $imagePath = null;
        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('announcements', 'public');

            if ($imagePath === false) {
                throw new RuntimeException('Failed to store the announcement image.');
            }
        }

        $attachments = $this->storeAttachments($validated['attachments'] ?? []);

        $announcement = Announcement::create([
            ...$validated,
            'date' => now()->toDateString(),
            'image' => $imagePath,
            'attachments' => $attachments,
            ...$this->authorFields($request),
            ...$this->eventFields($validated),
        ]);

        if (! $isDraft) {
            User::query()->chunkById(100, function ($users) use ($announcement): void {
                Notification::send($users, new AnnouncementPublished($announcement));
            });
        }

        return back();
    }

    public function update(Request $request, Announcement $announcement): RedirectResponse
    {
        $this->ensureStaffOwnsAnnouncement($request, $announcement);

        $isDraft = $request->input('status', $announcement->status) === 'Draft';
        $isUrgent = $request->has('is_urgent')
            ? $request->boolean('is_urgent')
            : (bool) $announcement->is_urgent;
        $staffDepartment = $request->user('staff')?->office?->name;
        $validated = $request->validate([
            'title' => [$isDraft ? 'nullable' : 'required', 'string', 'max:255'],
            'category' => [$isDraft ? 'nullable' : 'required', Rule::in(['General', 'Academic', 'Event', 'Service'])],
            'posted_by' => [$isDraft || $staffDepartment !== null ? 'nullable' : 'required', 'string', 'max:255'],
            'body' => [$isDraft ? 'nullable' : 'required', 'string'],
            'status' => ['sometimes', Rule::in(['Draft', 'Published'])],
            'is_urgent' => ['sometimes', 'boolean'],
            'urgent_days' => [Rule::requiredIf($isUrgent && $request->has('is_urgent')), 'nullable', 'integer', 'between:1,3'],
            'image' => ['nullable', 'image', 'mimes:jpg,jpeg,png,gif,webp', 'max:5120'],
            'attachments' => ['sometimes', 'array', 'max:10'],
            'attachments.*' => ['file', 'mimes:pdf,doc,docx,xls,xlsx,ppt,pptx,txt,csv,odt,ods,odp', 'max:10240'],
            'remove_attachments' => ['sometimes', 'array'],
            'remove_attachments.*' => ['string', Rule::in(array_column($announcement->attachments ?? [], 'path'))],
            'event_date' => ['nullable', Rule::requiredIf(! $isDraft && $request->input('category') === 'Event'), 'date'],
            'event_end_date' => $isDraft ? ['nullable', 'date'] : ['nullable', 'date', 'after_or_equal:event_date'],
            'start_time' => $isDraft ? ['nullable', 'date_format:H:i'] : ['nullable', 'required_with:end_time', 'date_format:H:i'],
            'end_time' => $isDraft ? ['nullable', 'date_format:H:i'] : ['nullable', 'required_with:start_time', 'date_format:H:i', 'after:start_time'],
            'location' => ['nullable', Rule::requiredIf(! $isDraft && $request->input('category') === 'Event'), 'string', 'max:255'],
        ]);

        $validated['title'] = $validated['title'] ?: 'Untitled draft';
        $validated['category'] = $validated['category'] ?: 'General';
        $postedByFallback = ($validated['posted_by'] ?? '') ?: ($request->user('staff')->name ?? $request->user('admin')->name ?? 'Staff');
        $validated['posted_by'] = $staffDepartment ?? $postedByFallback;
        $validated['body'] = $validated['body'] ?? '';
        $validated['status'] = $request->input('status', $announcement->status ?? 'Published');
        $validated['is_urgent'] = $isUrgent;
        $validated['urgent_days'] = $isUrgent
            ? (int) ($validated['urgent_days'] ?? $announcement->urgent_days ?? 1)
            : null;
        $validated['urgent_until'] = $isUrgent && $validated['status'] !== 'Draft'
            ? now()->addDays($validated['urgent_days'])
            : null;

        $oldImage = $announcement->image;
        $imagePath = $oldImage;

        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('announcements', 'public');

            if ($imagePath === false) {
                throw new RuntimeException('Failed to store the announcement image.');
            }
        }

        $removedAttachmentPaths = $validated['remove_attachments'] ?? [];
        $attachments = array_values(array_filter(
            $announcement->attachments ?? [],
            fn (array $attachment) => ! in_array($attachment['path'], $removedAttachmentPaths, true),
        ));
        $attachments = [
            ...$attachments,
            ...$this->storeAttachments($validated['attachments'] ?? []),
        ];

        $wasDraft = $announcement->status === 'Draft';
        $announcement->update([
            ...$validated,
            'date' => $wasDraft && $validated['status'] === 'Published'
                ? now()->toDateString()
                : $announcement->date->toDateString(),
            'image' => $imagePath,
            'attachments' => $attachments,
            ...$this->eventFields($validated),
        ]);

        foreach ($removedAttachmentPaths as $path) {
            if (! Storage::disk('public')->delete($path)) {
                throw new RuntimeException('Failed to remove a deleted announcement attachment.');
            }
        }

        if ($imagePath !== $oldImage && $oldImage !== null && ! Storage::disk('public')->delete($oldImage)) {
            throw new RuntimeException('Failed to remove the replaced announcement image.');
        }

        if ($wasDraft && $announcement->status === 'Published') {
            User::query()->chunkById(100, function ($users) use ($announcement): void {
                Notification::send($users, new AnnouncementPublished($announcement));
            });
        }

        return back();
    }

    public function destroy(Request $request, Announcement $announcement): RedirectResponse
    {
        $this->ensureStaffOwnsAnnouncement($request, $announcement);

        $image = $announcement->image;
        $attachments = array_column($announcement->attachments ?? [], 'path');
        DB::transaction(function () use ($announcement): void {
            $announcement->notifications()->delete();
            $announcement->delete();
        });

        if ($image !== null && ! Storage::disk('public')->delete($image)) {
            throw new RuntimeException('Failed to remove the deleted announcement image.');
        }

        foreach ($attachments as $path) {
            if (! Storage::disk('public')->delete($path)) {
                throw new RuntimeException('Failed to remove a deleted announcement attachment.');
            }
        }

        return back();
    }

    public function archive(Request $request, Announcement $announcement): RedirectResponse
    {
        $this->ensureStaffOwnsAnnouncement($request, $announcement);
        $announcement->update(['status' => 'Archived']);

        return back();
    }

    public function restore(Request $request, Announcement $announcement): RedirectResponse
    {
        $this->ensureStaffOwnsAnnouncement($request, $announcement);

        $updates = ['status' => 'Published'];
        if ($announcement->is_urgent && $announcement->urgent_until?->isPast()) {
            $updates += [
                'is_urgent' => false,
                'urgent_days' => null,
                'urgent_until' => null,
            ];
        }

        $announcement->update($updates);

        return back();
    }

    private function announcementData(Announcement $announcement): array
    {
        return [
            'id' => $announcement->id,
            'author_staff_id' => $announcement->author_staff_id,
            'author_admin_id' => $announcement->author_admin_id,
            'status' => $announcement->status,
            'is_urgent' => $announcement->is_urgent,
            'read_count' => $announcement->readers_count ?? $announcement->readers()->count(),
            'view_count' => $announcement->views_count ?? 0,
            'saved_count' => $announcement->saved_count ?? $announcement->savedByUsers()->count(),
            'comment_count' => $announcement->comment_count ?? $announcement->messages()->count(),
            'urgent_days' => $announcement->urgent_days,
            'urgent_until' => $announcement->urgent_until?->toIso8601String(),
            'title' => $announcement->title,
            'category' => $announcement->category,
            'posted_by' => $announcement->posted_by,
            'date' => $announcement->date->toDateString(),
            'body' => $announcement->body,
            'body_html' => $announcement->bodyAsHtml(),
            'image_url' => $announcement->image
                ? Storage::disk('public')->url($announcement->image)
                : null,
            'attachments' => $this->attachmentData($announcement),
            'event_date' => $announcement->event_date?->toDateString(),
            'event_end_date' => $announcement->event_end_date?->toDateString(),
            'start_time' => $announcement->start_time,
            'end_time' => $announcement->end_time,
            'location' => $announcement->location,
        ];
    }

    private function activeStudentCount(): int
    {
        $webGuardKey = Auth::guard('web')->getName();
        $activeSince = now()->subMinutes((int) config('session.lifetime', 120))->timestamp;
        $activeUserIds = [];

        $sessions = DB::table(config('session.table', 'sessions'))
            ->whereIn('user_id', User::query()->select('id'))
            ->where('last_activity', '>=', $activeSince)
            ->get(['user_id', 'payload']);

        foreach ($sessions as $session) {
            $serializedPayload = base64_decode($session->payload, true);
            $sessionData = $serializedPayload === false
                ? null
                : json_decode($serializedPayload, true);

            if (
                is_array($sessionData)
                && isset($sessionData[$webGuardKey])
                && (string) $sessionData[$webGuardKey] === (string) $session->user_id
            ) {
                $activeUserIds[(string) $session->user_id] = true;
            }
        }

        return count($activeUserIds);
    }

    private function storeAttachments(array $files): array
    {
        return array_map(function ($file): array {
            $path = $file->store('announcements/attachments', 'public');

            if ($path === false) {
                throw new RuntimeException('Failed to store an announcement attachment.');
            }

            return [
                'path' => $path,
                'name' => $file->getClientOriginalName(),
            ];
        }, $files);
    }

    private function attachmentData(Announcement $announcement): array
    {
        return array_map(function (array $attachment): array {
            $path = $attachment['path'];
            $size = Storage::disk('public')->size($path);

            return [
                ...$attachment,
                'url' => Storage::disk('public')->url($path),
                'size' => $size >= 1048576
                    ? number_format($size / 1048576, 1).' MB'
                    : number_format($size / 1024, 0).' KB',
            ];
        }, $announcement->attachments ?? []);
    }

    private function eventFields(array $validated): array
    {
        if ($validated['category'] === 'Event') {
            return [
                'event_date' => $validated['event_date'] ?? null,
                'event_end_date' => $validated['event_end_date'] ?? $validated['event_date'] ?? null,
                'start_time' => $validated['start_time'] ?? null,
                'end_time' => $validated['end_time'] ?? null,
                'location' => $validated['location'] ?? null,
            ];
        }

        return [
            'event_date' => null,
            'event_end_date' => null,
            'start_time' => null,
            'end_time' => null,
            'location' => null,
        ];
    }

    /**
     * @return array{author_staff_id: int|null, author_admin_id: int|null}
     */
    private function authorFields(Request $request): array
    {
        $staff = $request->user('staff');
        $admin = $request->user('admin');

        if ($staff instanceof StaffUser) {
            return ['author_staff_id' => $staff->id, 'author_admin_id' => null];
        }

        if ($admin instanceof AdminUser) {
            return ['author_staff_id' => null, 'author_admin_id' => $admin->id];
        }

        abort(403);
    }

    private function ensureStaffOwnsAnnouncement(Request $request, Announcement $announcement): void
    {
        $staff = $request->user('staff');

        if ($staff instanceof StaffUser && $announcement->author_staff_id !== $staff->id) {
            abort(403);
        }
    }
}
