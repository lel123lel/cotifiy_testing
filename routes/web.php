<?php

use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\Auth\RegistrationController;
use App\Models\AdminUser;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::inertia('/', 'welcome')->name('home');
Route::inertia('/auth/login', 'auth/login')->name('login');
Route::inertia('/auth/register', 'auth/register')->name('register');
Route::get('/admin', function (Request $request) {
    abort_unless($request->user() instanceof AdminUser, 403);

    return Inertia::render('admin/admin');
})->middleware('auth:admin')->name('admin');
Route::post('/auth/login', [LoginController::class, 'store'])
    ->middleware('throttle:login')
    ->name('login.authenticate');
Route::post('/register', [RegistrationController::class, 'store'])->name('register.store');
Route::get('/email/verify-registration', function (Request $request) {
    return Inertia::render('auth/verify-email', [
        'email' => $request->query('email'),
        'verified' => false,
    ]);
})->name('registration.notice');
Route::get('/email/verify-registration/confirm', [RegistrationController::class, 'verify'])
    ->middleware('signed')
    ->name('registration.verify');

Route::get('/email/verify', function (Request $request) {
    $user = $request->user();

    if ($user->hasVerifiedEmail()) {
        return redirect(config('fortify.home'));
    }

    return Inertia::render('auth/verify-email', [
        'email' => $user->email,
        'status' => $request->session()->get('status'),
        'verified' => false,
    ]);
})
    ->middleware('auth')
    ->name('verification.notice');
