<?php

use App\Models\AdminUser;
use App\Models\Announcement;
use App\Models\Conversation;
use App\Models\Message;
use App\Models\StaffUser;
use App\Models\User;
use App\Notifications\AnnouncementPublished;
use App\Notifications\AnnouncementReminder;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

test('announcement bodies render markdown without allowing raw html', function () {
    $announcement = Announcement::create([
        'title' => 'Markdown announcement',
        'category' => 'General',
        'posted_by' => 'Office of the Registrar',
        'date' => now()->toDateString(),
        'body' => '**Important** details. <script>alert(1)</script>',
    ]);

    $html = $announcement->bodyAsHtml();

    expect($html)->toContain('<strong>Important</strong>')
        ->and($html)->not->toContain('<script>');
});

test('an admin can publish an announcement', function () {
    Storage::fake('public');
    Notification::fake();

    $admin = AdminUser::create([
        'name' => 'Site Admin',
        'email' => 'admin@example.com',
        'password' => 'secret-password',
    ]);
    $users = User::factory()->count(2)->create();

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
    expect($announcement->author_admin_id)->toBe($admin->id)
        ->and($announcement->adminAuthor->is($admin))->toBeTrue();

    $this->assertDatabaseHas('announcement', [
        'title' => 'Campus closure',
        'category' => 'General',
        'posted_by' => 'Office of the Registrar',
        'body' => 'The campus will be closed tomorrow.',
    ]);
    expect($announcement->image)->not->toBeNull();
    Storage::disk('public')->assertExists($announcement->image);

    expect($announcement->date->toDateString())->toBe(now()->toDateString());
    foreach ($users as $user) {
        Notification::assertSentTo($user, AnnouncementPublished::class, function (AnnouncementPublished $notification) use ($announcement, $user): bool {
            $mail = $notification->toMail($user);

            return $notification->announcement->is($announcement)
                && $mail->subject === 'New announcement: Campus closure'
                && $mail->actionText === 'Read announcement';
        });
    }

    $this->get(route('admin'))
        ->assertInertia(fn ($page) => $page
            ->component('admin/admin')
            ->where('announcements.0.title', 'Campus closure')
            ->where('announcements.0.image_url', '/storage/'.$announcement->image)
            ->where('announcements.0.date', now()->toDateString()));
});

