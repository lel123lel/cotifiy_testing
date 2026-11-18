<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AdminUser;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class AdminNotificationController extends Controller
{
    public function markRead(Request $request, string $notification): RedirectResponse
    {
        $admin = $request->user('admin');
        abort_unless($admin instanceof AdminUser, 403);

        $admin->notifications()->whereKey($notification)->firstOrFail()->markAsRead();

        return back();
    }

    public function markAllRead(Request $request): RedirectResponse
    {
        $admin = $request->user('admin');
        abort_unless($admin instanceof AdminUser, 403);

        $admin->unreadNotifications()->update(['read_at' => now()]);

        return back();
    }
}
