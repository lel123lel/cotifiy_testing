<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Notifications\VerifyPendingRegistration;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;
use JsonException;

class RegistrationController extends Controller
{
    public function store(Request $request): RedirectResponse
    {
        $request->merge([
            'email' => Str::lower((string) $request->input('email')),
        ]);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'studentId' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique(User::class)],
            'password' => ['required', 'string', Password::default(), 'confirmed'],
        ]);

        $pendingRegistration = [
            'name' => $validated['name'],
            'studentId' => $validated['studentId'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
        ];

        $verificationUrl = URL::temporarySignedRoute(
            'registration.verify',
            now()->addHour(),
            ['data' => Crypt::encryptString(json_encode($pendingRegistration, JSON_THROW_ON_ERROR))],
        );

        Notification::route('mail', $pendingRegistration['email'])
            ->notify(new VerifyPendingRegistration($verificationUrl));

        return to_route('registration.notice', ['email' => $pendingRegistration['email']]);
    }

    /**
     * @throws JsonException
     */
    public function verify(Request $request): Response
    {
        $pendingRegistration = json_decode(
            Crypt::decryptString((string) $request->query('data')),
            true,
            flags: JSON_THROW_ON_ERROR,
        );

        $validated = Validator::make($pendingRegistration, [
            'name' => ['required', 'string', 'max:255'],
            'studentId' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique(User::class)],
            'password' => ['required', 'string'],
        ])->validate();

        $user = new User($validated);
        $user->forceFill(['email_verified_at' => now()])->save();

        return Inertia::render('auth/verify-email', [
            'verified' => true,
        ]);
    }
}
