<?php

use App\Models\Announcement;
use App\Models\AdminUser;
use App\Models\StaffUser;
use App\Models\User;
use Illuminate\Support\Str;

test('the client page displays announcements from the database', function () {
    $user = User::factory()->create();

    $olderAnnouncement = Announcement::create([
        'title' => 'Older announcement',
        'category' => 'General',
        'posted_by' => 'Student Affairs',
        'date' => now()->subDay()->toDateString(),
        'body' => 'An older update.',
    ]);
    $latestAnnouncement = Announcement::create([
        'title' => 'Latest announcement',
        'category' => 'Academic',
        'posted_by' => 'Registrar',
        'date' => now()->toDateString(),
        'body' => 'The latest update.',
        'image' => 'announcements/latest.jpg',
    ]);

    $this->actingAs($user, 'web')
        ->get(route('client.clientpage'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('client/clientpage')
            ->where('announcements.0.id', $latestAnnouncement->id)
            ->where('announcements.0.content', 'The latest update.')
            ->where('announcements.0.image', '/storage/announcements/latest.jpg')
            ->where('announcements.1.id', $olderAnnouncement->id));
});

test('the client home counts announcements posted since their previous visit', function () {
    $user = User::factory()->create();
    $firstAnnouncement = Announcement::create([
        'title' => 'First announcement',
        'category' => 'General',
        'posted_by' => 'Student Affairs',
        'date' => now()->toDateString(),
        'body' => 'First update.',
    ]);

    $this->actingAs($user, 'web')
        ->get(route('client.clientpage'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('client/clientpage')
            ->where('newAnnouncementCount', 0));

    expect($user->fresh()->last_announcement_id)->toBe($firstAnnouncement->id);

    foreach (range(1, 2) as $number) {
        Announcement::create([
            'title' => "New announcement {$number}",
            'category' => 'General',
            'posted_by' => 'Student Affairs',
            'date' => now()->toDateString(),
            'body' => 'A new update.',
        ]);
    }

    $this->withHeaders([
        'X-Inertia-Partial-Data' => 'announcements,upcomingEvents,unreadCount',
    ])->get(route('client.clientpage'))
        ->assertOk();

    expect($user->fresh()->last_announcement_id)->toBe($firstAnnouncement->id);
    $this->flushHeaders();

    $this->get(route('client.clientpage'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('client/clientpage')
            ->where('newAnnouncementCount', 2));

    $this->get(route('client.clientpage'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('client/clientpage')
            ->where('newAnnouncementCount', 0));
});

test('the client announcement list renders markdown in announcement previews', function () {
    $user = User::factory()->create();
    Announcement::create([
        'title' => 'Markdown announcement',
        'category' => 'General',
        'posted_by' => 'Student Affairs',
        'date' => now()->toDateString(),
        'body' => '**Important** [details](https://example.com)',
    ]);

    $this->actingAs($user, 'web')
        ->get(route('client.clientpage'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('client/clientpage')
            ->where('announcements.0.content_html', '<p><strong>Important</strong> <a href="https://example.com">details</a></p>'));
});

test('the client home loads a compact recent feed and upcoming events independently', function () {
    $user = User::factory()->create();

    foreach (range(1, 12) as $number) {
        Announcement::create([
            'title' => "Announcement {$number}",
            'category' => 'General',
            'posted_by' => 'Student Affairs',
            'date' => now()->toDateString(),
            'body' => str_repeat('Announcement details. ', 20),
        ]);
    }

    $upcomingEvent = Announcement::create([
        'title' => 'Next month forum',
        'category' => 'Event',
        'posted_by' => 'Student Affairs',
        'date' => now()->subMonth()->toDateString(),
        'body' => str_repeat('Forum details. ', 20),
        'event_date' => now()->addMonth()->toDateString(),
        'start_time' => '09:00',
        'location' => 'Main Hall',
    ]);

    $this->actingAs($user, 'web')
        ->get(route('client.clientpage'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('client/clientpage')
            ->has('announcements', 10)
            ->where('announcements.0.title', 'Announcement 12')
            ->where('announcements.0.content', Str::limit(str_repeat('Announcement details. ', 20), 180))
            ->where('upcomingEvents.0.id', $upcomingEvent->id)
            ->where('upcomingEvents.0.title', 'Next month forum')
            ->where('upcomingEvents.0.content', Str::limit(str_repeat('Forum details. ', 20), 180)));
});

test('active urgent announcements stay at the top of client feeds', function () {
    $user = User::factory()->create();

    foreach (range(1, 11) as $number) {
        Announcement::create([
            'title' => "New announcement {$number}",
            'category' => 'General',
            'posted_by' => 'Student Affairs',
            'date' => now()->toDateString(),
            'body' => 'A newer update.',
        ]);
    }

    $urgentAnnouncement = Announcement::create([
        'title' => 'Older urgent announcement',
        'category' => 'General',
        'posted_by' => 'Student Affairs',
        'date' => now()->subDays(5)->toDateString(),
        'body' => 'This urgent update remains active.',
        'is_urgent' => true,
        'urgent_days' => 3,
        'urgent_until' => now()->addDay(),
    ]);
    expect($urgentAnnouncement->fresh()->is_urgent)->toBeTrue()
        ->and($urgentAnnouncement->fresh()->status)->toBe('Published');

    $this->actingAs($user, 'web')
        ->get(route('client.clientpage'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('announcements.0.id', $urgentAnnouncement->id)
            ->where('announcements.0.is_urgent', true));

    $this->get(route('client.announcements.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('announcements.0.id', $urgentAnnouncement->id)
            ->where('announcements.0.is_urgent', true));
});

test('the client can browse announcements, events, and saved items from their navigation pages', function () {
    $user = User::factory()->create();
    $announcement = Announcement::create([
        'title' => 'Registration reminder',
        'category' => 'Academic',
        'posted_by' => 'Registrar',
        'date' => now()->toDateString(),
        'body' => 'Registration closes soon.',
    ]);
    $event = Announcement::create([
        'title' => 'Campus forum',
        'category' => 'Event',
        'posted_by' => 'Student Affairs',
        'date' => now()->toDateString(),
        'body' => 'Join the campus forum.',
        'event_date' => now()->addWeek()->toDateString(),
        'start_time' => '09:00',
        'location' => 'Main Hall',
    ]);
    Announcement::create([
        'title' => 'Missing event date',
        'category' => 'Event',
        'posted_by' => 'Student Affairs',
        'date' => now()->toDateString(),
        'body' => 'This item is not an event listing without an event date.',
    ]);

    $this->actingAs($user, 'web')
        ->get(route('client.announcements.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('client/clientannounce')
            ->where('announcements.2.id', $announcement->id)
            ->where('announcements.2.posted_by', 'Registrar'));

    $this->get(route('client.events'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('client/clientevent')
            ->where('events.0.id', $event->id)
            ->where('events.0.posted_by_office', 'Student Affairs')
            ->where('events.0.event_date', now()->addWeek()->toDateString())
            ->has('events', 1));

    $this->get(route('client.saved'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('client/clientSaved')
            ->where('savedItems', []));
});

test('the client can open an announcement in the read more page', function () {
    $user = User::factory()->create(['name' => 'Taylor Student']);
    $announcement = Announcement::create([
        'title' => 'Campus event',
        'category' => 'Event',
        'posted_by' => 'Student Affairs',
        'date' => now()->toDateString(),
        'body' => 'Full announcement details.',
        'image' => 'announcements/event.jpg',
        'event_date' => now()->addWeek()->toDateString(),
        'start_time' => '09:00',
        'end_time' => '10:00',
        'location' => 'Main Hall',
    ]);

    $this->actingAs($user, 'web')
        ->get(route('client.announcements.show', $announcement))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('client/clientReadmore')
            ->where('announcement.id', $announcement->id)
            ->where('announcement.title', 'Campus event')
            ->where('announcement.content', 'Full announcement details.')
            ->where('announcement.image', '/storage/announcements/event.jpg')
            ->where('announcement.location', 'Main Hall')
            ->where('announcement.albums', []));
});

test('opening an announcement increments views but message polling does not', function () {
    $user = User::factory()->create();
    $announcement = Announcement::create([
        'title' => 'Announcement views',
        'category' => 'General',
        'posted_by' => 'Student Affairs',
        'date' => now()->toDateString(),
        'body' => 'View count test.',
    ]);

    $this->actingAs($user, 'web')
        ->get(route('client.announcements.show', $announcement))
        ->assertOk();

    $this->withHeaders([
        'X-Inertia-Partial-Data' => 'messages',
    ])->get(route('client.announcements.show', $announcement))
        ->assertOk();

    $this->assertDatabaseHas('announcement', [
        'id' => $announcement->id,
        'views_count' => 1,
    ]);
});

test('only urgent announcements can be marked read and staff and admins see unique reader counts', function () {
    $client = User::factory()->create();
    $staff = StaffUser::create([
        'name' => 'Campus Staff',
        'email' => 'read-count-staff@example.com',
        'password' => 'secret-password',
    ]);
    $admin = AdminUser::create([
        'name' => 'Site Admin',
        'email' => 'read-count-admin@example.com',
        'password' => 'secret-password',
    ]);
    $urgentAnnouncement = Announcement::create([
        'title' => 'Urgent update',
        'category' => 'General',
        'posted_by' => 'Student Affairs',
        'date' => now()->toDateString(),
        'body' => 'Please read this urgent update.',
        'is_urgent' => true,
        'urgent_days' => 2,
        'urgent_until' => now()->addDays(2),
    ]);
    $regularAnnouncement = Announcement::create([
        'title' => 'Regular update',
        'category' => 'General',
        'posted_by' => 'Student Affairs',
        'date' => now()->subDay()->toDateString(),
        'body' => 'This is not urgent.',
    ]);

    $this->actingAs($client, 'web')
        ->get(route('client.announcements.show', $urgentAnnouncement))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('announcement.is_urgent', true)
            ->where('announcement.is_read', false));

    $this->post(route('client.announcements.read', $regularAnnouncement))
        ->assertNotFound();

    $this->post(route('client.announcements.read', $urgentAnnouncement))->assertRedirect();
    $this->post(route('client.announcements.read', $urgentAnnouncement))->assertRedirect();
    $this->assertDatabaseCount('announcement_reads', 1);

    $this->actingAs($staff, 'staff')
        ->get(route('staff.announcements.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('announcements.0.id', $urgentAnnouncement->id)
            ->where('announcements.0.read_count', 1));

    $this->actingAs($admin, 'admin')
        ->get(route('admin.announcements.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('announcements.0.id', $urgentAnnouncement->id)
            ->where('announcements.0.read_count', 1));
});

test('the client can save and remove an announcement from their saved page', function () {
    $user = User::factory()->create();
    $announcement = Announcement::create([
        'title' => 'Campus event',
        'category' => 'Event',
        'posted_by' => 'Student Affairs',
        'date' => now()->toDateString(),
        'body' => 'Event details.',
        'image' => 'announcements/campus-event.jpg',
        'event_date' => now()->addWeek()->toDateString(),
    ]);

    $this->actingAs($user, 'web')
        ->post(route('client.saved.store', $announcement))
        ->assertRedirect();

    $this->get(route('client.announcements.show', $announcement))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('announcement.is_saved', true));

    $this->get(route('client.saved'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('savedItems.0.id', $announcement->id)
            ->where('savedItems.0.title', 'Campus event')
            ->where('savedItems.0.category', 'Event')
            ->where('savedItems.0.image', '/storage/announcements/campus-event.jpg')
            ->where('savedItems.0.link', route('client.announcements.show', $announcement)));

    $this->delete(route('client.saved.destroy', $announcement))
        ->assertRedirect();

    $this->get(route('client.announcements.show', $announcement))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('announcement.is_saved', false));

    $this->get(route('client.saved'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('savedItems', []));
});
