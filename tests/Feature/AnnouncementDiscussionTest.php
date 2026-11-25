<?php

use App\Models\AdminUser;
use App\Models\Announcement;
use App\Models\Conversation;
use App\Models\Message;
use App\Models\Office;
use App\Models\StaffUser;
use App\Models\User;

function createDiscussionAnnouncement(): Announcement
{
    return Announcement::create([
        'title' => 'Campus event',
        'category' => 'Event',
        'posted_by' => 'Student Affairs',
        'date' => now()->toDateString(),
        'body' => 'Event details.',
    ]);
}

test('client messages are saved to a conversation for that client and announcement', function () {
    $announcement = createDiscussionAnnouncement();
    $client = User::factory()->create([
        'name' => 'Taylor Student',
        'profile_photo_path' => 'profile-photos/taylor.jpg',
    ]);

    $this->actingAs($client, 'web')
        ->post(route('client.announcements.messages.store', $announcement), [
            'content' => 'Is registration required?',
        ])
        ->assertRedirect();

    $conversation = Conversation::query()->sole();
    expect($conversation->announcement_id)->toBe($announcement->id)
        ->and($conversation->client_id)->toBe($client->id)
        ->and($conversation->messages()->sole()->content)->toBe('Is registration required?');

    $this->get(route('client.announcements.show', $announcement))
        ->assertInertia(fn ($page) => $page
            ->where('messages.0.author', 'Taylor Student')
            ->where('messages.0.content', 'Is registration required?')
            ->where('messages.0.role', 'Client')
            ->where('messages.0.author_photo_url', '/storage/profile-photos/taylor.jpg')
            ->where('messages.0.parent_message_id', null)
            ->where('messages.0.is_mine', true));
});

test('clients across departments can see and reply to each other comments', function () {
    $announcement = createDiscussionAnnouncement();
    $firstClient = User::factory()->create(['course' => 'BSIT']);
    $secondClient = User::factory()->create(['course' => 'BSCE']);

    $this->actingAs($firstClient, 'web')
        ->post(route('client.announcements.messages.store', $announcement), ['content' => 'First client question']);
    $this->actingAs($secondClient, 'web')
        ->post(route('client.announcements.messages.store', $announcement), ['content' => 'Second client question']);

    expect(Conversation::query()->count())->toBe(2)
        ->and(Message::query()->count())->toBe(2);

    $firstComment = Conversation::query()
        ->where('client_id', $firstClient->id)
        ->firstOrFail()
        ->messages()
        ->sole();

    $this->actingAs($secondClient, 'web')
        ->post(route('client.announcements.messages.store', $announcement), [
            'content' => 'Reply from another department',
            'parent_message_id' => $firstComment->id,
        ])
        ->assertRedirect();

    $this->actingAs($firstClient, 'web')
        ->get(route('client.announcements.show', $announcement))
        ->assertInertia(fn ($page) => $page
            ->has('messages', 3)
            ->where('messages.0.content', 'First client question')
            ->where('messages.0.is_announcement_wide', true)
            ->where('messages.1.content', 'Second client question')
            ->where('messages.2.content', 'Reply from another department')
            ->where('messages.2.parent_message_id', $firstComment->id));

    $this->actingAs($secondClient, 'web')
        ->get(route('client.announcements.show', $announcement))
        ->assertInertia(fn ($page) => $page
            ->has('messages', 3)
            ->where('messages.0.content', 'First client question')
            ->where('messages.2.content', 'Reply from another department'));
});

