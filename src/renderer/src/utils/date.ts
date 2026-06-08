/**
 * Formats an ISO datetime string as local wall-clock time.
 *
 * Backend timestamps are stored in UTC (e.g. "2025-04-18T08:49:38+00:00").
 * The offset is what lets us pin the exact instant, so we parse it and render
 * it in the machine's local timezone — "2025-04-18 10:49:38" for a UTC+2 host.
 *
 * @param datetime ISO datetime string
 * @returns Formatted "YYYY-MM-DD HH:MM:SS" in local time
 */
export const formatDatetime = (datetime: string): string => {
    if (!datetime) return "";

    const d = new Date(datetime);
    if (isNaN(d.getTime())) {
        // Not parseable — fall back to stripping the T/offset as-is.
        return datetime.replace("T", " ").replace(/(\+|-)\d{2}:\d{2}$|Z$/, "");
    }

    const pad = (n: number) => String(n).padStart(2, "0");
    return (
        `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ` +
        `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
    );
};
