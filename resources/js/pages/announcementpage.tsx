import { Head, useForm } from '@inertiajs/react';
import { useState } from 'react';

export type Announcement = {
    id: number;
    title: string;
    category: string;
    posted_by: string;
    date: string;
    body: string;
    image_url: string | null;
    event_date: string | null;
    start_time: string | null;
    end_time: string | null;
    location: string | null;
};

type AnnouncementPageProps = {
    announcement?: Announcement;
    discussions?: Discussion[];
    onClose?: () => void;
};

type DiscussionMessage = {
    id: number;
    parent_message_id: number | null;
    author: string;
    role: 'Client' | 'Admin';
    content: string;
    sent_at: string | null;
};

type Discussion = {
    id: number;
    client_name: string;
    messages: DiscussionMessage[];
};

const formatDate = (date: string) =>
    new Date(`${date}T00:00:00`).toLocaleDateString(undefined, {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
    });

const formatTime = (time: string | null) => {
    if (!time) {
        return undefined;
    }

    const [hourText, minuteText] = time.split(':');
    const hour = Number(hourText);

    if (
        !/^\d{2}$/.test(hourText) ||
        !/^\d{2}$/.test(minuteText ?? '') ||
        hour > 23 ||
        Number(minuteText) > 59
    ) {
        return time.slice(0, 5);
    }

    return `${hour % 12 || 12}:${minuteText} ${hour < 12 ? 'AM' : 'PM'}`;
};

