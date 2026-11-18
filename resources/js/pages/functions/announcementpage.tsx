import { Head, useForm } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';

export type Announcement = {
    id: number;
    author_staff_id?: number | null;
    author_admin_id?: number | null;
    is_pinned?: boolean;
    status?: string;
    title: string;
    category: string;
    posted_by: string;
    date: string;
    body: string;
    body_html: string;
    image_url: string | null;
    attachments: { path: string; name: string; url: string; size: string }[];
    event_date: string | null;
    event_end_date?: string | null;
    start_time: string | null;
    end_time: string | null;
    location: string | null;
};

export type AnnouncementPageProps = {
    announcement?: Announcement;
    discussions?: Discussion[];
    announcementComments?: DiscussionMessage[];
    staffMode?: boolean;
    initialTab?: 'announcement' | 'comments';
    onClose?: () => void;
};

type DiscussionMessage = {
    id: number;
    parent_message_id: number | null;
    author: string;
    role: 'Client' | 'Admin' | 'Staff';
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
    announcementComments = [],
    staffMode = false,
    initialTab = 'announcement',
    onClose,
}: AnnouncementPageProps) {
    const panelBase = staffMode ? '/staff' : '/admin';
    const isModal = Boolean(onClose);
    const [failedImageUrl, setFailedImageUrl] = useState<string | null>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const [activeTab, setActiveTab] = useState<'announcement' | 'comments'>(
        initialTab,
    );
    useEffect(() => {
        if (isModal) contentRef.current?.scrollTo({ top: 0 });
    }, [activeTab, isModal]);
    const totalCommentCount =
        discussions.reduce(
            (count, discussion) => count + discussion.messages.length,
            0,
        ) + announcementComments.length;

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
    const categoryLabel =
        announcement.category === 'Event'
            ? 'Events'
            : announcement.category === 'Service'
              ? 'Services'
              : announcement.category;
    const categoryColor =
        announcement.category === 'Event'
            ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
            : announcement.category === 'Academic'
              ? 'bg-blue-100 text-blue-700 border-blue-200'
              : announcement.category === 'Service'
                ? 'bg-purple-100 text-purple-700 border-purple-200'
                : 'bg-slate-100 text-slate-700 border-slate-200';
    const categoryIcon =
        announcement.category === 'Academic'
            ? 'fa-solid fa-graduation-cap'
            : announcement.category === 'Event'
              ? 'fa-regular fa-calendar'
              : announcement.category === 'Service'
                ? 'fa-solid fa-hand-holding-heart'
                : 'fa-regular fa-newspaper';
    const announcementImage = announcement.image_url ? (
        failedImageUrl === announcement.image_url ? (
            <div
                ref={contentRef}
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
    ) : isModal ? (
        <div className="flex h-64 flex-col items-center justify-center gap-2 bg-slate-100 px-6 text-center text-sm font-medium text-slate-500 md:h-full md:min-h-[19rem]">
            <i
                className="fa-regular fa-image text-3xl text-slate-400"
                aria-hidden="true"
            ></i>
            <span>No cover image</span>
        </div>
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
                                <dd className="inline">{eventTime.join('')}</dd>
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
                className={`relative w-full ${
                    isModal
                        ? 'flex h-[95vh] max-h-[95vh] max-w-6xl flex-col overflow-hidden rounded-3xl bg-slate-50 shadow-2xl'
                        : 'max-h-[90vh] max-w-3xl overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-2xl'
                }`}
                onClick={
                    isModal ? (event) => event.stopPropagation() : undefined
                }
            >
                {isModal && (
                    <nav className="z-10 flex shrink-0 items-center justify-between border-b border-slate-200 bg-slate-50/95 px-4 backdrop-blur sm:px-6">
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
                                        {totalCommentCount}
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

                <div
                    className={
                        isModal ? 'min-h-0 flex-1 overflow-y-auto p-4 sm:p-6' : undefined
                    }
                >
                    {(!isModal || activeTab === 'announcement') && (
                        <div
                            id={isModal ? 'announcement-tab-panel' : undefined}
                            role={isModal ? 'tabpanel' : undefined}
                            aria-labelledby={isModal ? 'announcement-tab' : undefined}
                        >
                            {isModal && (
                                <ClientStyleAnnouncementLayout
                                    announcement={announcement}
                                    failedImageUrl={failedImageUrl}
                                    onImageError={() =>
                                        setFailedImageUrl(announcement.image_url)
                                    }
                                    categoryLabel={categoryLabel}
                                    categoryColor={categoryColor}
                                    categoryIcon={categoryIcon}
                                    eventTime={eventTime[0]}
                                />
                            )}
                            {!isModal && announcementImage}

                            {!isModal && (
                                <div className="p-6 sm:p-8">
                                    <div className="mb-7">{announcementHeading}</div>

                                    <section aria-label="Announcement details">
                                        <h2 className="mb-3 text-3xl font-bold text-slate-900">
                                            Details
                                        </h2>
                                        <div
                                            dangerouslySetInnerHTML={{
                                                __html: announcement.body_html,
                                            }}
                                            className="text-sm leading-7 break-words text-slate-700 [&_a]:text-blue-600 [&_a]:underline [&_blockquote]:my-4 [&_blockquote]:border-l-4 [&_blockquote]:border-slate-300 [&_blockquote]:pl-4 [&_h1]:mb-3 [&_h1]:text-2xl [&_h1]:font-bold [&_h2]:mb-3 [&_h2]:text-xl [&_h2]:font-bold [&_li]:my-1 [&_ol]:my-4 [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:mb-4 [&_pre]:my-4 [&_pre]:overflow-x-auto [&_pre]:rounded-lg [&_pre]:bg-slate-100 [&_pre]:p-4 [&_ul]:my-4 [&_ul]:list-disc [&_ul]:pl-6"
                                        />
                                    </section>
                                    {announcement.attachments.length > 0 && (
                                        <section
                                            aria-label="Downloadable documents"
                                            className="mt-8"
                                        >
                                            <h2 className="mb-3 text-lg font-bold text-slate-900">
                                                Attachments
                                            </h2>
                                            <div className="flex flex-wrap gap-3">
                                                {announcement.attachments.map((file) => (
                                                    <a
                                                        key={file.path}
                                                        href={file.url}
                                                        download={file.name}
                                                        className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:border-blue-400 hover:text-blue-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                                    >
                                                        <i
                                                            className="fa-solid fa-file-arrow-down text-blue-600"
                                                            aria-hidden="true"
                                                        ></i>
                                                        <span className="break-all">
                                                            {file.name}
                                                        </span>
                                                        <span className="shrink-0 text-xs font-medium text-slate-400">
                                                            {file.size}
                                                        </span>
                                                    </a>
                                                ))}
                                            </div>
                                        </section>
                                    )}
                                </div>
                            )}
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
                                    <div className="text-ctu-lightblue flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
                                        <i
                                            className="fa-solid fa-comments"
                                            aria-hidden="true"
                                        ></i>
                                    </div>
                                    <div>
                                        <h2 className="font-bold text-slate-900">Comments</h2>
                                        <p className="text-xs text-slate-500">
                                            Announcement-wide discussion and student threads
                                        </p>
                                    </div>
                                </div>
                                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                                    {totalCommentCount}{' '}
                                    {totalCommentCount === 1 ? 'comment' : 'comments'}
                                </span>
                            </header>

                            <div className="border-b border-slate-100 bg-slate-50 p-4 sm:p-6">
                                <AnnouncementCommentForm
                                    announcementId={announcement.id}
                                    panelBase={panelBase}
                                />
                            </div>

                            {announcementComments.length > 0 && (
                                <div className="space-y-3 border-b border-slate-100 p-4 sm:p-6">
                                    <h3 className="text-sm font-bold text-slate-700">
                                        Announcement-wide discussion
                                    </h3>
                                    {announcementComments
                                        .filter((message) => message.parent_message_id === null)
                                        .map((message) => (
                                            <AnnouncementMessageThread
                                                key={message.id}
                                                announcementId={announcement.id}
                                                message={message}
                                                messages={announcementComments}
                                                panelBase={panelBase}
                                            />
                                        ))}
                                </div>
                            )}

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
                                            panelBase={panelBase}
                                        />
                                    ))}
                                </div>
                            )}

                        </section>
                    )}
                </div>
            </article>
        </div>
    );
}

