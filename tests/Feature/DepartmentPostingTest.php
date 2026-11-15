<?php

use App\Models\AdminUser;
use App\Models\Announcement;
use App\Models\Office;
use App\Models\StaffUser;
use Illuminate\Support\Facades\Notification;
use Inertia\Testing\AssertableInertia as Assert;

test('an admin can save staff account links to an office', function () {
    $admin = AdminUser::create([
        'name' => 'Site Admin',
        'email' => 'admin@example.com',
        'password' => 'secret-password',
    ]);
    $staff = StaffUser::create([
        'name' => 'Registrar Staff',
        'email' => 'staff@example.com',
        'password' => 'secret-password',
    ]);

    $this->actingAs($admin, 'admin')
        ->post(route('admin.offices.store'), [
            'name' => 'Registrar Test Office',
            'staff_account_ids' => [$staff->id],
        ])
        ->assertRedirect();

    $office = Office::query()->where('name', 'Registrar Test Office')->firstOrFail();
    expect($staff->fresh()->office_id)->toBe($office->id);

    $this->get(route('admin.settings'))
        ->assertInertia(fn (Assert $page) => $page
            ->has('offices', 5)
            ->where('staffAccounts.0.office_id', $office->id));
});

test('a linked staff account can only publish and edit posts under its office', function () {
    Notification::fake();

    $office = Office::query()->where('name', "Registrar's Office")->firstOrFail();
    $staff = StaffUser::create([
        'name' => 'Registrar Staff',
        'email' => 'staff@example.com',
        'password' => 'secret-password',
    ]);
    $staff->forceFill(['office_id' => $office->id])->save();

    $this->actingAs($staff, 'staff')
        ->post(route('staff.announcements.store'), [
            'title' => 'Office update',
            'category' => 'General',
            'body' => 'An update from the registrar.',
        ])
        ->assertRedirect();

    $announcement = Announcement::query()->where('title', 'Office update')->firstOrFail();
    expect($announcement->posted_by)->toBe("Registrar's Office");

    $this->get(route('staff.announcements.index'))
        ->assertInertia(fn (Assert $page) => $page
            ->where('staffDepartment', "Registrar's Office"));

    $this->put(route('staff.announcements.update', $announcement), [
        'title' => 'Updated office update',
        'category' => 'General',
        'posted_by' => 'Yet another department',
        'body' => 'Updated by the registrar.',
    ])->assertRedirect();

    expect($announcement->fresh()->posted_by)->toBe("Registrar's Office");
});
