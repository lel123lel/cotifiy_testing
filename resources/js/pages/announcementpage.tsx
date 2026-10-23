import { Head } from '@inertiajs/react';
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
    onClose?: () => void;
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
    onClose,
}: AnnouncementPageProps) {
    const isModal = Boolean(onClose);
    const [failedImageUrl, setFailedImageUrl] = useState<string | null>(null);

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
                    <div className="mb-2 flex justify-end">
                        <button
                            type="button"
                            onClick={onClose}
                            aria-label="Close announcement"
                            className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-slate-500 shadow-sm transition-colors hover:bg-slate-100 hover:text-slate-800"
                        >
                            <i
                                className="fa-solid fa-times"
                                aria-hidden="true"
                            ></i>
                        </button>
                    </div>
                )}

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

                    <div>
                        <div>
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
                </div>
            </article>
        </div>
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