function ClientStyleAnnouncementLayout({
    announcement,
    failedImageUrl,
    onImageError,
    categoryLabel,
    categoryColor,
    categoryIcon,
    eventTime,
}: {
    announcement: Announcement;
    failedImageUrl: string | null;
    onImageError: () => void;
    categoryLabel: string;
    categoryColor: string;
    categoryIcon: string;
    eventTime?: string;
}) {
    return (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
            <article
                className={`rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-10 ${announcement.category === 'Event' && announcement.event_date ? 'lg:col-span-8' : 'lg:col-span-12'}`}
            >
                <header className="mb-8">
                    <span
                        className={`mb-3 inline-flex rounded border px-2.5 py-1 text-xs font-bold tracking-wider uppercase ${categoryColor}`}
                    >
                        {categoryLabel}
                    </span>
                    <h1
                        id="announcement-detail-title"
                        className="text-3xl leading-tight font-extrabold text-slate-900"
                    >
                        {announcement.title}
                    </h1>
                    <div className="mt-6 flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-slate-100 font-bold text-slate-500">
                            {announcement.posted_by
                                .trim()
                                .charAt(0)
                                .toUpperCase() || 'A'}
                        </div>
                        <div>
                            <p className="text-base font-extrabold text-slate-900">
                                {announcement.posted_by}
                            </p>
                            <p className="mt-0.5 text-sm font-medium text-slate-500">
                                {formatDate(announcement.date)}
                            </p>
                        </div>
                    </div>
                </header>

                <div className="relative mb-8 flex h-64 w-full items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-gradient-to-br from-slate-100 to-slate-200 sm:h-80">
                    {announcement.image_url &&
                    failedImageUrl !== announcement.image_url ? (
                        <img
                            src={announcement.image_url}
                            alt={announcement.title}
                            className="h-full w-full object-cover"
                            onError={onImageError}
                        />
                    ) : (
                        <div className="flex flex-col items-center text-slate-400">
                            <i
                                className={`mb-3 text-5xl ${categoryIcon}`}
                                aria-hidden="true"
                            ></i>
                            <span className="text-sm font-bold tracking-widest uppercase">
                                {categoryLabel}
                            </span>
                        </div>
                    )}
                </div>

                <div
                    dangerouslySetInnerHTML={{ __html: announcement.body_html }}
                    className="mb-10 text-base leading-relaxed break-words text-slate-700 [&_a]:text-blue-600 [&_a]:underline [&_blockquote]:my-4 [&_blockquote]:border-l-4 [&_blockquote]:border-slate-300 [&_blockquote]:pl-4 [&_h1]:mb-3 [&_h1]:text-2xl [&_h1]:font-bold [&_h2]:mb-3 [&_h2]:text-xl [&_h2]:font-bold [&_li]:my-1 [&_ol]:my-4 [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:mb-4 [&_pre]:my-4 [&_pre]:overflow-x-auto [&_pre]:rounded-lg [&_pre]:bg-slate-100 [&_pre]:p-4 [&_ul]:my-4 [&_ul]:list-disc [&_ul]:pl-6"
                />

                {announcement.attachments.length > 0 && (
                    <section
                        className="mb-2 rounded-xl border border-slate-200 bg-slate-50 p-5"
                        aria-label="Attachments"
                    >
                        <h2 className="mb-4 text-xs font-extrabold tracking-widest text-slate-500 uppercase">
                            Attachments
                        </h2>
                        <div className="flex flex-wrap gap-3">
                            {announcement.attachments.map((file) => (
                                <a
                                    key={file.path}
                                    href={file.url}
                                    download={file.name}
                                    className="group flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 transition-all hover:border-blue-400 hover:shadow-sm"
                                >
                                    <i
                                        className="fa-solid fa-file-pdf text-rose-500"
                                        aria-hidden="true"
                                    ></i>
                                    <span className="text-sm font-bold text-slate-700 group-hover:text-blue-600">
                                        {file.name}
                                    </span>
                                    <span className="text-xs text-slate-400">
                                        {file.size}
                                    </span>
                                </a>
                            ))}
                        </div>
                    </section>
                )}
            </article>

            {announcement.category === 'Event' && announcement.event_date && (
                <aside className="space-y-6 lg:col-span-4">
                    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                        <h2 className="mb-4 text-xs font-extrabold tracking-widest text-slate-400 uppercase">
                            Event details
                        </h2>
                        <div className="mb-2 flex gap-4">
                            <div className="h-fit min-w-[56px] shrink-0 rounded-lg border border-slate-200 bg-slate-100 p-2.5 text-center">
                                <p className="text-[10px] font-extrabold text-slate-500 uppercase">
                                    {new Date(
                                        `${announcement.event_date}T00:00:00`,
                                    ).toLocaleDateString(undefined, {
                                        month: 'short',
                                    })}
                                </p>
                                <p className="mt-0.5 text-xl leading-none font-black text-slate-800">
                                    {new Date(
                                        `${announcement.event_date}T00:00:00`,
                                    ).getDate()}
                                </p>
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-base font-bold text-slate-900">
                                    {formatDate(announcement.event_date)}
                                </p>
                                {announcement.event_end_date &&
                                    announcement.event_end_date !==
                                        announcement.event_date && (
                                        <p className="mt-1 text-sm font-medium text-slate-500">
                                            through{' '}
                                            {formatDate(
                                                announcement.event_end_date,
                                            )}
                                        </p>
                                    )}
                                {eventTime && (
                                    <p className="mt-1 text-sm font-medium text-slate-500">
                                        {eventTime}
                                    </p>
                                )}
                                {announcement.location && (
                                    <p className="mt-1 text-sm font-medium text-slate-500">
                                        <i
                                            className="fa-solid fa-location-dot mr-1.5"
                                            aria-hidden="true"
                                        ></i>
                                        {announcement.location}
                                    </p>
                                )}
                            </div>
                        </div>
                    </section>
                </aside>
            )}
        </div>
    );
}