export default function AnnouncementPage({
    announcement,
    discussions = [],
    onClose,
}: AnnouncementPageProps) {
    const isModal = Boolean(onClose);
    const [failedImageUrl, setFailedImageUrl] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'announcement' | 'comments'>(
        'announcement',
    );
    const commentCount = discussions.reduce(
        (count, discussion) =>
            count + discussion.messages.filter((message) => message.role === 'Client').length,
        0,
    );

    if (!announcement) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 text-center">
                <div>
                    {!isModal && <Head title="Announcement Page" />}
                    <h1 className="text-xl font-bold text-slate-800">
                        No announcement selected
                    </h1>
                    <p className="mt-2 text-sm text-slate-500">
                        Choose an announcement to view its details.
                    </p>
                </div>
            </div>
        );
    }

    const eventTime = [
        announcement.start_time && announcement.end_time
            ? `${formatTime(announcement.start_time)} - ${formatTime(announcement.end_time)}`
            : formatTime(announcement.start_time),
    ].filter(Boolean);
    const hasModalImage = isModal && Boolean(announcement.image_url);
    const announcementImage = announcement.image_url ? (
        failedImageUrl === announcement.image_url ? (
            <div
                className={
                    isModal
                        ? 'flex h-64 items-center justify-center bg-slate-100 md:h-full md:min-h-[19rem]'
                        : undefined
                }
            >
                <ImageFallback />
            </div>
        ) : (
            <img
                src={announcement.image_url}
                alt=""
                className={
                    isModal
                        ? 'h-64 w-full bg-slate-100 object-cover md:h-full md:min-h-[19rem]'
                        : 'max-h-80 w-full bg-slate-100 object-cover'
                }
                onError={() => setFailedImageUrl(announcement.image_url)}
            />
        )
    ) : null;
    const announcementHeading = (
        <>
            <span className="mb-3 inline-block self-start rounded-full bg-blue-100 px-3 py-1 text-xs font-bold tracking-wider text-blue-700 uppercase">
                {announcement.category}
            </span>
            <h1
                id="announcement-detail-title"
                className={`mb-5 pr-10 leading-tight font-extrabold text-slate-900 ${
                    isModal
                        ? 'text-3xl sm:text-4xl lg:text-5xl'
                        : 'text-2xl sm:text-3xl'
                }`}
            >
                {announcement.title}
            </h1>
            <div className="flex flex-wrap gap-x-6 gap-y-3 border-y border-slate-100 py-5 text-sm text-slate-500">
                <span className="flex items-center gap-2">
                    <i
                        className="fa-regular fa-calendar text-ctu-lightblue"
                        aria-hidden="true"
                    ></i>
                    {formatDate(announcement.date)}
                </span>
                <span className="flex items-center gap-2">
                    <i
                        className="fa-regular fa-user text-ctu-lightblue"
                        aria-hidden="true"
                    ></i>
                    By {announcement.posted_by}
                </span>
            </div>
            {announcement.category === 'Event' && (
                <section
                    className={`mb-5 rounded-2xl ${
                        isModal ? 'p-6 sm:p-8' : 'p-5'
                    }`}
                    aria-labelledby="event-details-title"
                >
                    <h2
                        id="event-details-title"
                        className="mb-4 text-lg font-bold text-slate-900"
                    >
                        Event Details
                    </h2>
                    <dl className="grid gap-4 text-sm text-slate-700 sm:grid-cols-2">
                        {announcement.event_date && (
                            <div>
                                <dt className="inline font-semibold text-slate-900">
                                    Date:{' '}
                                </dt>
                                <dd className="inline">
                                    {formatDate(announcement.event_date)}
                                </dd>
                            </div>
                        )}
                        {eventTime.length > 0 && (
                            <div>
                                <dt className="inline font-semibold text-slate-900">
                                    Time:{' '}
                                </dt>
                                <dd className="inline">
                                    {eventTime.join('')}
                                </dd>
                            </div>
                        )}
                        {announcement.location && (
                            <div>
                                <dt className="inline font-semibold text-slate-900">
                                    Location:{' '}
                                </dt>
                                <dd className="inline">
                                    {announcement.location}
                                </dd>
                            </div>
                        )}
                    </dl>
                </section>
            )}
        </>
    );

    return (
        <div
            className={
                isModal
                    ? 'fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4'
                    : 'min-h-screen bg-slate-50 px-4 py-10'
            }
            role={isModal ? 'dialog' : undefined}
            aria-modal={isModal || undefined}
            aria-labelledby="announcement-detail-title"
            onClick={isModal ? onClose : undefined}
        >
            {!isModal && <Head title={announcement.title} />}
            <article
                className={`relative w-full overflow-y-auto ${
                    isModal
                        ? 'h-[95vh] max-h-[95vh] max-w-6xl rounded-3xl bg-slate-50 p-4 shadow-2xl sm:p-6'
                        : 'max-h-[90vh] max-w-3xl rounded-2xl border border-slate-200 bg-white shadow-2xl'
                }`}
                onClick={
                    isModal ? (event) => event.stopPropagation() : undefined
                }
            >
                {isModal && (
                    <nav className="sticky top-0 z-10 -mx-4 -mt-4 mb-5 flex items-center justify-between border-b border-slate-200 bg-slate-50/95 px-4 backdrop-blur sm:-mx-6 sm:-mt-6 sm:px-6">
                        <div
                            className="flex gap-1"
                            role="tablist"
                            aria-label="Announcement sections"
                        >
                            <button
                                type="button"
                                id="announcement-tab"
                                role="tab"
                                aria-selected={activeTab === 'announcement'}
                                aria-controls="announcement-tab-panel"
                                onClick={() => setActiveTab('announcement')}
                                className={`border-b-2 px-4 py-4 text-sm font-semibold transition-colors ${
                                    activeTab === 'announcement'
                                        ? 'border-ctu-lightblue text-ctu-lightblue'
                                        : 'border-transparent text-slate-500 hover:text-slate-800'
                                }`}
                            >
                                Announcement
                            </button>
                            <button
                                type="button"
                                id="comments-tab"
                                role="tab"
                                aria-selected={activeTab === 'comments'}
                                aria-controls="comments-tab-panel"
                                onClick={() => setActiveTab('comments')}
                                className={`border-b-2 px-4 py-4 text-sm font-semibold transition-colors ${
                                    activeTab === 'comments'
                                        ? 'border-ctu-lightblue text-ctu-lightblue'
                                        : 'border-transparent text-slate-500 hover:text-slate-800'
                                }`}
                            >
                                <span className="flex items-center gap-2">
                                    Comments
                                    <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[10px] text-slate-600">
                                        {commentCount}
                                    </span>
                                </span>
                            </button>
                        </div>
                        <button
                            type="button"
                            onClick={onClose}
                            aria-label="Close announcement"
                            className="flex h-9 w-9 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-slate-200 hover:text-slate-800"
                        >
                            <i
                                className="fa-solid fa-times"
                                aria-hidden="true"
                            ></i>
                        </button>
                    </nav>
                )}

                {(!isModal || activeTab === 'announcement') && (
                    <div
                        id={isModal ? 'announcement-tab-panel' : undefined}
                        role={isModal ? 'tabpanel' : undefined}
                        aria-labelledby={isModal ? 'announcement-tab' : undefined}
                    >
                        {hasModalImage && (
                            <div className="mb-6 grid overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm md:grid-cols-[minmax(16rem,0.85fr)_minmax(0,1.4fr)]">
                                <div className="min-h-64 bg-slate-100 md:min-h-[19rem]">
                                    {announcementImage}
                                </div>
                                <header className="flex flex-col justify-center p-6 sm:p-8 lg:p-10">
                                    {announcementHeading}
                                </header>
                            </div>
                        )}
                        {!isModal && announcementImage}

                        <div
                            className={
                                isModal
                                    ? 'rounded-2xl border border-slate-200 bg-white p-7 shadow-sm sm:p-10'
                                    : 'p-6 sm:p-8'
                            }
                        >
                            {!hasModalImage && (
                                <div className="mb-7">{announcementHeading}</div>
                            )}

                            <section aria-label="Announcement details">
                                <h2 className="mb-3 text-3xl font-bold text-slate-900">
                                    Details
                                </h2>
                                <p
                                    className={`whitespace-pre-wrap text-slate-700 ${
                                        isModal
                                            ? 'text-base leading-8 sm:text-lg'
                                            : 'text-sm leading-7'
                                    }`}
                                >
                                    {announcement.body}
                                </p>
                            </section>
                        </div>
                    </div>
                )}

                {isModal && activeTab === 'comments' && (
                    <section
                        id="comments-tab-panel"
                        role="tabpanel"
                        aria-labelledby="comments-tab"
                        className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
                    >
                        <header className="flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-6">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-ctu-lightblue">
                                    <i
                                        className="fa-solid fa-comments"
                                        aria-hidden="true"
                                    ></i>
                                </div>
                                <div>
                                    <h2 className="font-bold text-slate-900">
                                        Comments
                                    </h2>
                                    <p className="text-xs text-slate-500">
                                        Student comments and admin replies
                                    </p>
                                </div>
                            </div>
                            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                                {commentCount}{' '}
                                {commentCount === 1 ? 'comment' : 'comments'}
                            </span>
                        </header>

                        {discussions.length === 0 ? (
                            <div className="flex min-h-64 flex-col items-center justify-center px-6 py-10 text-center">
                                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                                    <i
                                        className="fa-regular fa-comment-dots text-xl"
                                        aria-hidden="true"
                                    ></i>
                                </div>
                                <h3 className="font-semibold text-slate-800">
                                    No student comments yet
                                </h3>
                            </div>
                        ) : (
                            <div className="space-y-5 p-4 sm:p-6">
                                {discussions.map((discussion) => (
                                    <DiscussionThread
                                        key={discussion.id}
                                        discussion={discussion}
                                    />
                                ))}
                            </div>
                        )}
                    </section>
                )}
            </article>
        </div>
    );
}

