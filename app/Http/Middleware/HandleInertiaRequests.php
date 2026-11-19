<?php

namespace App\Http\Middleware;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user();
        $authUser = $user?->toArray();

        if ($user instanceof User && $user->profile_photo_path !== null) {
            $authUser['profile_photo_url'] = Storage::disk('public')->url($user->profile_photo_path);
        }

        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'auth' => [
                'user' => $authUser,
            ],
            'flash' => [
                'status' => fn () => $request->session()->get('status'),
            ],
            'unreadCount' => fn () => $request->user('web')?->unreadNotifications()->count() ?? 0,
            'staffUnreadCount' => fn () => $request->user('staff')?->unreadNotifications()->count() ?? 0,
            'adminUnreadCount' => fn () => $request->user('admin')?->unreadNotifications()->count() ?? 0,
            'staffDepartment' => fn () => $request->user('staff')?->office?->name,
            'recentNotifications' => function () use ($request): array {
                $user = $request->user('web');

                if ($user === null) {
                    return [];
                }

                return $user->notifications()
                    ->latest()
                    ->limit(5)
                    ->get()
                    ->map(fn ($notification) => [
                        'id' => $notification->id,
                        'title' => $notification->data['title'] ?? 'Notification',
                        'message' => $notification->data['message'] ?? '',
                        'office' => $notification->data['office'] ?? '',
                        'is_read' => $notification->read_at !== null,
                        'link' => $notification->data['link'] ?? route('client.notifications'),
                        'created_at' => $notification->created_at?->toIso8601String(),
                    ])
                    ->all();
            },
            'staffRecentNotifications' => function () use ($request): array {
                $staff = $request->user('staff');

                if ($staff === null) {
                    return [];
                }

                return $staff->notifications()
                    ->latest()
                    ->limit(5)
                    ->get()
                    ->map(function ($notification): array {
                        $announcementId = $notification->data['announcement_id'] ?? null;
                        $isDiscussionNotification = ($notification->data['type'] ?? null) === 'comment'
                            && is_numeric($announcementId);

                        return [
                            'id' => $notification->id,
                            'title' => $notification->data['title'] ?? 'Notification',
                            'message' => $notification->data['message'] ?? '',
                            'office' => $notification->data['office'] ?? '',
                            'is_read' => $notification->read_at !== null,
                            'link' => $isDiscussionNotification
                                ? route('staff.announcements.index', [
                                    'announcement' => (int) $announcementId,
                                    'section' => 'comments',
                                ])
                                : ($notification->data['link'] ?? route('staff.announcements.index')),
                            'created_at' => $notification->created_at?->toIso8601String(),
                        ];
                    })
                    ->all();
            },
            'adminRecentNotifications' => function () use ($request): array {
                $admin = $request->user('admin');

                if ($admin === null) {
                    return [];
                }

                return $admin->notifications()
                    ->latest()
                    ->limit(5)
                    ->get()
                    ->map(function ($notification): array {
                        $announcementId = $notification->data['announcement_id'] ?? null;
                        $isDiscussionNotification = ($notification->data['type'] ?? null) === 'comment'
                            && is_numeric($announcementId);

                        return [
                            'id' => $notification->id,
                            'title' => $notification->data['title'] ?? 'Notification',
                            'message' => $notification->data['message'] ?? '',
                            'office' => $notification->data['office'] ?? '',
                            'is_read' => $notification->read_at !== null,
                            'link' => $isDiscussionNotification
                                ? route('admin.announcements.index', [
                                    'announcement' => (int) $announcementId,
                                    'section' => 'comments',
                                ])
                                : ($notification->data['link'] ?? route('admin.announcements.index')),
                            'created_at' => $notification->created_at?->toIso8601String(),
                        ];
                    })
                    ->all();
            },
        ];
    }
}