function DiscussionThread({
    discussion,
    panelBase,
}: {
    discussion: Discussion;
    panelBase: string;
}) {
    const rootMessages = discussion.messages.filter(
        (message) => message.parent_message_id === null,
    );

    return (
        <article className="overflow-hidden rounded-xl border border-slate-200">
            <header className="border-b border-slate-100 bg-slate-50 px-4 py-3">
                <h3 className="font-semibold text-slate-900">
                    {discussion.client_name}
                </h3>
            </header>
            {rootMessages.length === 0 && (
                <p className="p-4 text-sm text-slate-500">No comments yet.</p>
            )}
            <div className="divide-y divide-slate-100">
                {rootMessages.map((message) => (
                    <div key={message.id} className="p-4">
                        <AdminMessageThread
                            discussion={discussion}
                            message={message}
                            panelBase={panelBase}
                        />
                    </div>
                ))}
            </div>
        </article>
    );
}

function AdminMessageThread({
    discussion,
    message,
    panelBase,
}: {
    discussion: Discussion;
    message: DiscussionMessage;
    panelBase: string;
}) {
    const [isReplyOpen, setIsReplyOpen] = useState(false);
    const replies = discussion.messages.filter(
        (reply) => reply.parent_message_id === message.id,
    );

    return (
        <>
            <MessageBubble message={message} />
            <div className="mt-2 ml-4 space-y-3 border-l-2 border-blue-100 pl-4 sm:ml-8">
                <button
                    type="button"
                    onClick={() => setIsReplyOpen((open) => !open)}
                    className="text-ctu-lightblue text-sm font-bold hover:text-blue-700"
                >
                    {isReplyOpen ? 'Cancel reply' : 'Reply'}
                </button>
                {isReplyOpen && (
                    <DiscussionReplyForm
                        discussionId={discussion.id}
                        comment={message}
                        panelBase={panelBase}
                    />
                )}
                {replies.map((reply) => (
                    <AdminMessageThread
                        key={reply.id}
                        discussion={discussion}
                        message={reply}
                        panelBase={panelBase}
                    />
                ))}
            </div>
        </>
    );
}

