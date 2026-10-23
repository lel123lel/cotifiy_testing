<?php

use App\Models\AdminUser;
use App\Models\Announcement;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

test('an admin can publish an announcement', function () {
    Storage::fake('public');

    $admin = AdminUser::create([
        'name' => 'Site Admin',
        'email' => 'admin@example.com',
        'password' => 'secret-password',
    ]);

    $this->actingAs($admin, 'admin')
        ->post(route('admin.announcements.store'), [
            'title' => 'Campus closure',
            'category' => 'General',
            'posted_by' => 'Office of the Registrar',
            'body' => 'The campus will be closed tomorrow.',
            'image' => UploadedFile::fake()->image('campus.png'),
        ])
        ->assertRedirect();

    $announcement = Announcement::query()->firstOrFail();

    $this->assertDatabaseHas('announcement', [
        'title' => 'Campus closure',
        'category' => 'General',
        'posted_by' => 'Office of the Registrar',
        'body' => 'The campus will be closed tomorrow.',
    ]);
    expect($announcement->image)->not->toBeNull();
    Storage::disk('public')->assertExists($announcement->image);

    expect($announcement->date->toDateString())->toBe(now()->toDateString());

    $this->get(route('admin'))
        ->assertInertia(fn ($page) => $page
            ->component('admin/admin')
            ->where('announcements.0.title', 'Campus closure')
            ->where('announcements.0.image_url', '/storage/'.$announcement->image)
            ->where('announcements.0.date', now()->toDateString()));
});

test('an admin cannot publish an announcement with a non-image upload', function () {
    Storage::fake('public');

    $admin = AdminUser::create([
        'name' => 'Site Admin',
        'email' => 'admin@example.com',
        'password' => 'secret-password',
    ]);

    $this->actingAs($admin, 'admin')
        ->from(route('admin'))
        ->post(route('admin.announcements.store'), [
            'title' => 'Campus closure',
            'category' => 'General',
            'posted_by' => 'Office of the Registrar',
            'body' => 'The campus will be closed tomorrow.',
            'image' => UploadedFile::fake()->create('document.pdf', 10, 'application/pdf'),
        ])
        ->assertRedirect(route('admin'))
        ->assertSessionHasErrors('image');

    expect(Announcement::query()->count())->toBe(0);
});

test('an admin can edit an announcement and replace its image', function () {
    Storage::fake('public');
    $oldImage = UploadedFile::fake()->image('old.png')->store('announcements', 'public');
    $announcement = Announcement::create([
        'title' => 'Old title',
        'category' => 'General',
        'posted_by' => 'Old office',
        'date' => now()->subDay()->toDateString(),
        'body' => 'Old details',
        'image' => $oldImage,
    ]);

    $admin = AdminUser::create([
        'name' => 'Site Admin',
        'email' => 'admin@example.com',
        'password' => 'secret-password',
    ]);

    $this->actingAs($admin, 'admin')
        ->post(route('admin.announcements.update', $announcement), [
            '_method' => 'put',
            'title' => 'Updated title',
            'category' => 'Academic',
            'posted_by' => 'Registrar',
            'body' => 'Updated details',
            'image' => UploadedFile::fake()->image('new.png'),
        ])
        ->assertRedirect();

    $announcement->refresh();
    expect($announcement->title)->toBe('Updated title')
        ->and($announcement->category)->toBe('Academic')
        ->and($announcement->posted_by)->toBe('Registrar')
        ->and($announcement->body)->toBe('Updated details')
        ->and($announcement->date->toDateString())->toBe(now()->subDay()->toDateString())
        ->and($announcement->image)->not->toBe($oldImage);
    Storage::disk('public')->assertMissing($oldImage);
    Storage::disk('public')->assertExists($announcement->image);
});

test('an admin can delete an announcement and its image', function () {
    Storage::fake('public');
    $image = UploadedFile::fake()->image('campus.png')->store('announcements', 'public');
    $announcement = Announcement::create([
        'title' => 'Campus closure',
        'category' => 'General',
        'posted_by' => 'Office of the Registrar',
        'date' => now()->toDateString(),
        'body' => 'The campus will be closed tomorrow.',
        'image' => $image,
    ]);

    $admin = AdminUser::create([
        'name' => 'Site Admin',
        'email' => 'admin@example.com',
        'password' => 'secret-password',
    ]);

    $this->post('/auth/login', [
        'email' => $admin->email,
        'password' => 'secret-password',
    ])->assertRedirect(route('admin'));

    $this->withHeaders([
        'X-Inertia' => 'true',
        'Referer' => route('admin'),
    ])->post(route('admin.announcements.destroy', $announcement), [
        '_method' => 'delete',
    ])
        ->assertRedirect();

    $this->assertDatabaseMissing('announcement', ['id' => $announcement->id]);
    Storage::disk('public')->assertMissing($image);

    $this->flushHeaders()->get(route('admin'))->assertOk();
});

