<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\AdminUser;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class LoginController extends Controller
{
    public function store(Request $request): RedirectResponse
    {
        $credentials = $request->validate([
            'email' => ['required', 'string', 'email'],
            'password' => ['required', 'string'],
            'remember' => ['sometimes', 'boolean'],
        ]);

        $email = Str::lower($credentials['email']);
        $admin = AdminUser::query()->where('email', $email)->first();

        if ($admin) {
            if (! Hash::check($credentials['password'], $admin->password)) {
                throw ValidationException::withMessages([
                    'email' => [trans('auth.failed')],
                ]);
            }

            Auth::guard('web')->logout();
            Auth::guard('admin')->login($admin, $request->boolean('remember'));
            $request->session()->regenerate();

            return redirect()->route('admin');
        }

        $user = User::query()->where('email', $email)->first();

        if (! $user || ! Hash::check($credentials['password'], $user->password)) {
            throw ValidationException::withMessages([
                'email' => [trans('auth.failed')],
            ]);
        }

        Auth::guard('admin')->logout();
        Auth::guard('web')->login($user, $request->boolean('remember'));
        $request->session()->regenerate();

        return redirect()->intended(route('client.clientpage'));
    }

    public function destroy(Request $request): RedirectResponse
    {
        Auth::guard('admin')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return to_route('login');
    }
}
