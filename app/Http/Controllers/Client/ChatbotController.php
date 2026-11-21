<?php

namespace App\Http\Controllers\Client;

use App\Ai\Agents\CotifyAssistant;
use App\Http\Controllers\Controller;
use Illuminate\Http\Client\RequestException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule;
use Laravel\Ai\Enums\Lab;
use Laravel\Ai\Exceptions\AiException;
use Laravel\Ai\Exceptions\InsufficientCreditsException;
use Laravel\Ai\Exceptions\InvalidApiKeyException;
use Laravel\Ai\Exceptions\ProviderConnectionException;
use Laravel\Ai\Exceptions\ProviderOverloadedException;
use Laravel\Ai\Exceptions\RateLimitedException;
use Laravel\Ai\Messages\Message;

class ChatbotController extends Controller
{
    public function __invoke(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'messages' => ['required', 'array', 'min:1', 'max:12'],
            'messages.*.role' => ['required', Rule::in(['user', 'assistant'])],
            'messages.*.content' => ['required', 'string', 'max:2000'],
        ]);

        $lastMessage = $validated['messages'][array_key_last($validated['messages'])];
        if ($lastMessage['role'] !== 'user') {
            return response()->json(['message' => 'Send a message to continue.'], 422);
        }

        $apiKey = config('ai.providers.groq.key');
        if (! is_string($apiKey) || $apiKey === '') {
            Log::error('Groq chatbot is unavailable because GROQ_API_KEY is not configured.');

            return response()->json(['message' => 'The chat service is not configured yet.'], 503);
        }

        try {
            $history = array_slice($validated['messages'], 0, -1);
            $messages = array_map(
                fn (array $message): Message => new Message($message['role'], $message['content']),
                $history,
            );
            $lastMessage = $validated['messages'][array_key_last($validated['messages'])];

            $response = (new CotifyAssistant)
                ->withMessages($messages)
                ->prompt(
                    $lastMessage['content'],
                    provider: Lab::Groq,
                    model: config('ai.providers.groq.models.text.default'),
                    timeout: 30,
                );

            $reply = trim($response->text);
            if ($reply === '') {
                Log::error('Laravel AI returned an empty Cotify chatbot response.');

                return response()->json(['message' => 'The chat service returned an invalid response. Please try again.'], 502);
            }

            return response()->json(['reply' => $reply]);
        } catch (InvalidApiKeyException $exception) {
            Log::error('Groq rejected the chatbot API key.', ['message' => $exception->getMessage()]);

            return response()->json(['message' => 'Groq rejected the API key. Check GROQ_API_KEY in your .env file.'], 503);
        } catch (InsufficientCreditsException $exception) {
            Log::error('Groq chatbot account has insufficient credits.', ['message' => $exception->getMessage()]);

            return response()->json(['message' => 'The Groq account cannot currently process requests.'], 503);
        } catch (RateLimitedException $exception) {
            Log::warning('Groq rate-limited a chatbot request.', ['message' => $exception->getMessage()]);

            return response()->json(['message' => 'Groq is receiving too many requests. Please try again shortly.'], 429);
        } catch (ProviderConnectionException|ProviderOverloadedException $exception) {
            Log::error('Groq chatbot provider is unavailable.', [
                'exception' => $exception::class,
                'message' => $exception->getMessage(),
            ]);

            return response()->json(['message' => 'Groq is temporarily unavailable. Please try again shortly.'], 503);
        } catch (RequestException $exception) {
            Log::error('Groq chatbot request could not be completed.', [
                'message' => $exception->getMessage(),
                'status' => $exception->response?->status(),
            ]);

            return response()->json(['message' => 'Groq rejected the request. Check the configured model and API settings.'], 502);
        } catch (AiException $exception) {
            Log::error('Laravel AI failed to generate a Cotify chatbot response.', [
                'exception' => $exception::class,
                'message' => $exception->getMessage(),
            ]);

            return response()->json(['message' => 'The chat service could not complete this request. Please try again.'], 502);
        }
    }
}
