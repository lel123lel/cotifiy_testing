<?php

use App\Models\AdminUser;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

test('an admin can log in and is redirected to the admin page across requests', function () {
    $admin = AdminUser::create([
        'name' => 'Site Admin',
        'email' => 'admin@example.com',
        'password' => Hash::make('secret-password'),
    ]);

    $this->post('/auth/login', [
        'email' => $admin->email,
        'password' => 'secret-password',
    ])->assertRedirect(route('admin'));

    $this->get(route('admin'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('admin/admin'));
});

test('a regular user can log in using the users table', function () {
    $user = User::factory()->create([
        'email' => 'student@example.com',
        'password' => Hash::make('secret-password'),
    ]);

    $this->post('/auth/login', [
        'email' => $user->email,
        'password' => 'secret-password',
    ])->assertRedirect(route('client.clientpage'));

    $this->get(route('admin'))->assertRedirect(route('login'));
});

test('a regular user can access the client page', function () {
    $user = User::factory()->create();

    $this->actingAs($user, 'web')
        ->get(route('client.clientpage'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('client/clientpage'));
});

test('an admin cannot access the client page', function () {
    $admin = AdminUser::create([
        'name' => 'Site Admin',
        'email' => 'admin@example.com',
        'password' => Hash::make('secret-password'),
    ]);

    $this->actingAs($admin, 'admin')
        ->get(route('client.clientpage'))
        ->assertRedirect(route('login'));
});

test('login rejects an incorrect password for an existing email', function () {
    AdminUser::create([
        'name' => 'Site Admin',
        'email' => 'admin@example.com',
        'password' => Hash::make('secret-password'),
    ]);

    $this->from('/auth/login')->post('/auth/login', [
        'email' => 'admin@example.com',
        'password' => 'wrong-password',
    ])->assertRedirect('/auth/login')
        ->assertSessionHasErrors('email');
});