function DiscussionThread({ discussion }: { discussion: Discussion }) {
    const comments = discussion.messages.filter(
        (message) => message.role === 'Client' && message.parent_message_id === null,
    );
    const unthreadedReplies = discussion.messages.filter(
        (message) => message.role === 'Admin' && message.parent_message_id === null,
    );

    return (
        <article className="overflow-hidden rounded-xl border border-slate-200">
                <header className="border-b border-slate-100 bg-slate-50 px-4 py-3">
                    <h3 className="font-semibold text-slate-900">{discussion.client_name}</h3>
                </header>
                {comments.length === 0 && (
                    <p className="p-4 text-sm text-slate-500">No student comments yet.</p>
                )}
                <div className="divide-y divide-slate-100">
                    {comments.map((comment) => (
                        <section key={comment.id} className="p-4">
                            <MessageBubble message={comment} />
                            <div className="ml-4 mt-4 space-y-3 border-l-2 border-blue-100 pl-4 sm:ml-8">
                                {discussion.messages
                                    .filter((message) => message.parent_message_id === comment.id)
                                    .map((reply) => (
                                        <MessageBubble key={reply.id} message={reply} />
                                    ))}
                                <DiscussionReplyForm
                                    discussionId={discussion.id}
                                    comment={comment}
                                />
                            </div>
                        </section>
                    ))}
                    {unthreadedReplies.map((reply) => (
                        <div key={reply.id} className="p-4">
                            <p className="mb-2 text-xs font-semibold text-slate-500">
                                Earlier reply (not linked to a specific comment)
                            </p>
                            <MessageBubble message={reply} />
                        </div>
                    ))}
                </div>
        </article>
    );
}

