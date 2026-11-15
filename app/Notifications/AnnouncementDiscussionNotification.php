<?php

namespace App\Notifications;

use App\Models\Announcement;
use App\Models\User;
use Illuminate\Notifications\Notification;

class AnnouncementDiscussionNotification extends Notification
{
    public function __construct(
        public readonly Announcement $announcement,
        public readonly User $commenter,
        public readonly bool $isReply,
    ) {}

    /**
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['database'];
    }

    /**
     * @return array{title: string, message: string, office: string, link: string, type: string, announcement_id: int}
     */
    public function toDatabase(object $notifiable): array
    {
        $action = $this->isReply ? 'replied to a comment on' : 'commented on';

        return [
            'title' => $this->isReply ? 'New reply on an announcement' : 'New comment on an announcement',
            'message' => $this->commenter->name.' '.$action.' '.$this->announcement->title.'.',
            'office' => $this->announcement->posted_by,
            'link' => route('staff.announcements.index', [
                'announcement' => $this->announcement->id,
                'section' => 'comments',
            ]),
            'type' => 'comment',
            'announcement_id' => $this->announcement->id,
        ];
    }
}