test('a client has separate discussions for different announcements', function () {
    $firstAnnouncement = createDiscussionAnnouncement();
    $secondAnnouncement = Announcement::create([
        'title' => 'Library hours',
        'category' => 'General',
        'posted_by' => 'Library',
        'date' => now()->toDateString(),
        'body' => 'Updated opening hours.',
    ]);
    $client = User::factory()->create();

    $this->actingAs($client, 'web')
        ->post(route('client.announcements.messages.store', $firstAnnouncement), ['content' => 'Question about the event']);
    $this->post(route('client.announcements.messages.store', $secondAnnouncement), ['content' => 'Question about the library']);

    expect(Conversation::query()->where('client_id', $client->id)->count())->toBe(2);

    $this->get(route('client.announcements.show', $firstAnnouncement))
        ->assertInertia(fn ($page) => $page
            ->has('messages', 1)
            ->where('messages.0.content', 'Question about the event'));
    $this->get(route('client.announcements.show', $secondAnnouncement))
        ->assertInertia(fn ($page) => $page
            ->has('messages', 1)
            ->where('messages.0.content', 'Question about the library'));
});

test('admins can see and reply to client discussions', function () {
    $announcement = createDiscussionAnnouncement();
    $client = User::factory()->create(['name' => 'Taylor Student']);
    $admin = AdminUser::create([
        'name' => 'Site Admin',
        'email' => 'admin@example.com',
        'password' => 'secret-password',
    ]);

    $this->actingAs($client, 'web')
        ->post(route('client.announcements.messages.store', $announcement), ['content' => 'What time does it start?']);
    $conversation = Conversation::query()->sole();

    $this->actingAs($admin, 'admin')
        ->get(route('admin'))
        ->assertInertia(fn ($page) => $page
            ->where('discussions.0.announcement_id', $announcement->id)
            ->where('discussions.0.client_name', 'Taylor Student')
            ->where('discussions.0.announcement_title', 'Campus event')
            ->where('discussions.0.messages.0.content', 'What time does it start?')
            ->where('discussions.0.messages.0.parent_message_id', null));

    $this->actingAs($admin, 'admin')
        ->post(route('admin.discussions.messages.store', $conversation), [
            'content' => 'The event starts at 9 AM.',
            'parent_message_id' => $conversation->messages()->sole()->id,
        ])
        ->assertRedirect();

    expect($conversation->messages()->count())->toBe(2)
        ->and($conversation->messages()->latest()->firstOrFail()->sender_admin_id)->toBe($admin->id);

    $this->actingAs($client, 'web')
        ->get(route('client.announcements.show', $announcement))
        ->assertInertia(fn ($page) => $page
            ->has('messages', 2)
            ->where('messages.1.author', 'Site Admin')
            ->where('messages.1.role', 'Admin')
            ->where('messages.1.parent_message_id', $conversation->messages()->first()->id)
            ->where('messages.1.content', 'The event starts at 9 AM.')
            ->where('messages.1.is_mine', false));
});

test('the client detail page returns every discussion message including admin comments', function () {
    $announcement = createDiscussionAnnouncement();
    $client = User::factory()->create();
    $admin = AdminUser::create([
        'name' => 'Site Admin',
        'email' => 'admin@example.com',
        'password' => 'secret-password',
    ]);

    $this->actingAs($client, 'web')
        ->post(route('client.announcements.messages.store', $announcement), [
            'content' => 'Student comment',
        ]);
    $conversation = Conversation::query()->sole();

    $this->actingAs($admin, 'admin')
        ->post(route('admin.discussions.messages.store', $conversation), [
            'content' => 'Office response',
        ]);

    $this->actingAs($client, 'web')
        ->get(route('client.announcements.show', $announcement))
        ->assertInertia(fn ($page) => $page
            ->has('messages', 2)
            ->where('messages.0.content', 'Student comment')
            ->where('messages.0.role', 'Client')
            ->where('messages.1.content', 'Office response')
            ->where('messages.1.role', 'Admin'));
});

