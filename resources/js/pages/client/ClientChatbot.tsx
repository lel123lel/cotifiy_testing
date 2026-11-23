import { FormEvent, Fragment, useEffect, useRef, useState } from 'react';

interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
}

interface ChatResponse {
    reply?: unknown;
    message?: unknown;
}

function formatMessage(content: string) {
    const parts = content.split(/(\*\*[^*\n]+\*\*|__[^_\n]+__|~~[^~\n]+~~|<u>[^<\n]+<\/u>|\+\+[^+\n]+\+\+|\*[^*\n]+\*|_[^_\n]+_)/g);

    return parts.map((part, index) => {
        if (part.startsWith('**') && part.endsWith('**') || part.startsWith('__') && part.endsWith('__')) {
            return <strong key={index}>{part.slice(2, -2)}</strong>;
        }

        if (part.startsWith('*') && part.endsWith('*') || part.startsWith('_') && part.endsWith('_')) {
            return <em key={index}>{part.slice(1, -1)}</em>;
        }

        if (part.startsWith('<u>') && part.endsWith('</u>')) {
            return <u key={index}>{part.slice(3, -4)}</u>;
        }

        if (part.startsWith('++') && part.endsWith('++')) {
            return <u key={index}>{part.slice(2, -2)}</u>;
        }

        if (part.startsWith('~~') && part.endsWith('~~')) {
            return <del key={index}>{part.slice(2, -2)}</del>;
        }

        return <Fragment key={index}>{part}</Fragment>;
    });
}

export default function ClientChatbot({ announcementTitle }: { announcementTitle?: string }) {
    const [isOpen, setIsOpen] = useState(Boolean(announcementTitle));
    const [input, setInput] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [error, setError] = useState('');
    const [messages, setMessages] = useState<ChatMessage[]>(() => [
        {
            role: 'assistant',
            content: announcementTitle
                ? `You're viewing “${announcementTitle}.” If you have any questions about this announcement, feel free to ask.`
                : 'Hi! I’m Cotify Assistant. How can I help you with the student portal?',
        },
    ]);
    const messageListRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!announcementTitle) return;

        setIsOpen(true);
        setMessages([{
            role: 'assistant',
            content: `You're viewing “${announcementTitle}.” If you have any questions about this announcement, feel free to ask.`,
        }]);
        setError('');

        const closeTimer = window.setTimeout(() => setIsOpen(false), 5000);
        return () => window.clearTimeout(closeTimer);
    }, [announcementTitle]);

    useEffect(() => {
        messageListRef.current?.scrollTo({
            top: messageListRef.current.scrollHeight,
            behavior: 'smooth',
        });
    }, [isOpen, isSending, messages]);

    async function sendMessage(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const content = input.trim();
        if (!content || isSending) return;

        const nextMessages = [...messages, { role: 'user' as const, content }];
        setMessages(nextMessages);
        setInput('');
        setError('');
        setIsSending(true);

        try {
            const csrfToken = document.querySelector<HTMLMetaElement>(
                'meta[name="csrf-token"]',
            )?.content;
            const response = await fetch('/client/chat', {
                method: 'POST',
                credentials: 'same-origin',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    ...(csrfToken ? { 'X-CSRF-TOKEN': csrfToken } : {}),
                },
                body: JSON.stringify({ messages: nextMessages.slice(-12) }),
            });
            const result = (await response.json()) as ChatResponse;

            if (!response.ok) {
                setError(
                    typeof result.message === 'string'
                        ? result.message
                        : 'Could not send your message. Please try again.',
                );
                return;
            }

            if (typeof result.reply !== 'string' || !result.reply.trim()) {
                setError('The chat service returned an invalid response. Please try again.');
                return;
            }

            setMessages([...nextMessages, { role: 'assistant', content: result.reply }]);
        } catch {
            setError('Could not connect to the chat service. Please try again.');
        } finally {
            setIsSending(false);
        }
    }

    return (
        <div className="fixed right-4 bottom-4 z-[110] sm:right-6 sm:bottom-6">
            {isOpen && (
                <section
                    aria-label="Cotify Assistant chat"
                    className="mb-3 flex h-[min(34rem,calc(100dvh-7rem))] w-[min(23rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
                >
                    <header className="flex items-center justify-between bg-slate-900 px-4 py-3 text-white">
                        <div className="flex items-center gap-3">
                            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500">
                                <i className="fa-solid fa-comments" aria-hidden="true" />
                            </span>
                            <div>
                                <h2 className="font-bold">Cotify Assistant</h2>
                                <p className="text-xs text-slate-300">Here to help</p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={() => setIsOpen(false)}
                            aria-label="Close chat"
                            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-200 transition hover:bg-white/10 hover:text-white"
                        >
                            <i className="fa-solid fa-xmark" aria-hidden="true" />
                        </button>
                    </header>

                    <div
                        ref={messageListRef}
                        aria-live="polite"
                        className="flex-1 space-y-3 overflow-y-auto bg-slate-50 p-4"
                    >
                        {messages.map((message, index) => (
                            <div
                                key={`${index}-${message.role}`}
                                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <p
                                    className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                                        message.role === 'user'
                                            ? 'rounded-br-md bg-blue-600 text-white'
                                            : 'rounded-bl-md border border-slate-200 bg-white text-slate-700'
                                    }`}
                                >
                                    {formatMessage(message.content)}
                                </p>
                            </div>
                        ))}
                        {isSending && (
                            <p className="text-sm text-slate-500" role="status">
                                Cotify Assistant is typing…
                            </p>
                        )}
                    </div>

                    <form onSubmit={sendMessage} className="border-t border-slate-200 bg-white p-3">
                        {error && (
                            <p role="alert" className="mb-2 text-sm text-red-600">
                                {error}
                            </p>
                        )}
                        <div className="flex items-end gap-2">
                            <label htmlFor="cotify-chat-message" className="sr-only">
                                Type your message
                            </label>
                            <textarea
                                id="cotify-chat-message"
                                value={input}
                                onChange={(event) => setInput(event.target.value)}
                                onKeyDown={(event) => {
                                    if (event.key === 'Enter' && !event.shiftKey) {
                                        event.preventDefault();
                                        event.currentTarget.form?.requestSubmit();
                                    }
                                }}
                                maxLength={2000}
                                rows={1}
                                placeholder="Ask a question…"
                                className="max-h-24 min-h-11 flex-1 resize-y rounded-xl border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            />
                            <button
                                type="submit"
                                disabled={isSending || !input.trim()}
                                aria-label="Send message"
                                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <i className="fa-solid fa-paper-plane" aria-hidden="true" />
                            </button>
                        </div>
                    </form>
                </section>
            )}

            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                aria-expanded={isOpen}
                aria-label={isOpen ? 'Close Cotify Assistant' : 'Open Cotify Assistant'}
                className="ml-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white shadow-xl transition hover:scale-105 hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-200"
            >
                <i className={`fa-solid ${isOpen ? 'fa-xmark' : 'fa-comment-dots'} text-xl`} aria-hidden="true" />
            </button>
        </div>
    );
}
