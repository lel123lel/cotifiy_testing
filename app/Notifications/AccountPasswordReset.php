<?php

namespace App\Notifications;

use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Notifications\Messages\MailMessage;

class AccountPasswordReset extends ResetPassword
{
    protected function resetUrl($notifiable): string
    {
        return route('client.password.reset.form', [
            'token' => $this->token,
            'email' => $notifiable->getEmailForPasswordReset(),
        ]);
    }

    public function toMail($notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Reset your COTIFY account password')
            ->greeting('Hello '.$notifiable->name.',')
            ->line('We received a request to reset the password for your COTIFY account.')
            ->line('If this was you, click the button below to choose a new password.')
            ->action('Reset Password', $this->resetUrl($notifiable))
            ->line('If you did not request a password reset, you can safely ignore this email.')
            ->line('This reset link will expire soon for your security.');
    }
}