test('admin replies are attached to a specific student comment', function () {
    $announcement = createDiscussionAnnouncement();
    $client = User::factory()->create(['name' => 'Taylor Student']);
    $admin = AdminUser::create([
        'name' => 'Site Admin',
        'email' => 'admin@example.com',
        'password' => 'secret-password',
    ]);

    $this->actingAs($client, 'web')
        ->post(route('client.announcements.messages.store', $announcement), ['content' => 'First concern']);
    $this->post(route('client.announcements.messages.store', $announcement), ['content' => 'Second concern']);
    $conversation = Conversation::query()->sole();
    $firstComment = $conversation->messages()->oldest('id')->firstOrFail();
    $secondComment = $conversation->messages()->latest('id')->firstOrFail();

    $this->actingAs($admin, 'admin')
        ->post(route('admin.discussions.messages.store', $conversation), [
            'content' => 'Reply to the second concern',
            'parent_message_id' => $secondComment->id,
        ])
        ->assertRedirect();

    expect($conversation->messages()->whereNotNull('sender_admin_id')->sole()->parent_message_id)
        ->toBe($secondComment->id)
        ->not->toBe($firstComment->id);

    $this->actingAs($client, 'web')
        ->get(route('client.announcements.show', $announcement))
        ->assertInertia(fn ($page) => $page
            ->where('messages.2.parent_message_id', $secondComment->id));
});

test('clients and admins can reply to each other at any depth', function () {
    $announcement = createDiscussionAnnouncement();
    $client = User::factory()->create(['name' => 'Taylor Student']);
    $admin = AdminUser::create([
        'name' => 'Site Admin',
        'email' => 'admin@example.com',
        'password' => 'secret-password',
    ]);

    $this->actingAs($client, 'web')
        ->post(route('client.announcements.messages.store', $announcement), ['content' => 'I have a concern'])
        ->assertRedirect();
    $conversation = Conversation::query()->sole();
    $studentConcern = $conversation->messages()->sole();

    $this->actingAs($admin, 'admin')
        ->post(route('admin.discussions.messages.store', $conversation), [
            'content' => 'How can we help?',
            'parent_message_id' => $studentConcern->id,
        ])
        ->assertRedirect();
    $adminReply = $conversation->messages()->whereNotNull('sender_admin_id')->sole();

    $this->actingAs($client, 'web')
        ->post(route('client.announcements.messages.store', $announcement), [
            'content' => 'Here is more detail',
            'parent_message_id' => $adminReply->id,
        ])
        ->assertRedirect();
    $studentReply = $conversation->messages()->where('parent_message_id', $adminReply->id)->sole();

    $this->actingAs($admin, 'admin')
        ->post(route('admin.discussions.messages.store', $conversation), [
            'content' => 'Thank you for clarifying',
            'parent_message_id' => $studentReply->id,
        ])
        ->assertRedirect();
    $adminFollowup = $conversation->messages()->where('content', 'Thank you for clarifying')->sole();

    expect($conversation->messages()->count())->toBe(4)
        ->and($adminReply->parent_message_id)->toBe($studentConcern->id)
        ->and($studentReply->parent_message_id)->toBe($adminReply->id)
        ->and($adminFollowup->parent_message_id)->toBe($studentReply->id);

    $this->actingAs($client, 'web')
        ->get(route('client.announcements.show', $announcement))
        ->assertInertia(fn ($page) => $page
            ->has('messages', 4)
            ->where('messages.2.parent_message_id', $adminReply->id)
            ->where('messages.3.parent_message_id', $studentReply->id));

    $this->actingAs($admin, 'admin')
        ->get(route('admin'))
        ->assertInertia(fn ($page) => $page
            ->has('discussions.0.messages', 4)
            ->where('discussions.0.messages.2.parent_message_id', $adminReply->id)
            ->where('discussions.0.messages.3.parent_message_id', $studentReply->id));
});

test('admins can add top-level comments to a client discussion', function () {
    $announcement = createDiscussionAnnouncement();
    $client = User::factory()->create();
    $admin = AdminUser::create([
        'name' => 'Site Admin',
        'email' => 'admin@example.com',
        'password' => 'secret-password',
    ]);

    $this->actingAs($client, 'web')
        ->post(route('client.announcements.messages.store', $announcement), ['content' => 'Student comment']);
    $conversation = Conversation::query()->sole();

    $this->actingAs($admin, 'admin')
        ->post(route('admin.discussions.messages.store', $conversation), [
            'content' => 'Admin comment',
        ])
        ->assertRedirect();

    $adminComment = $conversation->messages()->whereNotNull('sender_admin_id')->sole();
    expect($adminComment->parent_message_id)->toBeNull();
});

