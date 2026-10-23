<?php

use App\Http\Controllers\Admin\AnnouncementController;
use App\Http\Controllers\Admin\SettingsController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\Auth\RegistrationController;
use App\Http\Controllers\Client\ClientPageController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::inertia('/', 'welcome')->name('home');
Route::inertia('/announcementpage', 'announcementpage')->name('announcementpage');
Route::inertia('/auth/login', 'auth/login')->name('login');
Route::inertia('/auth/register', 'auth/register')->name('register');
Route::get('/client/clientpage', ClientPageController::class)
    ->middleware('auth:web')
    ->name('client.clientpage');
Route::get('/admin', [AnnouncementController::class, 'index'])
    ->middleware('auth:admin')
    ->name('admin');
Route::get('/admin/users', [UserController::class, 'index'])
    ->middleware('auth:admin')
    ->name('admin.users');
Route::get('/admin/settings', [SettingsController::class, 'index'])
    ->middleware('auth:admin')
    ->name('admin.settings');
Route::put('/admin/settings/password', [SettingsController::class, 'updatePassword'])
    ->middleware('auth:admin')
    ->name('admin.settings.password');
Route::post('/admin/users/admins', [UserController::class, 'storeAdmin'])
    ->middleware('auth:admin')
    ->name('admin.users.admins.store');
Route::put('/admin/users/{user}', [UserController::class, 'update'])
    ->middleware('auth:admin')
    ->name('admin.users.update');
Route::delete('/admin/users/{user}', [UserController::class, 'destroy'])
    ->middleware('auth:admin')
    ->name('admin.users.destroy');
Route::post('/admin/announcements', [AnnouncementController::class, 'store'])
    ->middleware('auth:admin')
    ->name('admin.announcements.store');
Route::put('/admin/announcements/{announcement}', [AnnouncementController::class, 'update'])
    ->middleware('auth:admin')
    ->name('admin.announcements.update');
Route::delete('/admin/announcements/{announcement}', [AnnouncementController::class, 'destroy'])
    ->middleware('auth:admin')
    ->name('admin.announcements.destroy');
Route::post('/admin/logout', [LoginController::class, 'destroy'])
    ->middleware('auth:admin')
    ->name('admin.logout');
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
