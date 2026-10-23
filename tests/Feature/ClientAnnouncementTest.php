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