test('admins can post announcement-wide comments visible to every client', function () {
    $announcement = createDiscussionAnnouncement();
    $firstClient = User::factory()->create();
    $secondClient = User::factory()->create();
    $admin = AdminUser::create([
        'name' => 'Site Admin',
        'email' => 'admin@example.com',
        'password' => 'secret-password',
    ]);

    $this->actingAs($admin, 'admin')
        ->post(route('admin.announcements.comments.store', $announcement), [
            'content' => 'The event starts at 9 AM.',
        ])
        ->assertRedirect();

    $announcementConversation = Conversation::query()
        ->where('announcement_id', $announcement->id)
        ->whereNull('client_id')
        ->sole();
    expect($announcementConversation->messages()->sole()->sender_admin_id)->toBe($admin->id);

    foreach ([$firstClient, $secondClient] as $client) {
        $this->actingAs($client, 'web')
            ->get(route('client.announcements.show', $announcement))
            ->assertInertia(fn ($page) => $page
                ->has('messages', 1)
                ->where('messages.0.content', 'The event starts at 9 AM.')
                ->where('messages.0.role', 'Admin')
                ->where('messages.0.is_announcement_wide', true));
    }

    $this->actingAs($admin, 'admin')
        ->get(route('admin.announcements.index'))
        ->assertInertia(fn ($page) => $page
            ->where('announcementComments.0.announcement_id', $announcement->id)
            ->where('announcementComments.0.messages.0.content', 'The event starts at 9 AM.'));
});

test('admins can reply to announcement-wide comments including their own replies', function () {
    $announcement = createDiscussionAnnouncement();
    $client = User::factory()->create();
    $admin = AdminUser::create([
        'name' => 'Site Admin',
        'email' => 'admin@example.com',
        'password' => 'secret-password',
    ]);

    $this->actingAs($admin, 'admin')
        ->post(route('admin.announcements.comments.store', $announcement), [
            'content' => 'Admin announcement comment',
        ])
        ->assertRedirect();
    $conversation = Conversation::query()->sole();
    $originalComment = $conversation->messages()->sole();

    $this->post(route('admin.announcements.comments.store', $announcement), [
        'content' => 'Admin reply to own comment',
        'parent_message_id' => $originalComment->id,
    ])->assertRedirect();
    $reply = $conversation->messages()->where('parent_message_id', $originalComment->id)->sole();

    $this->post(route('admin.announcements.comments.store', $announcement), [
        'content' => 'Admin reply to own reply',
        'parent_message_id' => $reply->id,
    ])->assertRedirect();

    expect($conversation->messages()->count())->toBe(3)
        ->and($reply->sender_admin_id)->toBe($admin->id);

    $this->actingAs($client, 'web')
        ->get(route('client.announcements.show', $announcement))
        ->assertInertia(fn ($page) => $page
            ->has('messages', 3)
            ->where('messages.1.parent_message_id', $originalComment->id)
            ->where('messages.1.content', 'Admin reply to own comment')
            ->where('messages.2.parent_message_id', $reply->id)
            ->where('messages.2.content', 'Admin reply to own reply'));

    $this->actingAs($admin, 'admin')
        ->get(route('admin.announcements.index'))
        ->assertInertia(fn ($page) => $page
            ->has('announcementComments.0.messages', 3)
            ->where('announcementComments.0.messages.1.parent_message_id', $originalComment->id)
            ->where('announcementComments.0.messages.2.parent_message_id', $reply->id));
});

