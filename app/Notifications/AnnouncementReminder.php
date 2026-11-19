<?php

namespace App\Notifications;

use App\Models\Announcement;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class AnnouncementReminder extends Notification
{
    use Queueable;

    public function __construct(
        public readonly Announcement $announcement,
    ) {}

    /**
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['database', 'mail'];
    }

    /**
     * @return array{title: string, message: string, office: string, link: string, type: string}
     */
    public function toDatabase(object $notifiable): array
    {
        return [
            'title' => 'Reminder: '.$this->announcement->title,
            'message' => 'Please review this urgent announcement. Our records indicate that you have not opened it yet.',
            'office' => $this->announcement->posted_by,
            'link' => route('client.announcements.show', $this->announcement),
            'type' => 'urgent',
        ];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Reminder: Please review urgent announcement - '.$this->announcement->title)
            ->greeting('Hello '.$notifiable->name.',')
            ->line('Our records indicate that you have not yet opened the following urgent announcement.')
            ->line($this->announcement->title)
            ->line($this->announcement->body)
            ->action('Review urgent announcement', route('client.announcements.show', $this->announcement))
            ->line('Please review this important update at your earliest convenience.')
            ->line('Posted by '.$this->announcement->posted_by.'.');
    }
}
