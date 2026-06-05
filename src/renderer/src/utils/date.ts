/**
 * Formats an ISO datetime string to a more human-readable format
 * Converts "2025-04-18T08:49:38+00:00" to "2025-04-18 08:49:38"
 *
 * @param datetime ISO datetime string
 * @returns Formatted datetime string
 */
export const formatDatetime = (datetime: string): string => {
    if (!datetime) return "";

    // Replace 'T' with space and remove timezone information
    return datetime.replace("T", " ").replace(/(\+|-)\d{2}:\d{2}$|Z$/, "");
};