test('clients can reply to announcement-wide comments and their own replies', function () {
    $announcement = createDiscussionAnnouncement();
    $firstClient = User::factory()->create(['name' => 'Taylor Student']);
    $secondClient = User::factory()->create(['name' => 'Jordan Student']);
    $admin = AdminUser::create([
        'name' => 'Site Admin',
        'email' => 'admin@example.com',
        'password' => 'secret-password',
    ]);

    $this->actingAs($admin, 'admin')
        ->post(route('admin.announcements.comments.store', $announcement), [
            'content' => 'Announcement-wide admin comment',
        ])
        ->assertRedirect();
    $conversation = Conversation::query()->sole();
    $adminComment = $conversation->messages()->sole();

    $this->actingAs($firstClient, 'web')
        ->post(route('client.announcements.messages.store', $announcement), [
            'content' => 'Student reply',
            'parent_message_id' => $adminComment->id,
        ])
        ->assertRedirect();
    $studentReply = $conversation->messages()->where('sender_id', $firstClient->id)->sole();

    $this->post(route('client.announcements.messages.store', $announcement), [
        'content' => 'Student reply to own reply',
        'parent_message_id' => $studentReply->id,
    ])->assertRedirect();

    expect($conversation->messages()->count())->toBe(3);

    $this->actingAs($secondClient, 'web')
        ->get(route('client.announcements.show', $announcement))
        ->assertInertia(fn ($page) => $page
            ->has('messages', 3)
            ->where('messages.1.author', 'Taylor Student')
            ->where('messages.1.role', 'Client')
            ->where('messages.1.is_announcement_wide', true)
            ->where('messages.1.parent_message_id', $adminComment->id)
            ->where('messages.2.parent_message_id', $studentReply->id)
            ->where('messages.2.content', 'Student reply to own reply'));

    $this->actingAs($admin, 'admin')
        ->get(route('admin.announcements.index'))
        ->assertInertia(fn ($page) => $page
            ->has('announcementComments.0.messages', 3)
            ->where('announcementComments.0.messages.1.author', 'Taylor Student')
            ->where('announcementComments.0.messages.1.role', 'Client')
            ->where('announcementComments.0.messages.2.parent_message_id', $studentReply->id));
});

test('admins cannot reply to a comment outside the discussion', function () {
    $announcement = createDiscussionAnnouncement();
    $anotherAnnouncement = Announcement::create([
        'title' => 'Library hours',
        'category' => 'General',
        'posted_by' => 'Library',
        'date' => now()->toDateString(),
        'body' => 'Updated opening hours.',
    ]);
    $client = User::factory()->create();
    $admin = AdminUser::create([
        'name' => 'Site Admin',
        'email' => 'admin@example.com',
        'password' => 'secret-password',
    ]);

    $this->actingAs($client, 'web')
        ->post(route('client.announcements.messages.store', $announcement), ['content' => 'First discussion']);
    $firstConversation = Conversation::query()->sole();
    $this->post(route('client.announcements.messages.store', $anotherAnnouncement), ['content' => 'Other discussion']);
    $otherComment = Conversation::query()->where('announcement_id', $anotherAnnouncement->id)->firstOrFail()->messages()->sole();

    $this->actingAs($admin, 'admin')
        ->from(route('admin'))
        ->post(route('admin.discussions.messages.store', $firstConversation), [
            'content' => 'Wrong thread reply',
            'parent_message_id' => $otherComment->id,
        ])
        ->assertSessionHasErrors('parent_message_id');

    expect($firstConversation->messages()->count())->toBe(1);
});

test('clients cannot reply to a message outside their announcement discussion', function () {
    $announcement = createDiscussionAnnouncement();
    $anotherAnnouncement = Announcement::create([
        'title' => 'Library hours',
        'category' => 'General',
        'posted_by' => 'Library',
        'date' => now()->toDateString(),
        'body' => 'Updated opening hours.',
    ]);
    $client = User::factory()->create();

    $this->actingAs($client, 'web')
        ->post(route('client.announcements.messages.store', $anotherAnnouncement), ['content' => 'Other conversation']);
    $otherMessage = Conversation::query()
        ->where('announcement_id', $anotherAnnouncement->id)
        ->firstOrFail()
        ->messages()
        ->sole();

    $this->from(route('client.announcements.show', $announcement))
        ->post(route('client.announcements.messages.store', $announcement), [
            'content' => 'Invalid cross-discussion reply',
            'parent_message_id' => $otherMessage->id,
        ])
        ->assertSessionHasErrors('parent_message_id');

    expect(Conversation::query()->where('announcement_id', $announcement->id)->exists())->toBeFalse();
});

