<?php

use App\Models\User;
use App\Notifications\VerifyPendingRegistration;
use Illuminate\Auth\Notifications\VerifyEmail;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\URL;

test('registration sends a verification email without creating a user', function () {
    Notification::fake();

    $response = $this->post(route('register.store'), [
        'name' => 'Taylor Student',
        'studentId' => 'STU-1001',
        'email' => 'taylor@example.com',
        'password' => 'Password123!',
        'password_confirmation' => 'Password123!',
    ]);

    $response->assertRedirect(route('registration.notice', ['email' => 'taylor@example.com']));
    $this->assertDatabaseMissing('users', ['email' => 'taylor@example.com']);
    Notification::assertSentOnDemand(VerifyPendingRegistration::class);
});

test('an authenticated user can request another verification email', function () {
    Notification::fake();

    $user = User::factory()->unverified()->create();

    $response = $this->actingAs($user)
        ->from(route('verification.notice'))
        ->post(route('verification.send'));

    $response->assertRedirect(route('verification.notice'));
    Notification::assertSentTo($user, VerifyEmail::class);

    $this->get(route('verification.notice'))
        ->assertInertia(fn ($page) => $page
            ->component('auth/verify-email')
            ->where('email', $user->email)
            ->where('verified', false)
            ->where('status', 'verification-link-sent'));
});

test('a valid registration verification link creates a verified user', function () {
    Notification::fake();

    $this->post(route('register.store'), [
        'name' => 'Taylor Student',
        'studentId' => 'STU-1001',
        'email' => 'taylor@example.com',
        'password' => 'Password123!',
        'password_confirmation' => 'Password123!',
    ]);

    $verificationUrl = null;
    Notification::assertSentOnDemand(
        VerifyPendingRegistration::class,
        function (VerifyPendingRegistration $notification) use (&$verificationUrl): bool {
            $verificationUrl = $notification->verificationUrl;

            return true;
        },
    );

    $this->assertDatabaseMissing('users', ['email' => 'taylor@example.com']);

    $this->get($verificationUrl)
        ->assertInertia(fn ($page) => $page
            ->component('auth/verify-email')
            ->where('verified', true));

    expect(User::where('email', 'taylor@example.com')->firstOrFail()->hasVerifiedEmail())
        ->toBeTrue();
});

test('an invalid registration verification link does not create a user', function () {
    Notification::fake();

    $this->post(route('register.store'), [
        'name' => 'Taylor Student',
        'studentId' => 'STU-1001',
        'email' => 'taylor@example.com',
        'password' => 'Password123!',
        'password_confirmation' => 'Password123!',
    ]);

    $verificationUrl = null;
    Notification::assertSentOnDemand(
        VerifyPendingRegistration::class,
        function (VerifyPendingRegistration $notification) use (&$verificationUrl): bool {
            $verificationUrl = $notification->verificationUrl;

            return true;
        },
    );

    $this->get(str_replace('signature=', 'signature=invalid', $verificationUrl))
        ->assertForbidden();

    $this->assertDatabaseMissing('users', ['email' => 'taylor@example.com']);
});

test('a valid signed verification link marks an existing user email as verified', function () {
    $user = User::factory()->unverified()->create();
    $url = URL::temporarySignedRoute(
        'verification.verify',
        now()->addMinutes(30),
        [
            'id' => $user->getKey(),
            'hash' => sha1($user->getEmailForVerification()),
        ],
    );

    $response = $this->actingAs($user)->get($url);

    $response->assertInertia(fn ($page) => $page
        ->component('auth/verify-email')
        ->where('verified', true));
    expect($user->fresh()->hasVerifiedEmail())->toBeTrue();
});