function MessageBubble({ message }: { message: DiscussionMessage }) {
    return (
        <div
                className={`rounded-xl px-4 py-3 ${
                    message.role === 'Admin'
                        ? 'bg-blue-50 text-blue-900'
                        : 'bg-slate-100 text-slate-800'
                }`}
        >
                <p className="mb-1 text-[11px] font-bold uppercase tracking-wide opacity-75">
                    {message.role === 'Admin'
                        ? 'Admin reply'
                        : `${message.author} · Student comment`}
                </p>
                <p className="whitespace-pre-wrap break-words text-sm">{message.content}</p>
                {message.sent_at && (
                    <time
                        className="mt-2 block text-[10px] opacity-70"
                        dateTime={message.sent_at}
                    >
                        {new Date(message.sent_at).toLocaleString()}
                    </time>
                )}
        </div>
    );
}

function DiscussionReplyForm({
    discussionId,
    comment,
}: {
    discussionId: number;
    comment: DiscussionMessage;
}) {
    const { data, setData, post, processing, errors, reset } = useForm({
        content: '',
        parent_message_id: comment.id,
    });

    const handleReply = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!data.content.trim() || processing) {
                return;
        }

        post(`/admin/discussions/${discussionId}/messages`, {
                preserveScroll: true,
                onSuccess: () => reset(),
        });
    };

    return (
        <form onSubmit={handleReply} className="flex items-end gap-3">
                <div className="flex-1">
                    <label
                        htmlFor={`reply-${discussionId}-${comment.id}`}
                        className="mb-1 block text-xs font-semibold text-slate-600"
                    >
                        Reply directly to {comment.author}&apos;s comment
                    </label>
                    <textarea
                        id={`reply-${discussionId}-${comment.id}`}
                        value={data.content}
                        onChange={(event) => setData('content', event.target.value)}
                        rows={2}
                        maxLength={5000}
                        placeholder={`Reply to ${comment.author}...`}
                        className="w-full resize-y rounded-xl border border-slate-300 bg-white p-3 text-sm font-medium outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                    />
                    {errors.content && (
                        <p className="mt-1 text-xs font-semibold text-red-600">
                            {errors.content}
                        </p>
                    )}
                </div>
                <button
                    type="submit"
                    disabled={!data.content.trim() || processing}
                    className="rounded-xl bg-ctu-dark px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-slate-800 disabled:opacity-50"
                >
                    {processing ? 'Posting...' : 'Reply'}
                </button>
        </form>
    );
}

function ImageFallback() {
    return (
        <div className="flex min-h-48 items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 text-center text-sm text-slate-500">
            <span>
                <i
                    className="fa-regular fa-image mb-2 block text-2xl text-slate-400"
                    aria-hidden="true"
                ></i>
                Announcement image is unavailable.
            </span>
        </div>
    );
}