test('an admin cannot publish an announcement with an invalid category', function () {
    $admin = AdminUser::create([
        'name' => 'Site Admin',
        'email' => 'admin@example.com',
        'password' => 'secret-password',
    ]);

    $this->actingAs($admin, 'admin')
        ->from(route('admin'))
        ->post(route('admin.announcements.store'), [
            'title' => 'Campus closure',
            'category' => 'Invalid',
            'posted_by' => 'Office of the Registrar',
            'body' => 'The campus will be closed tomorrow.',
        ])
        ->assertRedirect(route('admin'))
        ->assertSessionHasErrors('category');

    expect(Announcement::query()->count())->toBe(0);
});

test('the admin dashboard shows recent announcements and upcoming events from the database', function () {
    $admin = AdminUser::create([
        'name' => 'Site Admin',
        'email' => 'admin@example.com',
        'password' => 'secret-password',
    ]);
    User::create([
        'name' => 'Avery Student',
        'email' => 'avery@example.com',
        'studentId' => 'STU-123',
        'password' => 'secret-password',
    ]);
    User::create([
        'name' => 'Jordan Student',
        'email' => 'jordan@example.com',
        'studentId' => 'STU-456',
        'password' => 'secret-password',
    ]);

    $announcement = Announcement::create([
        'title' => 'Latest update',
        'category' => 'Academic',
        'posted_by' => 'Registrar',
        'date' => now()->toDateString(),
        'body' => 'A current announcement.',
    ]);
    $upcomingEvent = Announcement::create([
        'title' => 'Campus fair',
        'category' => 'Event',
        'posted_by' => 'Student Affairs',
        'date' => now()->toDateString(),
        'body' => 'Join us at the campus fair.',
        'event_date' => now()->addDays(3)->toDateString(),
        'start_time' => '09:00:00',
        'end_time' => '12:00:00',
        'location' => 'Main courtyard',
    ]);
    Announcement::create([
        'title' => 'Past event',
        'category' => 'Event',
        'posted_by' => 'Student Affairs',
        'date' => now()->subDays(10)->toDateString(),
        'body' => 'An event that has already happened.',
        'event_date' => now()->subDay()->toDateString(),
        'location' => 'Auditorium',
    ]);

    $this->actingAs($admin, 'admin')
        ->get(route('admin'))
        ->assertInertia(fn ($page) => $page
            ->component('admin/admin')
            ->where('announcements.0.id', $upcomingEvent->id)
            ->where('recentAnnouncements.0.id', $upcomingEvent->id)
            ->where('recentAnnouncements.1.id', $announcement->id)
            ->where('upcomingEvents.0.id', $upcomingEvent->id)
            ->where('upcomingEvents.0.event_date', now()->addDays(3)->toDateString())
            ->where('announcementCount', 3)
            ->where('eventCount', 2)
            ->where('userCount', 2)
            ->missing('upcomingEvents.1'));
});

test('an admin can publish an event announcement with a future schedule', function () {
    $admin = AdminUser::create([
        'name' => 'Site Admin',
        'email' => 'admin@example.com',
        'password' => 'secret-password',
    ]);

    $this->actingAs($admin, 'admin')
        ->post(route('admin.announcements.store'), [
            'title' => 'Campus fair',
            'category' => 'Event',
            'posted_by' => 'Student Affairs',
            'body' => 'Join us at the campus fair.',
            'event_date' => now()->addDays(3)->toDateString(),
            'start_time' => '09:00',
            'end_time' => '12:00',
            'location' => 'Main courtyard',
        ])
        ->assertRedirect();

    $event = Announcement::query()->firstOrFail();
    expect($event->event_date->toDateString())->toBe(now()->addDays(3)->toDateString())
        ->and($event->start_time)->toStartWith('09:00')
        ->and($event->end_time)->toStartWith('12:00')
        ->and($event->location)->toBe('Main courtyard');
});
