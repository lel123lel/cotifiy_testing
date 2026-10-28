<?php

use App\Models\Announcement;
use App\Models\User;

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
            ->where('announcement.location', 'Main Hall'));
});
