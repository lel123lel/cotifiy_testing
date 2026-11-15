<?php

namespace App\Models;

use App\Notifications\AnnouncementDiscussionNotification;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Notifications\Notification as BaseNotification;

#[Fillable(['name', 'email', 'password'])]
#[Hidden(['password', 'remember_token'])]
class StaffUser extends Authenticatable
{
    use Notifiable;

    protected $table = 'staff_users';

    /** @return BelongsTo<Office, $this> */
    public function office(): BelongsTo
    {
        return $this->belongsTo(Office::class);
    }

    /** @return MorphMany<DatabaseNotification, $this> */
    public function notifications(): MorphMany
    {
        return $this->morphMany(DatabaseNotification::class, 'notifiable')->latest();
    }

    /** @return MorphMany<DatabaseNotification, $this> */
    public function routeNotificationForDatabase(?BaseNotification $notification = null): MorphMany
    {
        $notifications = $this->notifications();

        if ($notification instanceof AnnouncementDiscussionNotification) {
            $notifications->getQuery()->withAttributes([
                'announcement_id' => $notification->announcement->getKey(),
            ]);
        }

        return $notifications;
    }

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }
}