test('discussion messages must contain non-empty text', function () {
    $announcement = createDiscussionAnnouncement();
    $client = User::factory()->create();

    $this->actingAs($client, 'web')
        ->from(route('client.announcements.show', $announcement))
        ->post(route('client.announcements.messages.store', $announcement), ['content' => '   '])
        ->assertSessionHasErrors('content');

    expect(Conversation::query()->count())->toBe(0);
});

test('client comments notify the staff author and all admins, but not other staff', function () {
    $announcement = createDiscussionAnnouncement();
    $office = Office::create(['name' => 'Student Affairs']);
    $otherOffice = Office::create(['name' => 'Library']);
    $staffAccounts = collect([
        StaffUser::create([
            'name' => 'Student Affairs One',
            'email' => 'sao-one@example.com',
            'password' => 'secret-password',
        ]),
        StaffUser::create([
            'name' => 'Student Affairs Two',
            'email' => 'sao-two@example.com',
            'password' => 'secret-password',
        ]),
    ]);
    $staffAccounts->each(fn (StaffUser $staff) => $staff->forceFill(['office_id' => $office->id])->save());
    $staffAuthor = $staffAccounts->first();
    $announcement->update(['author_staff_id' => $staffAuthor->id]);
    $unrelatedStaff = StaffUser::create([
        'name' => 'Library Staff',
        'email' => 'library@example.com',
        'password' => 'secret-password',
    ]);
    $unrelatedStaff->forceFill(['office_id' => $otherOffice->id])->save();
    $admins = collect([
        AdminUser::create([
            'name' => 'First Admin',
            'email' => 'first-admin@example.com',
            'password' => 'secret-password',
        ]),
        AdminUser::create([
            'name' => 'Second Admin',
            'email' => 'second-admin@example.com',
            'password' => 'secret-password',
        ]),
    ]);
    $client = User::factory()->create(['name' => 'Taylor Student']);

    $this->actingAs($client, 'web')
        ->post(route('client.announcements.messages.store', $announcement), ['content' => 'Student question'])
        ->assertRedirect();
    $parentMessage = Message::query()->sole();

    $this->post(route('client.announcements.messages.store', $announcement), [
        'content' => 'Student reply',
        'parent_message_id' => $parentMessage->id,
    ])->assertRedirect();

    $staffNotifications = $staffAuthor->notifications()->get();
    expect($staffNotifications)->toHaveCount(2)
        ->and($staffNotifications->pluck('data.title')->all())->toContain(
            'New comment on an announcement',
            'New reply on an announcement',
        )
        ->and($staffNotifications->pluck('data.message')->all())->toContain(
            'Taylor Student commented on Campus event.',
            'Taylor Student replied to a comment on Campus event.',
        )
        ->and($staffNotifications->first()->data['office'])->toBe('Student Affairs')
        ->and($staffNotifications->first()->announcement_id)->toBe($announcement->id);

    expect($staffAccounts->last()->notifications()->count())->toBe(0)
        ->and($unrelatedStaff->notifications()->count())->toBe(0);

    foreach ($admins as $admin) {
        expect($admin->notifications()->count())->toBe(2);
    }

    $admin = $admins->first();
    $this->actingAs($admin, 'admin')
        ->get(route('admin'))
        ->assertInertia(fn ($page) => $page
            ->where('adminUnreadCount', 2)
            ->has('adminRecentNotifications', 2)
            ->where(
                'adminRecentNotifications.0.link',
                route('admin.announcements.index', [
                    'announcement' => $announcement->id,
                    'section' => 'comments',
                ]),
            ));

    $this->get(route('admin.announcements.index', [
        'announcement' => $announcement->id,
        'section' => 'comments',
    ]))->assertInertia(fn ($page) => $page
        ->where('openAnnouncementId', $announcement->id)
        ->where('openAnnouncementSection', 'comments'));

    $notification = $admin->notifications()->firstOrFail();
    $this->post(route('admin.notifications.read', $notification->id))
        ->assertRedirect();
    expect($notification->fresh()->read_at)->not->toBeNull();
});

