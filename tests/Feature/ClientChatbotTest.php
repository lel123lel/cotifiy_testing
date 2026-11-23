<?php

use App\Models\Announcement;
use App\Models\User;
use Illuminate\Http\Client\Request;
use Illuminate\Support\Facades\Http;

test('authenticated clients can receive a reply from Groq', function () {
    config([
        'ai.providers.groq.key' => 'test-groq-key',
        'ai.providers.groq.models.text.default' => 'test-model',
    ]);
    Http::fake([
        'https://api.groq.com/openai/v1/chat/completions' => Http::response([
            'id' => 'chatcmpl-test',
            'object' => 'chat.completion',
            'created' => 1,
            'model' => 'test-model',
            'choices' => [[
                'index' => 0,
                'message' => ['role' => 'assistant', 'content' => 'You can find announcements on the Announcements page.'],
                'finish_reason' => 'stop',
            ]],
            'usage' => ['prompt_tokens' => 20, 'completion_tokens' => 10, 'total_tokens' => 30],
        ]),
    ]);
    $user = User::factory()->create();

    $this->actingAs($user, 'web')
        ->postJson(route('client.chat'), [
            'messages' => [
                ['role' => 'user', 'content' => 'Where are announcements?'],
            ],
        ])
        ->assertOk()
        ->assertExactJson(['reply' => 'You can find announcements on the Announcements page.']);

    Http::assertSent(fn (Request $request) => $request->url() === 'https://api.groq.com/openai/v1/chat/completions'
        && $request->hasHeader('Authorization', 'Bearer test-groq-key')
        && $request['model'] === 'test-model'
        && $request['messages'][0]['role'] === 'system'
        && $request['tools'][0]['function']['name'] === 'AnnouncementLookup'
        && $request['messages'][1]['content'] === 'Where are announcements?');
});

test('the chatbot looks up only published announcements visible to the client', function () {
    config(['ai.providers.groq.key' => 'test-groq-key']);

    $groq = Http::sequence()
        ->push([
            'id' => 'chatcmpl-tool',
            'model' => 'test-model',
            'choices' => [[
                'message' => [
                    'role' => 'assistant',
                    'tool_calls' => [[
                        'id' => 'call_announcement_lookup',
                        'type' => 'function',
                        'function' => [
                            'name' => 'AnnouncementLookup',
                            'arguments' => '{"query":"enrollment"}',
                        ],
                    ]],
                ],
                'finish_reason' => 'tool_calls',
            ]],
            'usage' => ['prompt_tokens' => 20, 'completion_tokens' => 10],
        ])
        ->push([
            'id' => 'chatcmpl-answer',
            'model' => 'test-model',
            'choices' => [[
                'message' => [
                    'role' => 'assistant',
                    'content' => 'The enrollment announcement lists registration dates.',
                ],
                'finish_reason' => 'stop',
            ]],
            'usage' => ['prompt_tokens' => 40, 'completion_tokens' => 10],
        ]);
    Http::fake(['https://api.groq.com/openai/v1/chat/completions' => $groq]);

    Announcement::create([
        'title' => 'Enrollment registration dates',
        'category' => 'Academic',
        'posted_by' => 'Registrar',
        'date' => now()->toDateString(),
        'body' => 'Registration dates are September 1 to 5.',
    ]);
    Announcement::create([
        'title' => 'Enrollment for Technology students',
        'category' => 'Academic',
        'posted_by' => 'Technology',
        'target_department' => 'College of Technology',
        'date' => now()->toDateString(),
        'body' => 'Technology enrollment details.',
    ]);
    Announcement::create([
        'title' => 'Enrollment for Engineering students',
        'category' => 'Academic',
        'posted_by' => 'Engineering',
        'target_department' => 'College of Engineering',
        'date' => now()->toDateString(),
        'body' => 'This is not visible to a Technology student.',
    ]);
    Announcement::create([
        'title' => 'Draft enrollment announcement',
        'category' => 'Academic',
        'posted_by' => 'Registrar',
        'status' => 'Draft',
        'date' => now()->toDateString(),
        'body' => 'This draft must not be shown.',
    ]);

    $user = User::factory()->create(['course' => 'BSIT']);

    $this->actingAs($user, 'web')
        ->postJson(route('client.chat'), [
            'messages' => [
                ['role' => 'user', 'content' => 'Is there an enrollment announcement?'],
            ],
        ])
        ->assertOk()
        ->assertJsonPath('reply', 'The enrollment announcement lists registration dates.');

    Http::assertSent(fn (Request $request) => collect($request['messages'] ?? [])
        ->contains(fn (array $message): bool => ($message['role'] ?? null) === 'tool'
            && str_contains($message['content'], 'Enrollment registration dates')
            && str_contains($message['content'], 'Enrollment for Technology students')
            && ! str_contains($message['content'], 'Enrollment for Engineering students')
            && ! str_contains($message['content'], 'Draft enrollment announcement')));
});

test('the chatbot rejects malformed conversation history', function () {
    config(['ai.providers.groq.key' => 'test-groq-key']);
    Http::fake();
    $user = User::factory()->create();

    $this->actingAs($user, 'web')
        ->postJson(route('client.chat'), [
            'messages' => [
                ['role' => 'assistant', 'content' => 'A reply without a user message'],
            ],
        ])
        ->assertUnprocessable();

    Http::assertNothingSent();
});

test('the chatbot reports when Groq is not configured', function () {
    config(['ai.providers.groq.key' => null]);
    Http::fake();
    $user = User::factory()->create();

    $this->actingAs($user, 'web')
        ->postJson(route('client.chat'), [
            'messages' => [['role' => 'user', 'content' => 'Hello']],
        ])
        ->assertServiceUnavailable()
        ->assertJsonPath('message', 'The chat service is not configured yet.');

    Http::assertNothingSent();
});

test('the chatbot explains when Groq rejects the configured request', function () {
    config(['ai.providers.groq.key' => 'test-groq-key']);
    Http::fake([
        'https://api.groq.com/openai/v1/chat/completions' => Http::response([
            'error' => ['message' => 'The selected model is unavailable.'],
        ], 400),
    ]);
    $user = User::factory()->create();

    $this->actingAs($user, 'web')
        ->postJson(route('client.chat'), [
            'messages' => [['role' => 'user', 'content' => 'Hello']],
        ])
        ->assertStatus(502)
        ->assertJsonPath('message', 'Groq rejected the request. Check the configured model and API settings.');
});

test('the chatbot is available only to authenticated clients', function () {
    $this->postJson(route('client.chat'), [
        'messages' => [['role' => 'user', 'content' => 'Hello']],
    ])->assertUnauthorized();
});
