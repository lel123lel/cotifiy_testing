export const summarizeAnnouncement = (body = '') => {
    const text = body
        .replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1')
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
        .replace(/[`*_~>#]/g, '')
        .replace(/\s+/g, ' ')
        .trim();

    if (!text) return 'No summary available.';
    return text.length > 180 ? `${text.slice(0, 177).trimEnd()}...` : text;
};
