/**
 * Escapes unsafe HTML characters to prevent XSS in email bodies.
 */
export function escapeHtml(str?: string | null): string {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Validates whether an IANA timezone string is recognized by Intl.
 */
function isValidTimezone(tz?: string): boolean {
  if (!tz || typeof tz !== 'string') return false;
  try {
    Intl.DateTimeFormat(undefined, { timeZone: tz.trim() });
    return true;
  } catch {
    return false;
  }
}

/**
 * Resolves a safe timezone string, defaulting to 'Asia/Kolkata'.
 */
export function resolveSafeTimezone(tz?: string | null): string {
  if (tz && isValidTimezone(tz)) {
    return tz.trim();
  }
  return 'Asia/Kolkata';
}

/**
 * Formats a Date into a human-readable date string in the target timezone.
 * Example: "Monday, October 26, 2026"
 */
export function formatBookingDate(date: Date | string, timezone: string = 'Asia/Kolkata'): string {
  const d = date instanceof Date ? date : new Date(date);
  if (isNaN(d.getTime())) return 'Scheduled Date';
  const tz = resolveSafeTimezone(timezone);
  try {
    return new Intl.DateTimeFormat('en-US', {
      timeZone: tz,
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(d);
  } catch {
    return d.toDateString();
  }
}

/**
 * Formats a start and end Date into a human-readable time range string in the target timezone.
 * Example: "13:00 – 14:00 (01:00 PM – 02:00 PM)"
 */
export function formatBookingTimeRange(
  start: Date | string,
  end: Date | string,
  timezone: string = 'Asia/Kolkata'
): string {
  const s = start instanceof Date ? start : new Date(start);
  const e = end instanceof Date ? end : new Date(end);
  if (isNaN(s.getTime()) || isNaN(e.getTime())) return 'Scheduled Time';
  const tz = resolveSafeTimezone(timezone);
  try {
    const s24 = new Intl.DateTimeFormat('en-US', {
      timeZone: tz,
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(s);
    const e24 = new Intl.DateTimeFormat('en-US', {
      timeZone: tz,
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(e);
    const s12 = new Intl.DateTimeFormat('en-US', {
      timeZone: tz,
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).format(s);
    const e12 = new Intl.DateTimeFormat('en-US', {
      timeZone: tz,
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).format(e);
    return `${s24} – ${e24} (${s12} – ${e12})`;
  } catch {
    return `${s.toISOString()} - ${e.toISOString()}`;
  }
}

/**
 * Formats session duration into a clean string.
 * Example: "60 minutes"
 */
export function formatBookingDuration(minutes?: number | null): string {
  if (!minutes || minutes <= 0) return '45 minutes';
  if (minutes === 60) return '60 minutes';
  return `${minutes} minutes`;
}

/**
 * Extracts a friendly recipient greeting name.
 * Example: "Yaswanth Rajana" -> "Yaswanth Rajana"
 */
export function extractRecipientGreeting(name?: string | null): string {
  if (!name || !name.trim()) return 'there';
  return name.trim();
}