test('staff can mark their own discussion notifications read', function () {
    $announcement = createDiscussionAnnouncement();
    $office = Office::create(['name' => 'Student Affairs']);
    $staff = StaffUser::create([
        'name' => 'Student Affairs Staff',
        'email' => 'sao@example.com',
        'password' => 'secret-password',
    ]);
    $staff->forceFill(['office_id' => $office->id])->save();
    $announcement->update(['author_staff_id' => $staff->id]);
    $otherStaff = StaffUser::create([
        'name' => 'Other Staff',
        'email' => 'other@example.com',
        'password' => 'secret-password',
    ]);
    $otherStaff->forceFill(['office_id' => $office->id])->save();
    $client = User::factory()->create();

    $this->actingAs($client, 'web')
        ->post(route('client.announcements.messages.store', $announcement), ['content' => 'First comment']);
    $firstNotification = $staff->notifications()->firstOrFail();
    $this->post(route('client.announcements.messages.store', $announcement), ['content' => 'Second comment']);
    $secondNotification = $staff->notifications()
        ->where('id', '!=', $firstNotification->id)
        ->firstOrFail();
    $firstNotification->forceFill([
        'data' => [
            ...$firstNotification->data,
            'link' => route('staff.announcements.index'),
        ],
    ])->save();

    $this->actingAs($staff, 'staff')
        ->get(route('staff.announcements.index'))
        ->assertInertia(fn ($page) => $page
            ->where('staffUnreadCount', 2)
            ->has('staffRecentNotifications', 2)
            ->where('staffRecentNotifications.0.title', 'New comment on an announcement')
            ->where(
                'staffRecentNotifications.0.link',
                route('staff.announcements.index', [
                    'announcement' => $announcement->id,
                    'section' => 'comments',
                ]),
            )
            ->where(
                'staffRecentNotifications.1.link',
                route('staff.announcements.index', [
                    'announcement' => $announcement->id,
                    'section' => 'comments',
                ]),
            ));

    $this->get(route('staff.announcements.index', [
        'announcement' => $announcement->id,
        'section' => 'comments',
    ]))->assertInertia(fn ($page) => $page
        ->where('openAnnouncementId', $announcement->id)
        ->where('openAnnouncementSection', 'comments'));

    $this->get(route('staff.announcements.index', [
        'tab' => 'my-posts',
        'category' => 'Event',
    ]))->assertInertia(fn ($page) => $page
        ->where('initialTab', 'My Posts')
        ->where('initialCategoryFilter', 'Event'));

    $this->get(route('staff.notifications.index'))
        ->assertInertia(fn ($page) => $page
            ->component('staff/staffnotif')
            ->has('notifications', 2)
            ->where('staffDepartment', 'Student Affairs')
            ->where('notifications.0.title', 'New comment on an announcement')
            ->where(
                'notifications.0.link',
                route('staff.announcements.index', [
                    'announcement' => $announcement->id,
                    'section' => 'comments',
                ]),
            ));

    $this->actingAs($otherStaff, 'staff')
        ->post(route('staff.notifications.read', $firstNotification->id))
        ->assertNotFound();

    $this->actingAs($staff, 'staff')
        ->post(route('staff.notifications.read', $firstNotification->id))
        ->assertRedirect();
    expect($firstNotification->fresh()->read_at)->not->toBeNull()
        ->and($secondNotification->fresh()->read_at)->toBeNull()
        ->and($staff->fresh()->unreadNotifications()->count())->toBe(1);

    $this->post(route('staff.notifications.mark-all-read'))
        ->assertRedirect();
    expect($staff->fresh()->unreadNotifications()->count())->toBe(0);

    $this->delete(route('staff.notifications.clear'))
        ->assertRedirect();
    expect($staff->fresh()->notifications()->count())->toBe(0)
        ->and($otherStaff->fresh()->notifications()->count())->toBe(0);
});
