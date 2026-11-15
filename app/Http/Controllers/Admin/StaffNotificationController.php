<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\DatabaseNotification;
use App\Models\StaffUser;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class StaffNotificationController extends Controller
{
    public function index(Request $request): Response
    {
        $staff = $request->user('staff');
        abort_unless($staff instanceof StaffUser, 403);

        $notifications = $staff->notifications()
            ->latest()
            ->get()
            ->map(fn (DatabaseNotification $notification): array => [
                'id' => $notification->id,
                'title' => $notification->data['title'] ?? 'Notification',
                'message' => $notification->data['message'] ?? '',
                'office' => $notification->data['office'] ?? '',
                'is_read' => $notification->read_at !== null,
                'link' => $this->notificationLink($notification),
                'created_at' => $notification->created_at?->toIso8601String(),
            ])
            ->all();

        return Inertia::render('staff/staffnotif', [
            'notifications' => $notifications,
            'userName' => $staff->name,
        ]);
    }

    public function markRead(Request $request, string $notification): RedirectResponse
    {
        $staff = $request->user('staff');
        abort_unless($staff instanceof StaffUser, 403);

        $staff->notifications()->whereKey($notification)->firstOrFail()->markAsRead();

        return back();
    }

    public function markAllRead(Request $request): RedirectResponse
    {
        $staff = $request->user('staff');
        abort_unless($staff instanceof StaffUser, 403);

        $staff->unreadNotifications()->update(['read_at' => now()]);

        return back();
    }

    public function clear(Request $request): RedirectResponse
    {
        $staff = $request->user('staff');
        abort_unless($staff instanceof StaffUser, 403);

        $staff->notifications()->delete();

        return back();
    }

    private function notificationLink(DatabaseNotification $notification): string
    {
        $announcementId = $notification->data['announcement_id'] ?? null;

        if (($notification->data['type'] ?? null) === 'comment' && is_numeric($announcementId)) {
            return route('staff.announcements.index', [
                'announcement' => (int) $announcementId,
                'section' => 'comments',
            ]);
        }

        $link = $notification->data['link'] ?? null;

        return is_string($link) ? $link : route('staff.announcements.index');
    }
}