test('admin announcement pages include all announcements and expose ownership', function () {
    Notification::fake();
    $admin = AdminUser::create([
        'name' => 'Site Admin',
        'email' => 'admin@example.com',
        'password' => 'secret-password',
    ]);
    $otherAdmin = AdminUser::create([
        'name' => 'Other Admin',
        'email' => 'other-admin@example.com',
        'password' => 'secret-password',
    ]);

    $this->actingAs($admin, 'admin')
        ->post(route('admin.announcements.store'), [
            'title' => 'My announcement',
            'category' => 'General',
            'posted_by' => 'Student Services',
            'body' => 'Created by the signed-in admin.',
        ])->assertRedirect();
    $myAnnouncement = Announcement::query()->where('title', 'My announcement')->firstOrFail();

    $this->actingAs($otherAdmin, 'admin')
        ->post(route('admin.announcements.store'), [
            'title' => 'Other admin announcement',
            'category' => 'General',
            'posted_by' => 'Registrar',
            'body' => 'Created by another admin.',
        ])->assertRedirect();
    $otherAnnouncement = Announcement::query()->where('title', 'Other admin announcement')->firstOrFail();

    $this->actingAs($admin, 'admin')
        ->get(route('admin.announcements.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('adminId', $admin->id)
            ->has('announcements', 2)
            ->where('announcements.0.author_admin_id', $otherAdmin->id)
            ->where('announcements.1.author_admin_id', $admin->id));

    $this->get(route('admin'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->has('recentAnnouncements', 2)
            ->where('recentAnnouncements.0.author_admin_id', $otherAdmin->id)
            ->where('recentAnnouncements.1.author_admin_id', $admin->id));

    expect($myAnnouncement->adminAuthor->is($admin))->toBeTrue()
        ->and($otherAnnouncement->adminAuthor->is($otherAdmin))->toBeTrue();
});

test('staff can manage announcements and events through the staff panel', function () {
    Notification::fake();
    $staff = StaffUser::create([
        'name' => 'Campus Staff',
        'email' => 'staff@example.com',
        'password' => 'secret-password',
    ]);

    $this->actingAs($staff, 'staff')
        ->post(route('staff.announcements.store'), [
            'title' => 'Staff announcement',
            'category' => 'General',
            'posted_by' => 'Student Services',
            'body' => 'Staff created this announcement.',
        ])
        ->assertRedirect();

    $announcement = Announcement::query()->where('title', 'Staff announcement')->firstOrFail();
    expect($announcement->author_staff_id)->toBe($staff->id)
        ->and($announcement->staffAuthor->is($staff))->toBeTrue();

    $this->put(route('staff.announcements.update', $announcement), [
        'title' => 'Updated staff announcement',
        'category' => 'General',
        'posted_by' => 'Student Services',
        'body' => 'Staff updated this announcement.',
    ])->assertRedirect();

    $eventResponse = $this->post(route('staff.announcements.store'), [
        'title' => 'Staff event',
        'category' => 'Event',
        'posted_by' => 'Student Services',
        'body' => 'Staff created this event.',
        'event_date' => now()->addDays(3)->toDateString(),
        'event_end_date' => now()->addDays(4)->toDateString(),
        'start_time' => '09:00',
        'end_time' => '10:00',
        'location' => 'Main Hall',
    ]);
    $eventResponse->assertRedirect();

    $event = Announcement::query()->where('title', 'Staff event')->firstOrFail();

    $this->get(route('staff.announcements.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
        ->component('staff/staffannouncement')
            ->where('staffName', 'Campus Staff')
            ->where('announcements.0.title', 'Staff event'));

    $this->get(route('staff.events'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('admin/adminEvent')
            ->where('staffMode', true)
            ->where('staffName', 'Campus Staff')
            ->where('events.0.title', 'Staff event')
            ->where('events.0.is_mine', true));

    $this->delete(route('staff.announcements.destroy', $announcement))
        ->assertRedirect();

    $this->assertDatabaseMissing('announcement', ['id' => $announcement->id]);
    $this->assertDatabaseHas('announcement', ['id' => $event->id, 'category' => 'Event']);
});

test('deleting an announcement removes its client notifications', function () {
    $client = User::factory()->create();
    $staff = StaffUser::create([
        'name' => 'Campus Staff',
        'email' => 'notification-delete-staff@example.com',
        'password' => 'secret-password',
    ]);
    $announcement = Announcement::create([
        'title' => 'Announcement to delete',
        'category' => 'General',
        'posted_by' => 'Student Services',
        'date' => now()->toDateString(),
        'body' => 'This announcement will be deleted.',
        'author_staff_id' => $staff->id,
    ]);
    $notificationId = (string) Str::uuid();
    DB::table('notifications')->insert([
        'id' => $notificationId,
        'type' => AnnouncementPublished::class,
        'notifiable_type' => User::class,
        'notifiable_id' => $client->id,
        'announcement_id' => $announcement->id,
        'data' => json_encode(['title' => $announcement->title], JSON_THROW_ON_ERROR),
        'created_at' => now(),
        'updated_at' => now(),
    ]);

    $this->actingAs($staff, 'staff')
        ->delete(route('staff.announcements.destroy', $announcement))
        ->assertRedirect();

    $this->assertDatabaseMissing('notifications', ['id' => $notificationId]);
    $this->assertDatabaseMissing('announcement', ['id' => $announcement->id]);
});

test('staff and admins receive announcement engagement analytics', function () {
    $client = User::factory()->create();
    $staff = StaffUser::create([
        'name' => 'Campus Staff',
        'email' => 'analytics-staff@example.com',
        'password' => 'secret-password',
    ]);
    $admin = AdminUser::create([
        'name' => 'Site Admin',
        'email' => 'analytics-admin@example.com',
        'password' => 'secret-password',
    ]);
    $announcement = Announcement::create([
        'title' => 'Urgent analytics announcement',
        'category' => 'General',
        'posted_by' => 'Student Services',
        'date' => now()->toDateString(),
        'body' => 'Announcement analytics test.',
        'is_urgent' => true,
        'urgent_days' => 2,
        'urgent_until' => now()->addDays(2),
        'author_staff_id' => $staff->id,
    ]);
    $client->savedAnnouncements()->attach($announcement->id);
    $announcement->readers()->attach($client->id);
    $conversation = Conversation::create([
        'type' => 'announcement',
        'name' => $announcement->title,
        'announcement_id' => $announcement->id,
        'client_id' => $client->id,
    ]);
    Message::create([
        'conversation_id' => $conversation->id,
        'sender_id' => $client->id,
        'content' => 'A question about the announcement.',
    ]);
    Message::create([
        'conversation_id' => $conversation->id,
        'sender_admin_id' => $admin->id,
        'content' => 'An answer to the question.',
    ]);

    $this->actingAs($staff, 'staff')
        ->get(route('staff.announcements.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('announcements.0.view_count', 0)
            ->where('announcements.0.saved_count', 1)
            ->where('announcements.0.comment_count', 2)
            ->where('announcements.0.read_count', 1));

    $this->actingAs($admin, 'admin')
        ->get(route('admin.announcements.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('announcements.0.saved_count', 1)
            ->where('announcements.0.comment_count', 2)
            ->where('announcements.0.read_count', 1));
});

test('staff can archive and restore only their own announcements', function () {
    $staff = StaffUser::create([
        'name' => 'Campus Staff',
        'email' => 'archive-staff@example.com',
        'password' => 'secret-password',
    ]);
    $otherStaff = StaffUser::create([
        'name' => 'Other Staff',
        'email' => 'other-archive-staff@example.com',
        'password' => 'secret-password',
    ]);
    $ownAnnouncement = Announcement::create([
        'title' => 'My announcement',
        'category' => 'General',
        'posted_by' => 'Student Services',
        'date' => now()->toDateString(),
        'body' => 'Created by this staff member.',
        'author_staff_id' => $staff->id,
    ]);
    $otherAnnouncement = Announcement::create([
        'title' => 'Another staff announcement',
        'category' => 'General',
        'posted_by' => 'Student Services',
        'date' => now()->toDateString(),
        'body' => 'Created by another staff member.',
        'author_staff_id' => $otherStaff->id,
    ]);

    $this->actingAs($staff, 'staff')
        ->patch(route('staff.announcements.archive', $ownAnnouncement))
        ->assertRedirect();

    expect($ownAnnouncement->fresh()->status)->toBe('Archived');

    $this->patch(route('staff.announcements.restore', $ownAnnouncement))
        ->assertRedirect();
    expect($ownAnnouncement->fresh()->status)->toBe('Published');

    $this->patch(route('staff.announcements.archive', $otherAnnouncement))
        ->assertForbidden();
    expect($otherAnnouncement->fresh()->status)->toBe('Published');
});

test('staff can publish an urgent announcement for up to three days', function () {
    Notification::fake();
    $staff = StaffUser::create([
        'name' => 'Campus Staff',
        'email' => 'urgent-staff@example.com',
        'password' => 'secret-password',
    ]);

    $this->actingAs($staff, 'staff')
        ->post(route('staff.announcements.store'), [
            'title' => 'Urgent campus update',
            'category' => 'General',
            'posted_by' => 'Student Services',
            'body' => 'Please read this update.',
            'is_urgent' => '1',
            'urgent_days' => '3',
        ])
        ->assertRedirect();

    $announcement = Announcement::query()->where('title', 'Urgent campus update')->firstOrFail();
    expect($announcement->is_urgent)->toBeTrue()
        ->and($announcement->urgent_days)->toBe(3)
        ->and($announcement->urgent_until->isFuture())->toBeTrue();

    $this->actingAs($staff, 'staff')
        ->post(route('staff.announcements.store'), [
            'title' => 'Invalid urgency length',
            'category' => 'General',
            'posted_by' => 'Student Services',
            'body' => 'This should not publish.',
            'is_urgent' => '1',
            'urgent_days' => '4',
        ])
        ->assertSessionHasErrors('urgent_days');
});

test('staff can remind only clients who have not read an active urgent announcement', function () {
    Notification::fake();
    $staff = StaffUser::create([
        'name' => 'Campus Staff',
        'email' => 'urgent-reminder-staff@example.com',
        'password' => 'secret-password',
    ]);
    $unreadClient = User::factory()->create();
    $readClient = User::factory()->create();
    $announcement = Announcement::create([
        'title' => 'Urgent campus update',
        'category' => 'General',
        'posted_by' => 'Student Services',
        'date' => now()->toDateString(),
        'body' => 'Please review this time-sensitive update.',
        'is_urgent' => true,
        'urgent_until' => now()->addDay(),
        'author_staff_id' => $staff->id,
    ]);
    $announcement->readers()->attach($readClient);

    $this->actingAs($staff, 'staff')
        ->post(route('staff.announcements.remind-unread-clients', $announcement))
        ->assertRedirect()
        ->assertSessionHas('status', 'Urgent reminder sent to 1 unread client(s) by in-app notification and email.');

    Notification::assertSentTo($unreadClient, AnnouncementReminder::class, function (AnnouncementReminder $notification) use ($announcement, $unreadClient): bool {
        $mail = $notification->toMail($unreadClient);
        $database = $notification->toDatabase($unreadClient);

        return $notification->announcement->is($announcement)
            && $mail->subject === 'Reminder: Please review urgent announcement - Urgent campus update'
            && $mail->actionText === 'Review urgent announcement'
            && str_contains($mail->introLines[0], 'have not yet opened')
            && $database['type'] === 'urgent'
            && $database['link'] === route('client.announcements.show', $announcement);
    });
    Notification::assertNotSentTo($readClient, AnnouncementReminder::class);
});

test('staff cannot send urgent reminders for another staff member announcement', function () {
    Notification::fake();
    $staff = StaffUser::create([
        'name' => 'Campus Staff',
        'email' => 'urgent-reminder-owner@example.com',
        'password' => 'secret-password',
    ]);
    $otherStaff = StaffUser::create([
        'name' => 'Other Staff',
        'email' => 'urgent-reminder-other@example.com',
        'password' => 'secret-password',
    ]);
    $announcement = Announcement::create([
        'title' => 'Urgent campus update',
        'category' => 'General',
        'posted_by' => 'Student Services',
        'date' => now()->toDateString(),
        'body' => 'Please review this time-sensitive update.',
        'is_urgent' => true,
        'urgent_until' => now()->addDay(),
        'author_staff_id' => $otherStaff->id,
    ]);

    $this->actingAs($staff, 'staff')
        ->post(route('staff.announcements.remind-unread-clients', $announcement))
        ->assertForbidden();

    Notification::assertNothingSent();
});

test('expired urgent announcements are automatically archived', function () {
    $expiredAnnouncement = Announcement::create([
        'title' => 'Expired urgent update',
        'category' => 'General',
        'posted_by' => 'Student Services',
        'date' => now()->toDateString(),
        'body' => 'This update has expired.',
        'is_urgent' => true,
        'urgent_days' => 1,
        'urgent_until' => now()->subSecond(),
    ]);
    $activeAnnouncement = Announcement::create([
        'title' => 'Active urgent update',
        'category' => 'General',
        'posted_by' => 'Student Services',
        'date' => now()->toDateString(),
        'body' => 'This update is still active.',
        'is_urgent' => true,
        'urgent_days' => 2,
        'urgent_until' => now()->addDays(2),
    ]);

    expect(Announcement::archiveExpiredUrgent())->toBe(1)
        ->and($expiredAnnouncement->fresh()->status)->toBe('Archived')
        ->and($activeAnnouncement->fresh()->status)->toBe('Published');
});

test('staff announcement pages render the dedicated staff page with all announcements', function () {
    Notification::fake();
    $staff = StaffUser::create([
        'name' => 'Test One',
        'email' => 'test1@example.com',
        'password' => 'secret-password',
    ]);
    $otherStaff = StaffUser::create([
        'name' => 'Test Two',
        'email' => 'test2@example.com',
        'password' => 'secret-password',
    ]);

    $this->actingAs($staff, 'staff')
        ->post(route('staff.announcements.store'), [
            'title' => 'My announcement',
            'category' => 'General',
            'posted_by' => 'Student Services',
            'body' => 'Created by Test One.',
        ])->assertRedirect();
    $this->post(route('staff.announcements.store'), [
        'title' => 'My event',
        'category' => 'Event',
        'posted_by' => 'Student Services',
        'body' => 'Created by Test One.',
        'event_date' => now()->addDays(3)->toDateString(),
        'location' => 'Main Hall',
    ])->assertRedirect();

    $this->actingAs($otherStaff, 'staff')
        ->post(route('staff.announcements.store'), [
            'title' => 'Other staff event',
            'category' => 'Event',
            'posted_by' => 'Student Services',
            'body' => 'Created by Test Two.',
            'event_date' => now()->addDays(4)->toDateString(),
            'location' => 'Auditorium',
        ])->assertRedirect();

    $otherEvent = Announcement::query()->where('title', 'Other staff event')->firstOrFail();

    $this->actingAs($staff, 'staff')
        ->get(route('staff.announcements.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('staff/staffannouncement')
            ->where('staffName', 'Test One')
            ->where('staffId', $staff->id)
            ->has('announcements', 3)
            ->where('announcements.0.title', 'Other staff event')
            ->where('announcements.0.author_staff_id', $otherStaff->id)
            ->where('announcements.1.title', 'My event')
            ->where('announcements.1.author_staff_id', $staff->id)
            ->where('announcements.2.title', 'My announcement')
            ->where('announcements.2.author_staff_id', $staff->id));

    $this->get(route('staff'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->has('recentAnnouncements', 3)
            ->where('recentAnnouncements.0.title', 'Other staff event')
            ->where('announcementCount', 2)
            ->where('eventCount', 2)
            ->has('upcomingEvents', 2)
            ->where('upcomingEvents.0.title', 'My event')
            ->where('upcomingEvents.1.title', 'Other staff event'));

    $this->get(route('staff.events'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->has('events', 2)
            ->where('events.0.title', 'Other staff event')
            ->where('events.1.title', 'My event'));

    $this->put(route('staff.announcements.update', $otherEvent), [
        'title' => 'Changed by Test One',
        'category' => 'Event',
        'posted_by' => 'Student Services',
        'body' => 'Attempted unauthorized update.',
        'event_date' => now()->addDays(4)->toDateString(),
        'location' => 'Auditorium',
    ])->assertForbidden();

    $this->delete(route('staff.announcements.destroy', $otherEvent))
        ->assertForbidden();
    $this->assertDatabaseHas('announcement', ['id' => $otherEvent->id]);
});

test('staff can save an incomplete announcement as a private draft', function () {
    Notification::fake();
    $staff = StaffUser::create([
        'name' => 'Drafting Staff',
        'email' => 'drafting-staff@example.com',
        'password' => 'secret-password',
    ]);
    $client = User::factory()->create();

    $this->actingAs($staff, 'staff')
        ->post(route('staff.announcements.store'), [
            'status' => 'Draft',
            'title' => '',
            'category' => '',
            'posted_by' => '',
            'body' => '',
        ])
        ->assertRedirect();

    $draft = Announcement::query()->where('title', 'Untitled draft')->firstOrFail();
    expect($draft->status)->toBe('Draft')
        ->and($draft->author_staff_id)->toBe($staff->id);
    Notification::assertNothingSent();

    $this->get(route('staff.announcements.index'))
        ->assertInertia(fn ($page) => $page
            ->where('announcements.0.status', 'Draft')
            ->where('announcements.0.title', 'Untitled draft'));

    $this->actingAs($client, 'web')
        ->get(route('client.clientpage'))
        ->assertInertia(fn ($page) => $page->has('announcements', 0));

    $this->get(route('client.announcements.show', $draft))
        ->assertNotFound();

    $this->post(route('client.announcements.messages.store', $draft), ['content' => 'A reply to a draft.'])
        ->assertNotFound();

    $this->actingAs($staff, 'staff')
        ->put(route('staff.announcements.update', $draft), [
            'status' => 'Published',
            'title' => 'Published from draft',
            'category' => 'General',
            'posted_by' => 'Drafting Staff',
            'body' => 'This announcement is now public.',
        ])
        ->assertRedirect();

    expect($draft->fresh()->status)->toBe('Published');
    expect($draft->fresh()->date->toDateString())->toBe(now()->toDateString());
    Notification::assertSentTo($client, AnnouncementPublished::class);

    $this->actingAs($client, 'web')
        ->get(route('client.clientpage'))
        ->assertInertia(fn ($page) => $page
            ->where('announcements.0.title', 'Published from draft'));
});

test('staff can reply to announcement discussions using the staff identity', function () {
    $client = User::factory()->create();
    $staff = StaffUser::create([
        'name' => 'Campus Staff',
        'email' => 'staff@example.com',
        'password' => 'secret-password',
    ]);
    $announcement = Announcement::create([
        'title' => 'Discussion announcement',
        'category' => 'General',
        'posted_by' => 'Student Services',
        'date' => now()->toDateString(),
        'body' => 'Discuss this update.',
    ]);
    $conversation = Conversation::create([
        'type' => 'announcement',
        'name' => $announcement->title,
        'announcement_id' => $announcement->id,
        'client_id' => null,
    ]);

    $this->actingAs($staff, 'staff')
        ->post(route('staff.announcements.comments.store', $announcement), [
            'content' => 'Staff reply',
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('messages', [
        'conversation_id' => $conversation->id,
        'sender_staff_id' => $staff->id,
        'sender_admin_id' => null,
        'content' => 'Staff reply',
    ]);

    $this->actingAs($client, 'web')
        ->get(route('client.announcements.show', $announcement))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('messages.0.author', 'Campus Staff')
            ->where('messages.0.role', 'Staff'));
});

test('admins can upload downloadable documents and manage them when editing announcements', function () {
    Storage::fake('public');
    $admin = AdminUser::create([
        'name' => 'Site Admin',
        'email' => 'admin@example.com',
        'password' => 'secret-password',
    ]);

    $this->actingAs($admin, 'admin')
        ->post(route('admin.announcements.store'), [
            'title' => 'Document announcement',
            'category' => 'General',
            'posted_by' => 'Office of the Registrar',
            'body' => 'Review the attached documents.',
            'attachments' => [
                UploadedFile::fake()->create('schedule.pdf', 20, 'application/pdf'),
                UploadedFile::fake()->create('guide.docx', 30, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'),
            ],
        ])
        ->assertRedirect();

    $announcement = Announcement::query()->firstOrFail();
    $originalAttachments = $announcement->attachments;
    expect($originalAttachments)->toHaveCount(2);
    foreach ($originalAttachments as $attachment) {
        Storage::disk('public')->assertExists($attachment['path']);
    }

    $this->actingAs(User::factory()->create(), 'web')
        ->get(route('client.announcements.show', $announcement))
        ->assertInertia(fn ($page) => $page
            ->where('announcement.attachments.0.name', 'schedule.pdf')
            ->where('announcement.attachments.0.url', '/storage/'.$originalAttachments[0]['path']));

    $this->actingAs($admin, 'admin')
        ->post(route('admin.announcements.update', $announcement), [
            '_method' => 'put',
            'title' => 'Document announcement',
            'category' => 'General',
            'posted_by' => 'Office of the Registrar',
            'body' => 'Review the attached documents.',
            'remove_attachments' => [$originalAttachments[0]['path']],
            'attachments' => [
                UploadedFile::fake()->create('updated-notes.txt', 5, 'text/plain'),
            ],
        ])
        ->assertRedirect();

    $announcement->refresh();
    expect(array_column($announcement->attachments, 'name'))
        ->toBe(['guide.docx', 'updated-notes.txt']);
    Storage::disk('public')->assertMissing($originalAttachments[0]['path']);
    Storage::disk('public')->assertExists($originalAttachments[1]['path']);
    Storage::disk('public')->assertExists($announcement->attachments[1]['path']);
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

test('an admin can archive an announcement', function () {
    $admin = AdminUser::create([
        'name' => 'Site Admin',
        'email' => 'admin@example.com',
        'password' => 'secret-password',
    ]);
    $announcement = Announcement::create([
        'title' => 'Campus closure',
        'category' => 'General',
        'posted_by' => 'Office of the Registrar',
        'date' => now()->toDateString(),
        'body' => 'The campus will be closed tomorrow.',
    ]);

    $this->actingAs($admin, 'admin')
        ->patch(route('admin.announcements.archive', $announcement))
        ->assertRedirect();

    expect($announcement->fresh()->status)->toBe('Archived');
});

test('an admin can remove an announcement from the archive', function () {
    $admin = AdminUser::create([
        'name' => 'Site Admin',
        'email' => 'admin@example.com',
        'password' => 'secret-password',
    ]);
    $announcement = Announcement::create([
        'title' => 'Campus closure',
        'category' => 'General',
        'posted_by' => 'Office of the Registrar',
        'date' => now()->toDateString(),
        'body' => 'The campus will be closed tomorrow.',
        'status' => 'Archived',
    ]);

    $this->actingAs($admin, 'admin')
        ->patch(route('admin.announcements.restore', $announcement))
        ->assertRedirect();

    expect($announcement->fresh()->status)->toBe('Published');
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
            ->where('eventCount', 2)
            ->where('activeStudentCount', 0)
            ->missing('upcomingEvents.1'));
});

test('the admin dashboard compares published announcements with the previous month', function () {
    $this->travelTo(now()->startOfMonth()->addDays(10));
    $admin = AdminUser::create([
        'name' => 'Site Admin',
        'email' => 'admin@example.com',
        'password' => 'secret-password',
    ]);

    $createAnnouncement = function (string $title, string $status, string $date): void {
        Announcement::create([
            'title' => $title,
            'category' => 'General',
            'posted_by' => 'Registrar',
            'date' => $date,
            'body' => 'Announcement body.',
            'status' => $status,
        ]);
    };

    $createAnnouncement('Published this month 1', 'Published', now()->toDateString());
    $createAnnouncement('Published this month 2', 'Published', now()->toDateString());
    $createAnnouncement('Published last month 1', 'Published', now()->subMonth()->toDateString());
    $createAnnouncement('Published last month 2', 'Published', now()->subMonth()->toDateString());
    $createAnnouncement('Published last month 3', 'Published', now()->subMonth()->toDateString());
    $createAnnouncement('Draft this month', 'Draft', now()->toDateString());
    $createAnnouncement('Archived this month', 'Archived', now()->toDateString());

    $this->actingAs($admin, 'admin')
        ->get(route('admin'))
        ->assertInertia(fn ($page) => $page
            ->component('admin/admin')
            ->where('publishedThisMonthCount', 2)
            ->where('publishedChangeFromLastMonth', -1));
});

test('the admin dashboard counts currently logged-in students only', function () {
    $admin = AdminUser::create([
        'name' => 'Site Admin',
        'email' => 'admin@example.com',
        'password' => 'secret-password',
    ]);
    $activeStudent = User::factory()->create();
    $staleStudent = User::factory()->create();
    $webGuardKey = Auth::guard('web')->getName();
    $adminGuardKey = Auth::guard('admin')->getName();

    DB::table('sessions')->insert([
        [
            'id' => 'active-student',
            'user_id' => $activeStudent->id,
            'payload' => base64_encode(json_encode([$webGuardKey => $activeStudent->id])),
            'last_activity' => now()->timestamp,
        ],
        [
            'id' => 'stale-student',
            'user_id' => $staleStudent->id,
            'payload' => base64_encode(json_encode([$webGuardKey => $staleStudent->id])),
            'last_activity' => now()->subMinutes(config('session.lifetime') + 1)->timestamp,
        ],
        [
            'id' => 'admin-session',
            'user_id' => $activeStudent->id,
            'payload' => base64_encode(json_encode([$adminGuardKey => $admin->id])),
            'last_activity' => now()->timestamp,
        ],
    ]);

    $this->actingAs($admin, 'admin')
        ->get(route('admin'))
        ->assertInertia(fn ($page) => $page
            ->component('admin/admin')
            ->where('activeStudentCount', 1));
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

test('an admin can publish a multi-day event with an inclusive end date', function () {
    Notification::fake();
    $admin = AdminUser::create([
        'name' => 'Site Admin',
        'email' => 'admin@example.com',
        'password' => 'secret-password',
    ]);
    $startDate = now()->addDays(3)->toDateString();
    $endDate = now()->addDays(5)->toDateString();

    $this->actingAs($admin, 'admin')
        ->post(route('admin.announcements.store'), [
            'title' => 'Campus festival',
            'category' => 'Event',
            'posted_by' => 'Student Affairs',
            'body' => 'A three-day campus festival.',
            'event_date' => $startDate,
            'event_end_date' => $endDate,
            'start_time' => '09:00',
            'end_time' => '17:00',
            'location' => 'Main courtyard',
        ])
        ->assertRedirect();

    $event = Announcement::query()->firstOrFail();
    expect($event->event_date->toDateString())->toBe($startDate)
        ->and($event->event_end_date->toDateString())->toBe($endDate);

    $otherAdmin = AdminUser::create([
        'name' => 'Other Admin',
        'email' => 'other-admin@example.com',
        'password' => 'secret-password',
    ]);

    $this->actingAs($otherAdmin, 'admin')
        ->post(route('admin.announcements.store'), [
            'title' => 'Another event',
            'category' => 'Event',
            'posted_by' => 'Student Affairs',
            'body' => 'Created by another account.',
            'event_date' => now()->addDays(1)->toDateString(),
            'location' => 'Main Hall',
        ])
        ->assertRedirect();

    $this->actingAs($admin, 'admin')
        ->get(route('admin.events'))
        ->assertInertia(fn ($page) => $page
            ->component('admin/adminEvent')
            ->where('events.0.date', $startDate)
            ->where('events.0.end_date', $endDate)
            ->where('events.0.is_mine', true)
            ->where('events.1.is_mine', false));
});

test('an event end date cannot be earlier than its start date', function () {
    $admin = AdminUser::create([
        'name' => 'Site Admin',
        'email' => 'admin@example.com',
        'password' => 'secret-password',
    ]);

    $this->actingAs($admin, 'admin')
        ->from(route('admin.events'))
        ->post(route('admin.announcements.store'), [
            'title' => 'Invalid event range',
            'category' => 'Event',
            'posted_by' => 'Student Affairs',
            'body' => 'This date range is invalid.',
            'event_date' => now()->addDays(5)->toDateString(),
            'event_end_date' => now()->addDays(3)->toDateString(),
            'location' => 'Main courtyard',
        ])
        ->assertSessionHasErrors('event_end_date');

    expect(Announcement::query()->count())->toBe(0);
});
