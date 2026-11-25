import { Form, Head, router } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import AnnouncementPage, { type Announcement } from '../functions/announcementpage';
import StaffSidebar from '../staff/StaffSidebar';
import StaffNotificationDropdown from '../staff/StaffNotificationDropdown';

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
    announcement_id: number;
    announcement_title: string;
    client_name: string;
    messages: DiscussionMessage[];
};

type AnnouncementComment = {
    announcement_id: number;
    messages: DiscussionMessage[];
};

type AnnouncementTab = 'My Posts' | 'All' | 'Approval' | 'Drafts' | 'Archived';

const formatDate = (date: string) => new Date(`${date}T00:00:00`).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
});

export type StaffAnnouncementsProps = {
    announcements: Announcement[];
    discussions: Discussion[];
    announcementComments: AnnouncementComment[];
    staffName: string;
    staffDepartment?: string | null;
    canRestrictDepartment?: boolean;
    staffId: number;
    openAnnouncementId?: number | null;
    openAnnouncementSection?: 'comments' | null;
    initialTab?: 'My Posts' | null;
    initialCategoryFilter?: 'Event' | null;
};

export default function StaffAnnouncements({
    announcements = [],
    discussions = [],
    announcementComments = [],
    staffName = '',
    staffDepartment = null,
    canRestrictDepartment = false,
    staffId,
    openAnnouncementId = null,
    openAnnouncementSection = null,
    initialTab = null,
    initialCategoryFilter = null,
}: StaffAnnouncementsProps) {
    const [isEditorOpen, setIsEditorOpen] = useState(false);
    const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
    const [announcementToDelete, setAnnouncementToDelete] = useState<Announcement | null>(null);
    const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(
        () => announcements.find((announcement) => announcement.id === openAnnouncementId) ?? null,
    );
    const [isDeletingAnnouncement, setIsDeletingAnnouncement] = useState(false);
    const [selectedImageName, setSelectedImageName] = useState('');
    const [selectedAttachmentNames, setSelectedAttachmentNames] = useState<string[]>([]);
    const [removedAttachmentPaths, setRemovedAttachmentPaths] = useState<string[]>([]);
    const bodyTextareaRef = useRef<HTMLTextAreaElement>(null);
    const canSetDepartmentAudience = canRestrictDepartment
        && (!editingAnnouncement || editingAnnouncement.status === 'Draft');

    // Editor State
    const [selectedCategory, setSelectedCategory] = useState('Academic');
    const [isUrgent, setIsUrgent] = useState(false);
    const [urgentDays, setUrgentDays] = useState(1);
    const [isDepartmentOnly, setIsDepartmentOnly] = useState(false);

    // Table & Sidebar State
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<AnnouncementTab>(initialTab ?? 'My Posts');
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState(initialCategoryFilter ?? 'All');
    const [selectedRows, setSelectedRows] = useState<number[]>([]);
    const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);
    const panelBase = '/staff';
    const statusInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (openAnnouncementId === null) return;

        const announcement = announcements.find((item) => item.id === openAnnouncementId);
        if (announcement) setSelectedAnnouncement(announcement);
    }, [announcements, openAnnouncementId]);

    const closeAnnouncement = () => {
        setSelectedAnnouncement(null);

        if (openAnnouncementId !== null) {
            router.get('/staff/announcements', {}, {
                replace: true,
                preserveScroll: true,
                preserveState: true,
            });
        }
    };

    const tabs: { label: AnnouncementTab; count: number }[] = [
        {
            label: 'My Posts',
            count: announcements.filter((announcement) => announcement.author_staff_id === staffId && announcement.status !== 'Draft' && announcement.status !== 'Archived').length,
        },
        { label: 'All', count: announcements.filter((announcement) => announcement.status !== 'Draft' && announcement.status !== 'Archived').length },
        {
            label: 'Approval',
            count: announcements.filter((announcement) =>
                announcement.author_staff_id === staffId && announcement.status === 'Pending Approval'
            ).length,
        },
        { label: 'Drafts', count: announcements.filter((announcement) => announcement.status === 'Draft' && announcement.author_staff_id === staffId).length },
        { label: 'Archived', count: announcements.filter((announcement) => announcement.status === 'Archived').length },
    ];

    // Filtering Logic
    const filteredAnnouncements = announcements.filter((ann) => {
        const matchesTab = activeTab === 'My Posts'
            ? ann.author_staff_id === staffId && ann.status !== 'Draft' && ann.status !== 'Archived'
            : activeTab === 'Approval'
                ? ann.author_staff_id === staffId && ann.status === 'Pending Approval'
                : activeTab === 'Drafts'
                    ? ann.status === 'Draft' && ann.author_staff_id === staffId
                    : activeTab === 'Archived'
                        ? ann.status === 'Archived'
                        : activeTab === 'All'
                            ? ann.status !== 'Draft' && ann.status !== 'Archived'
                            : ann.status === activeTab;
        const matchesSearch = ann.title.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = categoryFilter === 'All' || ann.category === categoryFilter;
        return matchesTab && matchesSearch && matchesCategory;
    });

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedRows(filteredAnnouncements.map(a => a.id));
        } else {
            setSelectedRows([]);
        }
    };

    const handleSelectRow = (id: number) => {
        setSelectedRows(prev =>
            prev.includes(id) ? prev.filter(rowId => rowId !== id) : [...prev, id]
        );
    };

    const archiveAnnouncement = (announcement: Announcement) => {
        router.patch(`${panelBase}/announcements/${announcement.id}/archive`, {}, {
            preserveScroll: true,
        });
    };

    const restoreAnnouncement = (announcement: Announcement) => {
        router.patch(`${panelBase}/announcements/${announcement.id}/restore`, {}, {
            preserveScroll: true,
        });
    };

    const openEditor = (announcement: Announcement | null = null) => {
        setEditingAnnouncement(announcement);
        setSelectedCategory(announcement?.category || 'Academic');
        setIsUrgent(announcement?.is_urgent ?? false);
        setUrgentDays(announcement?.urgent_days ?? 1);
        setIsDepartmentOnly(announcement ? announcement.target_department != null : canRestrictDepartment);
        setSelectedImageName('');
        setSelectedAttachmentNames([]);
        setRemovedAttachmentPaths([]);
        setIsEditorOpen(true);
    };

    const insertMarkdown = (prefix: string, suffix = '', placeholder = 'text') => {
        const textarea = bodyTextareaRef.current;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selectedText = textarea.value.slice(start, end);
        const insertedText = selectedText || placeholder;
        textarea.setRangeText(`${prefix}${insertedText}${suffix}`, start, end, 'select');
        textarea.focus();
        textarea.setSelectionRange(start + prefix.length, start + prefix.length + insertedText.length);
    };

    const prefixMarkdownLines = (prefix: string, ordered = false) => {
        const textarea = bodyTextareaRef.current;
        if (!textarea) return;

        let start = textarea.selectionStart;
        let end = textarea.selectionEnd;
        if (start === end) {
            start = textarea.value.lastIndexOf('\n', start - 1) + 1;
            end = start;
        }

        const selectedText = textarea.value.slice(start, end);
        const lines = selectedText ? selectedText.split('\n') : [''];
        const insertedText = lines
            .map((line, index) => `${ordered ? `${index + 1}.` : prefix}${ordered ? ' ' : ''}${line}`)
            .join('\n');

        textarea.setRangeText(insertedText, start, end, 'end');
        textarea.focus();
    };

    return (
        <>
            <Head title="Announcements | Cotify Staff" />

            <style>{`
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes scaleIn { from { opacity: 0; transform: scale(0.98); } to { opacity: 1; transform: scale(1); } }
                @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

                @keyframes move-around-1 { 0% { transform: translate(0, 0) rotate(0deg); } 25% { transform: translate(-35vw, 25vh) rotate(25deg); } 50% { transform: translate(-15vw, 50vh) rotate(-15deg); } 75% { transform: translate(25vw, 30vh) rotate(15deg); } 100% { transform: translate(0, 0) rotate(0deg); } }
                @keyframes move-around-2 { 0% { transform: translate(0, 0) rotate(0deg); } 25% { transform: translate(30vw, -30vh) rotate(-25deg); } 50% { transform: translate(-40vw, -20vh) rotate(15deg); } 75% { transform: translate(-25vw, 30vh) rotate(-15deg); } 100% { transform: translate(0, 0) rotate(0deg); } }
                @keyframes move-around-3 { 0% { transform: translate(0, 0) rotate(0deg) scale(1); } 33% { transform: translate(35vw, -40vh) rotate(55deg) scale(1.3); } 66% { transform: translate(-30vw, 25vh) rotate(110deg) scale(0.9); } 100% { transform: translate(0, 0) rotate(0deg) scale(1); } }

                .animate-fade-up { animation: fadeInUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; opacity: 0; }
                .animate-fade-in { animation: fadeIn 0.3s ease-out forwards; opacity: 0; }
                .animate-scale-in { animation: scaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; opacity: 0; }

                .shape-move-1 { animation: move-around-1 35s ease-in-out infinite; }
                .shape-move-2 { animation: move-around-2 45s ease-in-out infinite; }
                .shape-move-3 { animation: move-around-3 40s ease-in-out infinite; }

                .clip-hexagon { clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%); }
                .clip-octagon { clip-path: polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%); }

                /* Fix: hide horizontal overflow on mobile */
                @media (max-width: 767px) {
                    .mobile-scroll-x {
                        -webkit-overflow-scrolling: touch;
                        scrollbar-width: thin;
                    }
                }
            `}</style>

            <div className="font-sans text-slate-800 bg-slate-50 antialiased h-screen flex overflow-hidden relative">

                {/* MOVING SHAPES BACKGROUND */}
                <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                    <div className="absolute top-[5%] left-[5%] w-[30rem] h-[30rem] bg-blue-500/5 rounded-full blur-3xl shape-move-1"></div>
                    <div className="absolute bottom-[5%] right-[5%] w-[35rem] h-[35rem] bg-indigo-500/5 rounded-full blur-3xl shape-move-2"></div>
                    <div className="absolute top-[15%] right-[15%] w-[25rem] h-[25rem] border-[2px] border-blue-500/10 rounded-full shape-move-1"></div>
                    <div className="absolute bottom-[20%] left-[10%] w-32 h-32 border-[3px] border-indigo-500/10 rounded-full shape-move-2"></div>
                    <div className="absolute top-[60%] right-[30%] w-20 h-20 border-[2px] border-blue-500/15 rounded-full shape-move-3"></div>
                    <div className="absolute top-[20%] left-[30%] w-40 h-40 bg-blue-500/5 clip-hexagon shape-move-2"></div>
                    <div className="absolute bottom-[15%] right-[20%] w-56 h-56 border-[3px] border-indigo-500/10 clip-hexagon shape-move-1 bg-transparent">
                        <div className="w-full h-full bg-blue-500/5 clip-hexagon scale-[0.95]"></div>
                    </div>
                    <div className="absolute top-[45%] left-[15%] w-32 h-32 bg-indigo-500/5 clip-octagon shape-move-3"></div>
                </div>

                {/* SIDEBAR */}
                <StaffSidebar
                    activePage="announcements"
                    isOpen={isSidebarOpen}
                    onClose={() => setIsSidebarOpen(false)}
                    userName={staffName}
                />

                {/* MAIN CONTENT */}
                <div className="flex-1 flex flex-col bg-transparent overflow-hidden relative w-full z-10 min-w-0">

                    {/* TOP BAR */}
                    <header className="h-16 sm:h-20 bg-transparent border-b border-slate-200/50 flex items-center justify-between px-4 sm:px-6 shrink-0 z-20 gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} aria-label="Toggle sidebar" className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors md:hidden shrink-0">
                                <i className="fa-solid fa-bars"></i>
                            </button>
                            <h2 className="text-lg sm:text-2xl font-extrabold text-slate-900 tracking-tight truncate">Manage Announcements</h2>
                        </div>

                        <div className="flex items-center gap-3 sm:gap-4 shrink-0">
                            <StaffNotificationDropdown />
                        </div>
                    </header>

                    <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">

                        <div className="max-w-[1200px] mx-auto animate-fade-up">

                            {/* PAGE TITLE & TABS */}
                            <div className="mb-6">


                                <div className="flex items-center gap-6 border-b border-slate-200 overflow-x-auto no-scrollbar">
                                    {tabs.map((tab) => (
                                        <button
                                            key={tab.label}
                                            onClick={() => setActiveTab(tab.label)}
                                            className={`pb-3 text-sm font-bold whitespace-nowrap transition-colors relative flex items-center gap-1.5 ${
                                                activeTab === tab.label ? 'text-slate-900' : 'text-slate-500 hover:text-slate-700'
                                            }`}
                                        >
                                            <span className={activeTab === tab.label ? 'border-b-2 border-slate-900 pb-3 -mb-3' : ''}>
                                                {tab.label}
                                            </span>
                                            <span className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded text-[10px]">{tab.count}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* SEARCH, FILTER & NEW ANNOUNCEMENT */}
                            <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-3 mb-6">
                                <div className="relative flex-1 min-w-[200px] max-w-full sm:max-w-xs">
                                    <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
                                    <input
                                        type="text"
                                        placeholder="Search announcements..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        aria-label="Search announcements"
                                        className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 text-slate-800 rounded-lg text-sm focus:border-ctu-lightblue outline-none shadow-sm"
                                    />
                                </div>
                                <select
                                    value={categoryFilter}
                                    onChange={(e) => setCategoryFilter(e.target.value)}
                                    aria-label="Filter announcements by category"
                                    className="w-full sm:w-auto min-w-[160px] px-3 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm focus:border-ctu-lightblue outline-none shadow-sm"
                                >
                                    <option value="All">All categories</option>
                                    <option value="Academic">Academic</option>
                                    <option value="General">General</option>
                                    <option value="Event">Event</option>
                                    <option value="Service">Service</option>
                                </select>

                                <button
                                    type="button"
                                    onClick={() => openEditor()}
                                    className="sm:ml-auto bg-ctu-dark hover:bg-slate-800 text-white text-sm font-bold px-5 py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all shadow-lg shadow-slate-900/20 hover:-translate-y-0.5 shrink-0"
                                >
                                    <i className="fa-solid fa-plus"></i>
                                    <span>New announcement</span>
                                </button>
                            </div>

                            {/* TABLE */}
                            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-visible mb-6">
                                <div className="overflow-x-auto mobile-scroll-x">
                                    <table className="w-full table-fixed text-left border-collapse min-w-[1000px]">
                                        <colgroup>
                                            <col className="w-12" />
                                            <col className="w-[25%]" />
                                            <col className="w-[15%]" />
                                            <col className="w-[12%]" />
                                            <col className="w-[12%]" />
                                            <col className="w-[14%]" />
                                            <col className="w-[22%]" />
                                        </colgroup>
                                        <thead>
                                            <tr className="border-b border-slate-200 text-[10px] uppercase tracking-wider text-slate-500 font-extrabold bg-slate-50/50">
                                                <th className="px-4 py-3 w-10">
                                                    <input type="checkbox" onChange={handleSelectAll} checked={selectedRows.length === filteredAnnouncements.length && filteredAnnouncements.length > 0} className="rounded border-slate-300 cursor-pointer" />
                                                </th>
                                                <th className="px-4 py-3">Title</th>
                                                <th className="py-3 pl-6 pr-4">Category</th>
                                                <th className="px-4 py-3">Posted By</th>
                                                <th className="py-3 pl-6 pr-4">Status</th>
                                                <th className="whitespace-nowrap px-4 py-3">Date</th>
                                                <th className="px-4 py-3 text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {filteredAnnouncements.map((announcement: any) => (
                                                <tr
                                                    key={announcement.id}
                                                    onClick={() => setSelectedAnnouncement(announcement)}
                                                    className="cursor-pointer text-sm text-slate-700 hover:bg-slate-50 transition-colors group"
                                                >
                                                    <td className="px-4 py-5" onClick={(event) => event.stopPropagation()}>
                                                        <input type="checkbox" checked={selectedRows.includes(announcement.id)} onChange={() => handleSelectRow(announcement.id)} className="rounded border-slate-300 cursor-pointer" />
                                                    </td>
                                                    <td className="px-4 py-5">
                                                        <span className="line-clamp-1 font-bold text-slate-900 transition-colors group-hover:text-ctu-lightblue">
                                                            {announcement.title}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-5">
                                                        <span className="border border-slate-200 bg-slate-50 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">{announcement.category}</span>
                                                    </td>
                                                    <td className="px-4 py-5 text-xs font-semibold">{announcement.posted_by || '—'}</td>
                                                    <td className="px-4 py-5">
                                                        <span className={`px-2 py-0.5 rounded-full border text-[10px] font-bold ${
                                                            announcement.status === 'Pending Approval'
                                                                ? 'border-amber-200 bg-amber-50 text-amber-700'
                                                                : announcement.status === 'Scheduled'
                                                                    ? 'border-blue-200 bg-blue-50 text-blue-700'
                                                                    : 'border-slate-200 bg-white text-slate-800'
                                                        }`}>
                                                            {announcement.status || 'Published'}
                                                        </span>
                                                    </td>
                                                    <td className="whitespace-nowrap px-4 py-5 text-xs">{formatDate(announcement.date)}</td>
                                                    <td className="px-4 py-5 text-right" onClick={(event) => event.stopPropagation()}>
                                                        {activeTab === 'My Posts' && announcement.author_staff_id === staffId ? (
                                                            <div className="flex justify-end gap-1.5">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => archiveAnnouncement(announcement)}
                                                                    title="Archive announcement"
                                                                    className="inline-flex items-center gap-1 rounded-md border border-amber-200 bg-amber-50 px-1.5 py-2 text-[10px] font-bold text-amber-700 transition-colors hover:bg-amber-100"
                                                                >
                                                                    <i className="fa-solid fa-box-archive" aria-hidden="true"></i> Archive
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => openEditor(announcement)}
                                                                    title="Edit announcement"
                                                                    className="inline-flex items-center gap-1 rounded-md border border-blue-200 bg-blue-50 px-1.5 py-2 text-[10px] font-bold text-blue-700 transition-colors hover:bg-blue-100"
                                                                >
                                                                    <i className="fa-solid fa-pen" aria-hidden="true"></i> Edit
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setAnnouncementToDelete(announcement)}
                                                                    title="Delete announcement"
                                                                    className="inline-flex items-center gap-1 rounded-md border border-rose-200 bg-rose-50 px-1.5 py-2 text-[10px] font-bold text-rose-700 transition-colors hover:bg-rose-100"
                                                                >
                                                                    <i className="fa-solid fa-trash" aria-hidden="true"></i> Delete
                                                                </button>
                                                            </div>
                                                        ) : activeTab === 'Archived' && announcement.author_staff_id === staffId ? (
                                                            <div className="flex justify-end gap-1.5">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => restoreAnnouncement(announcement)}
                                                                    title="Unarchive announcement"
                                                                    className="inline-flex items-center gap-1 rounded-md border border-amber-200 bg-amber-50 px-1.5 py-2 text-[10px] font-bold text-amber-700 transition-colors hover:bg-amber-100"
                                                                >
                                                                    <i className="fa-solid fa-box-open" aria-hidden="true"></i> Unarchive
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            announcement.status === 'Draft' && announcement.author_staff_id === staffId ? (
                                                                <div className="flex justify-end gap-2">
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => openEditor(announcement)}
                                                                        className="inline-flex items-center gap-1.5 rounded-md border border-blue-200 bg-blue-50 px-2 py-2 text-[11px] font-bold text-blue-700 transition-colors hover:bg-blue-100"
                                                                    >
                                                                        <i className="fa-solid fa-arrow-right" aria-hidden="true"></i>
                                                                        Continue
                                                                    </button>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => setAnnouncementToDelete(announcement)}
                                                                        className="inline-flex items-center gap-1.5 rounded-md border border-rose-200 bg-rose-50 px-2 py-2 text-[11px] font-bold text-rose-700 transition-colors hover:bg-rose-100"
                                                                    >
                                                                        <i className="fa-solid fa-trash" aria-hidden="true"></i>
                                                                        Remove
                                                                    </button>
                                                                </div>
                                                            ) : null
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </main>
                </div>

                {selectedAnnouncement && (
                    <AnnouncementPage
                        key={`${selectedAnnouncement.id}-${openAnnouncementSection ?? 'announcement'}`}
                        announcement={selectedAnnouncement}
                        canSendReminder={selectedAnnouncement.author_staff_id === staffId}
                        discussions={discussions.filter((discussion) => discussion.announcement_id === selectedAnnouncement.id)}
                        announcementComments={announcementComments
                            .filter((comment) => comment.announcement_id === selectedAnnouncement.id)
                            .flatMap((comment) => comment.messages)}
                        staffMode
                        initialTab={openAnnouncementSection ?? 'announcement'}
                        onClose={closeAnnouncement}
                    />
                )}

                {/* REDESIGNED ANNOUNCEMENT EDITOR MODAL */}
                {isEditorOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 sm:p-6 animate-fade-in" role="dialog" aria-modal="true">
                        <div className="bg-white rounded-xl shadow-2xl w-full max-w-[1100px] h-full max-h-[90vh] flex flex-col overflow-hidden animate-scale-in">

                            <Form
                                method="post"
                                action={editingAnnouncement ? `${panelBase}/announcements/${editingAnnouncement.id}` : `${panelBase}/announcements`}
                                onSuccess={() => setIsEditorOpen(false)}
                                className="flex flex-col h-full"
                            >
                                {({ errors, processing }) => (
                                    <>
                                    {editingAnnouncement && <input type="hidden" name="_method" value="put" />}
                                    <input ref={statusInputRef} type="hidden" name="status" defaultValue={editingAnnouncement?.status === 'Draft' ? 'Draft' : 'Published'} />
                                    <input type="hidden" name="is_urgent" value="0" />

                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between px-4 sm:px-6 py-4 border-b border-slate-200 bg-white shrink-0 gap-3">
                                        <div className="flex items-center gap-4">
                                            <button type="button" onClick={() => setIsEditorOpen(false)} className="text-slate-400 hover:text-slate-700">
                                                <i className="fa-solid fa-arrow-left"></i>
                                            </button>
                                            <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                                                {editingAnnouncement ? 'Edit announcement' : 'New announcement'}
                                            </h2>
                                        </div>
                                        <div className="flex items-center gap-3 w-full sm:w-auto">
                                            {(!editingAnnouncement || editingAnnouncement.status === 'Draft') && (
                                                <button
                                                    type="submit"
                                                    formNoValidate
                                                    disabled={processing}
                                                    onClick={() => {
                                                        if (statusInputRef.current) statusInputRef.current.value = 'Draft';
                                                    }}
                                                    className="flex-1 sm:flex-none px-4 py-2 rounded-lg border border-slate-300 bg-white text-sm font-bold text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50"
                                                >
                                                    Save as draft
                                                </button>
                                            )}
                                            <button
                                                type="submit"
                                                disabled={processing}
                                                onClick={() => {
                                                        if (statusInputRef.current) {
                                                        statusInputRef.current.value = 'Published';
                                                    }
                                                }}
                                                className="flex-1 sm:flex-none px-4 py-2 bg-ctu-dark hover:bg-slate-800 text-white rounded-lg text-sm font-bold transition-colors disabled:opacity-50"
                                            >
                                                {processing
                                                    ? 'Saving...'
                                                    : (isUrgent || !isDepartmentOnly)
                                                        ? 'Submit for approval'
                                                        : (editingAnnouncement?.status === 'Draft' ? 'Publish' : editingAnnouncement ? 'Save changes' : 'Publish')}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex-1 overflow-y-auto flex flex-col md:flex-row bg-white">
                                        <div className="flex-1 p-4 sm:p-6 space-y-6 md:border-r border-slate-200">
                                            <div>
                                                <label htmlFor="title" className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-widest mb-1.5">
                                                    Title <span className="text-rose-500">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    id="title"
                                                    name="title"
                                                    defaultValue={editingAnnouncement?.title ?? ''}
                                                    required
                                                    placeholder="Midterm Exam Schedule, 1st Semester"
                                                    className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-lg text-sm font-medium focus:border-ctu-lightblue focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                                                />
                                                {errors.title && <p className="mt-1 text-xs font-bold text-red-600">{errors.title}</p>}
                                            </div>

                                            <div>
                                                <label htmlFor="body" className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-widest mb-1.5">
                                                    Details <span className="text-rose-500">*</span>
                                                </label>
                                                <div className="border border-slate-300 rounded-lg overflow-hidden flex flex-col focus-within:border-ctu-lightblue focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
                                                    <div className="flex flex-wrap items-center gap-3 px-3 py-2 bg-slate-50 border-b border-slate-200 text-slate-500">
                                                        <button type="button" aria-label="Bold" title="Bold" onClick={() => insertMarkdown('**', '**')} className="font-bold hover:text-slate-800">B</button>
                                                        <button type="button" aria-label="Italic" title="Italic" onClick={() => insertMarkdown('*', '*')} className="italic hover:text-slate-800">I</button>
                                                        <button type="button" aria-label="Heading" title="Heading" onClick={() => prefixMarkdownLines('## ')} className="font-bold hover:text-slate-800">H</button>
                                                        <div className="w-px h-4 bg-slate-300"></div>
                                                        <button type="button" aria-label="Bulleted list" title="Bulleted list" onClick={() => prefixMarkdownLines('- ')} className="flex items-center gap-1 text-sm hover:text-slate-800"><i className="fa-solid fa-list-ul"></i></button>
                                                        <button type="button" aria-label="Numbered list" title="Numbered list" onClick={() => prefixMarkdownLines('', true)} className="flex items-center gap-1 text-sm hover:text-slate-800"><i className="fa-solid fa-list-ol"></i></button>
                                                        <button type="button" aria-label="Blockquote" title="Blockquote" onClick={() => prefixMarkdownLines('> ')} className="flex items-center text-sm hover:text-slate-800"><i className="fa-solid fa-quote-left"></i></button>
                                                        <div className="w-px h-4 bg-slate-300"></div>
                                                        <button type="button" aria-label="Link" title="Link" onClick={() => insertMarkdown('[', '](https://example.com)', 'link text')} className="flex items-center gap-1 text-sm hover:text-slate-800"><i className="fa-solid fa-link"></i></button>
                                                    </div>
                                                    <textarea
                                                        id="body"
                                                        name="body"
                                                        ref={bodyTextareaRef}
                                                        defaultValue={editingAnnouncement?.body ?? ''}
                                                        required
                                                        rows={8}
                                                        className="w-full p-4 text-sm focus:outline-none resize-none bg-white whitespace-pre-wrap"
                                                        placeholder="Write the announcement details..."
                                                    />
                                                </div>
                                                {errors.body && <p className="mt-1 text-xs font-bold text-red-600">{errors.body}</p>}
                                            </div>

                                            <div>
                                                <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-widest mb-1.5">Cover image</label>
                                                <label className="flex flex-col items-center justify-center w-full min-h-32 border-2 border-dashed border-slate-300 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer relative overflow-hidden group">
                                                    {selectedImageName ? (
                                                        <p className="p-4 text-sm font-bold text-slate-700 text-center break-all">{selectedImageName}</p>
                                                    ) : editingAnnouncement?.image_url ? (
                                                        <img src={editingAnnouncement.image_url} alt="Announcement cover" className="w-full h-full object-contain" />
                                                    ) : (
                                                        <div className="text-center p-4">
                                                            <p className="text-sm font-bold text-slate-700 mb-1">Choose an image</p>
                                                            <p className="text-[10px] text-slate-500">JPG, PNG, GIF or WebP · up to 5 MB</p>
                                                        </div>
                                                    )}
                                                    <input
                                                        type="file"
                                                        name="image"
                                                        accept="image/jpeg,image/png,image/gif,image/webp"
                                                        onChange={(event) => setSelectedImageName(event.currentTarget.files?.[0]?.name ?? '')}
                                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                                    />
                                                </label>
                                                {errors.image && <p className="mt-1 text-xs font-bold text-red-600">{errors.image}</p>}
                                            </div>

                                            <div>
                                                <label htmlFor="attachments" className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-widest mb-1.5">
                                                    Downloadable documents
                                                </label>
                                                <input
                                                    id="attachments"
                                                    type="file"
                                                    name="attachments[]"
                                                    multiple
                                                    accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.odt,.ods,.odp"
                                                    onChange={(event) => setSelectedAttachmentNames(Array.from(event.currentTarget.files ?? [], (file) => file.name))}
                                                    className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-blue-50 file:px-3 file:py-2 file:text-xs file:font-bold file:text-blue-700 hover:file:bg-blue-100"
                                                />
                                                <p className="mt-1 text-[10px] text-slate-500">PDF, Office, OpenDocument, TXT or CSV · up to 10 MB each</p>
                                                {selectedAttachmentNames.length > 0 && (
                                                    <ul className="mt-2 space-y-1">
                                                        {selectedAttachmentNames.map((name, index) => (
                                                            <li key={`${name}-${index}`} className="break-all text-xs font-medium text-slate-700">{name}</li>
                                                        ))}
                                                    </ul>
                                                )}
                                                {editingAnnouncement?.attachments?.filter(({ path }) => !removedAttachmentPaths.includes(path)).map((attachment) => (
                                                    <div key={attachment.path} className="mt-2 flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2">
                                                        <a href={attachment.url} target="_blank" rel="noreferrer" className="min-w-0 break-all text-xs font-semibold text-blue-700 hover:underline">
                                                            {attachment.name}
                                                        </a>
                                                        <button
                                                            type="button"
                                                            onClick={() => setRemovedAttachmentPaths((paths) => [...paths, attachment.path])}
                                                            className="shrink-0 text-xs font-bold text-rose-600 hover:text-rose-800"
                                                        >
                                                            Remove
                                                        </button>
                                                    </div>
                                                ))}
                                                {removedAttachmentPaths.map((path) => (
                                                    <input key={path} type="hidden" name="remove_attachments[]" value={path} />
                                                ))}
                                                {errors.attachments && <p className="mt-1 text-xs font-bold text-red-600">{errors.attachments}</p>}
                                                {Object.entries(errors)
                                                    .filter(([key]) => key.startsWith('attachments.'))
                                                    .map(([key, error]) => (
                                                        <p key={key} className="mt-1 text-xs font-bold text-red-600">{error}</p>
                                                    ))}
                                            </div>
                                        </div>

                                        <div className="w-full md:w-[320px] bg-slate-50/50 p-4 sm:p-6 space-y-6 shrink-0">
                                            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                                                <label htmlFor="category" className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-widest mb-1.5">
                                                    Category <span className="text-rose-500">*</span>
                                                </label>
                                                <select
                                                    id="category"
                                                    name="category"
                                                    required
                                                    value={selectedCategory}
                                                    onChange={(e) => setSelectedCategory(e.target.value)}
                                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-medium mb-4 focus:outline-none focus:border-ctu-lightblue"
                                                >
                                                    <option value="Academic">Academic</option>
                                                    <option value="General">General</option>
                                                    <option value="Event">Event</option>
                                                    <option value="Service">Service</option>
                                                </select>
                                                {errors.category && <p className="mb-3 text-xs font-bold text-red-600">{errors.category}</p>}

                                                <label htmlFor="posted_by" className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-widest mb-1.5">
                                                    Posted by <span className="text-rose-500">*</span>
                                                </label>
                                                <input
                                                    id="posted_by"
                                                    type="text"
                                                    name="posted_by"
                                                    defaultValue={staffDepartment ?? editingAnnouncement?.posted_by ?? "Registrar's Office"}
                                                    readOnly={staffDepartment !== null}
                                                    required
                                                    maxLength={255}
                                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-medium focus:outline-none focus:border-ctu-lightblue"
                                                />
                                                {errors.posted_by && <p className="mt-1 text-xs font-bold text-red-600">{errors.posted_by}</p>}
                                            </div>

                                            {canSetDepartmentAudience ? (
                                                <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
                                                    <label htmlFor="announcement_audience" className="block text-[11px] font-extrabold text-slate-600 uppercase tracking-widest mb-1.5">
                                                        Audience
                                                    </label>
                                                    <select
                                                        id="announcement_audience"
                                                        name="department_only"
                                                        value={isDepartmentOnly ? '1' : '0'}
                                                        onChange={(event) => setIsDepartmentOnly(event.currentTarget.value === '1')}
                                                        className="w-full rounded-lg border border-blue-200 bg-white px-3 py-2 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                                    >
                                                        <option value="0">Public</option>
                                                        <option value="1">{staffDepartment}</option>
                                                    </select>
                                                    <p className="mt-2 text-xs text-slate-600">
                                                        {isDepartmentOnly
                                                            ? `Visible only to student accounts in courses under ${staffDepartment}.`
                                                            : 'Visible to all student accounts, regardless of course or department.'}
                                                    </p>
                                                    {errors.department_only && <p className="mt-2 text-xs font-bold text-red-600">{errors.department_only}</p>}
                                                </div>
                                            ) : canRestrictDepartment && editingAnnouncement ? (
                                                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm">
                                                    <p className="font-semibold text-slate-700">
                                                        {editingAnnouncement.target_department
                                                            ? `Visible only to ${editingAnnouncement.target_department} students.`
                                                            : 'Visible to all departments.'}
                                                    </p>
                                                    <p className="mt-1 text-xs text-slate-500">The audience is fixed after publishing.</p>
                                                </div>
                                            ) : (
                                                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                                                    <label htmlFor="announcement_audience" className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-widest mb-1.5">
                                                        Audience
                                                    </label>
                                                    <select
                                                        id="announcement_audience"
                                                        disabled
                                                        className="w-full rounded-lg border border-slate-200 bg-slate-100 px-3 py-2 text-sm text-slate-500"
                                                    >
                                                        <option>Public</option>
                                                    </select>
                                                    <p className="mt-2 text-xs text-slate-500">
                                                        {staffDepartment
                                                            ? `The assigned office "${staffDepartment}" is not mapped to one of the listed colleges.`
                                                            : 'Assign your staff account to a college department to enable this option.'}
                                                    </p>
                                                </div>
                                            )}

                                            <div className="rounded-xl border border-red-200 bg-red-50 p-4">
                                                <label className="flex items-center gap-3 text-sm font-bold text-red-800">
                                                    <input
                                                        type="checkbox"
                                                        name="is_urgent"
                                                        value="1"
                                                        checked={isUrgent}
                                                        onChange={(event) => setIsUrgent(event.currentTarget.checked)}
                                                        className="h-4 w-4 rounded border-red-300 text-red-600 focus:ring-red-500"
                                                    />
                                                    <span>Mark as URGENT</span>
                                                </label>
                                                {isUrgent && (
                                                    <div className="mt-3">
                                                        <label htmlFor="urgent_days" className="block text-xs font-semibold text-red-800">
                                                            Keep urgent for (up to 3 days), then automatically archive
                                                        </label>
                                                        <select
                                                            id="urgent_days"
                                                            name="urgent_days"
                                                            value={urgentDays}
                                                            onChange={(event) => setUrgentDays(Number(event.currentTarget.value))}
                                                            className="mt-1 w-full rounded-lg border border-red-200 bg-white px-3 py-2 text-sm text-slate-800"
                                                        >
                                                            {[1, 2, 3].map((days) => (
                                                                <option key={days} value={days}>{days} {days === 1 ? 'day' : 'days'}</option>
                                                            ))}
                                                        </select>
                                                        {errors.urgent_days && <p className="mt-1 text-xs font-bold text-red-600">{errors.urgent_days}</p>}
                                                    </div>
                                                )}
                                            </div>

                                            {selectedCategory === 'Event' && (
                                                <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-3">
                                                    <h4 className="text-[11px] font-extrabold text-slate-500 uppercase tracking-widest">
                                                        Event details
                                                    </h4>
                                                    <div>
                                                        <label htmlFor="event_date" className="block text-xs font-bold text-slate-700 mb-1">
                                                            Start date <span className="text-rose-500">*</span>
                                                        </label>
                                                        <input
                                                            id="event_date"
                                                            type="date"
                                                            name="event_date"
                                                            defaultValue={editingAnnouncement?.event_date ?? ''}
                                                            required
                                                            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                                                        />
                                                        {errors.event_date && <p className="mt-1 text-xs font-bold text-red-600">{errors.event_date}</p>}
                                                    </div>
                                                    <div>
                                                        <label htmlFor="event_end_date" className="block text-xs font-bold text-slate-700 mb-1">
                                                            End date <span className="text-rose-500">*</span>
                                                        </label>
                                                        <input
                                                            id="event_end_date"
                                                            type="date"
                                                            name="event_end_date"
                                                            min={editingAnnouncement?.event_date ?? undefined}
                                                            defaultValue={editingAnnouncement?.event_end_date ?? editingAnnouncement?.event_date ?? ''}
                                                            required
                                                            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                                                        />
                                                        {errors.event_end_date && <p className="mt-1 text-xs font-bold text-red-600">{errors.event_end_date}</p>}
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-3">
                                                        <div>
                                                            <label htmlFor="start_time" className="block text-xs font-bold text-slate-700 mb-1">Start time</label>
                                                            <input
                                                                id="start_time"
                                                                type="time"
                                                                name="start_time"
                                                                defaultValue={editingAnnouncement?.start_time?.slice(0, 5) ?? ''}
                                                                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                                                            />
                                                            {errors.start_time && <p className="mt-1 text-xs font-bold text-red-600">{errors.start_time}</p>}
                                                        </div>
                                                        <div>
                                                            <label htmlFor="end_time" className="block text-xs font-bold text-slate-700 mb-1">End time</label>
                                                            <input
                                                                id="end_time"
                                                                type="time"
                                                                name="end_time"
                                                                defaultValue={editingAnnouncement?.end_time?.slice(0, 5) ?? ''}
                                                                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                                                            />
                                                            {errors.end_time && <p className="mt-1 text-xs font-bold text-red-600">{errors.end_time}</p>}
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <label htmlFor="location" className="block text-xs font-bold text-slate-700 mb-1">
                                                            Location <span className="text-rose-500">*</span>
                                                        </label>
                                                        <input
                                                            id="location"
                                                            type="text"
                                                            name="location"
                                                            defaultValue={editingAnnouncement?.location ?? ''}
                                                            required
                                                            maxLength={255}
                                                            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                                                        />
                                                        {errors.location && <p className="mt-1 text-xs font-bold text-red-600">{errors.location}</p>}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    </>
                                )}
                            </Form>
                        </div>
                    </div>
                )}

                {/* Delete Modal */}
                {announcementToDelete && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in">
                        <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-6 sm:p-8 animate-scale-in text-center">
                            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-red-50 mx-auto mb-5">
                                <i className="fa-solid fa-triangle-exclamation text-red-500 text-2xl"></i>
                            </div>
                            <h3 className="text-xl font-extrabold text-slate-900 mb-2">Delete Announcement</h3>
                            <p className="text-sm font-medium text-slate-500 mb-8">Are you sure you want to delete <strong className="text-slate-800">"{announcementToDelete.title}"</strong>?</p>
                            <div className="flex gap-3">
                                <button onClick={() => setAnnouncementToDelete(null)} className="flex-1 border border-slate-200 text-slate-700 font-bold py-3 rounded-xl hover:bg-slate-50">Cancel</button>
                                <button onClick={() => {
                                    setIsDeletingAnnouncement(true);
                                    router.post(`${panelBase}/announcements/${announcementToDelete.id}`, { _method: 'delete' }, {
                                        onSuccess: () => setAnnouncementToDelete(null),
                                        onFinish: () => setIsDeletingAnnouncement(false),
                                    });
                                }} className="flex-1 bg-red-600 text-white font-bold py-3 rounded-xl hover:bg-red-700 disabled:opacity-60">
                                    {isDeletingAnnouncement ? 'Deleting...' : 'Delete'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </>
    );
}