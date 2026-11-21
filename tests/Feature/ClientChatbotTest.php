<?php

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
        && $request['messages'][1]['content'] === 'Where are announcements?');
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
