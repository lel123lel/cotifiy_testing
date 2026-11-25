<?php

use App\Models\Announcement;
use App\Models\Office;
use App\Models\StaffUser;
use Illuminate\Support\Facades\Notification;
use Inertia\Testing\AssertableInertia as Assert;

test('a linked staff account can only publish and edit posts under its office', function () {
    Notification::fake();

    $office = Office::firstOrCreate(['name' => "Registrar's Office"]);
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
