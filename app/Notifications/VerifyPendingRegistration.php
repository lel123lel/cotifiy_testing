<?php

namespace App\Notifications;

use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class VerifyPendingRegistration extends Notification
{
    public function __construct(
        public readonly string $verificationUrl,
    ) {}

    /**
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Verify your email address')
            ->line('Verify your email address to complete your COTIFY account registration.')
            ->action('Verify email address', $this->verificationUrl)
            ->line('This verification link expires in 60 minutes. Your account will not be created unless you verify your email.');
    }
}