function MessageBubble({ message }: { message: DiscussionMessage }) {
    return (
        <div
            className={`rounded-xl px-4 py-3 ${
                message.role !== 'Client'
                    ? 'bg-blue-50 text-blue-900'
                    : 'bg-slate-100 text-slate-800'
            }`}
        >
            <p className="mb-1 text-[11px] font-bold tracking-wide uppercase opacity-75">
                {message.role !== 'Client'
                    ? message.role
                    : `${message.author} · Student comment`}
            </p>
            <p className="text-sm break-words whitespace-pre-wrap">
                {message.content}
            </p>
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
    panelBase,
}: {
    discussionId: number;
    comment: DiscussionMessage;
    panelBase: string;
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

        post(`${panelBase}/discussions/${discussionId}/messages`, {
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
                    {`Reply directly to ${comment.author}'s comment`}
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
                className="bg-ctu-dark rounded-xl px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-slate-800 disabled:opacity-50"
            >
                {processing ? 'Posting...' : 'Reply'}
            </button>
        </form>
    );
}

function AnnouncementCommentForm({
    announcementId,
    panelBase,
}: {
    announcementId: number;
    panelBase: string;
}) {
    return (
        <AnnouncementCommentFormFields
            announcementId={announcementId}
            panelBase={panelBase}
            label="Post a comment for all clients"
        />
    );
}

function AnnouncementMessageThread({
    announcementId,
    message,
    messages,
    panelBase,
}: {
    announcementId: number;
    message: DiscussionMessage;
    messages: DiscussionMessage[];
    panelBase: string;
}) {
    const [isReplyOpen, setIsReplyOpen] = useState(false);
    const replies = messages.filter(
        (reply) => reply.parent_message_id === message.id,
    );

    return (
        <article className="rounded-xl border border-slate-200 bg-white p-3">
            <MessageBubble message={message} />
            <div className="mt-2 ml-4 border-l-2 border-blue-100 pl-4 sm:ml-8">
                <button
                    type="button"
                    onClick={() => setIsReplyOpen((open) => !open)}
                    className="text-ctu-lightblue text-sm font-bold hover:text-blue-700"
                >
                    {isReplyOpen ? 'Cancel reply' : 'Reply'}
                </button>
                {isReplyOpen && (
                    <AnnouncementCommentFormFields
                        announcementId={announcementId}
                        parentMessageId={message.id}
                        panelBase={panelBase}
                        label={`Reply to ${message.author}`}
                    />
                )}
                {replies.length > 0 && (
                    <div className="mt-3 space-y-3">
                        {replies.map((reply) => (
                            <AnnouncementMessageThread
                                key={reply.id}
                                announcementId={announcementId}
                                message={reply}
                                messages={messages}
                                panelBase={panelBase}
                            />
                        ))}
                    </div>
                )}
            </div>
        </article>
    );
}

function AnnouncementCommentFormFields({
    announcementId,
    parentMessageId,
    panelBase,
    label,
}: {
    announcementId: number;
    parentMessageId?: number;
    panelBase: string;
    label: string;
}) {
    const { data, setData, post, processing, errors, reset } = useForm({
        content: '',
        parent_message_id: parentMessageId ?? null,
    });
    const formId = `announcement-comment-${announcementId}-${parentMessageId ?? 'new'}`;

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!data.content.trim() || processing) {
            return;
        }

        post(`${panelBase}/announcements/${announcementId}/comments`, {
            preserveScroll: true,
            onSuccess: () => reset(),
        });
    };

    return (
        <form onSubmit={handleSubmit} className="mt-3 flex items-end gap-3">
            <div className="flex-1">
                <label
                    htmlFor={formId}
                    className="mb-1 block text-xs font-semibold text-slate-600"
                >
                    {label}
                </label>
                <textarea
                    id={formId}
                    value={data.content}
                    onChange={(event) => setData('content', event.target.value)}
                    rows={2}
                    maxLength={5000}
                    placeholder="Write a comment..."
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
                className="bg-ctu-dark rounded-xl px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-slate-800 disabled:opacity-50"
            >
                {processing
                    ? 'Posting...'
                    : parentMessageId
                      ? 'Reply'
                      : 'Post Comment'}
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
