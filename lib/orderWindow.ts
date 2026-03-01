const TIMEZONE = "America/Los_Angeles";
const OPEN_DAY = 2; // Tuesday (1=Mon … 7=Sun)
const OPEN_HOUR = 8;
const OPEN_MINUTE = 30;
const CLOSE_HOUR = 22;
const CLOSE_MINUTE = 0;

const DAY_MAP: Record<string, number> = {
  Sun: 7, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6,
};

/** Extract weekday/hour/minute in America/Los_Angeles from a UTC Date. */
function partsInPT(date: Date) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: TIMEZONE,
    hour12: false,
    weekday: "short",
    hour: "numeric",
    minute: "numeric",
  }).formatToParts(date);

  const get = (type: string) =>
    parts.find((p) => p.type === type)?.value ?? "";

  return {
    weekday: DAY_MAP[get("weekday")] ?? 0,
    hour: Number(get("hour")),
    minute: Number(get("minute")),
  };
}

/**
 * Returns true if the order window is currently open.
 * Open window: Tuesday 08:30–22:00 America/Los_Angeles.
 */
export function isOrderWindowOpen(now: Date): boolean {
  const { weekday, hour, minute } = partsInPT(now);
  if (weekday !== OPEN_DAY) return false;

  const time = hour * 60 + minute;
  return time >= OPEN_HOUR * 60 + OPEN_MINUTE && time < CLOSE_HOUR * 60 + CLOSE_MINUTE;
}

/**
 * Returns the UTC Date of the next Tuesday at 08:30 AM PT.
 * If it's currently before the open window on Tuesday, returns today's open.
 * If the window has already closed (or it's any other day), returns next Tuesday.
 */
export function getNextOrderWindow(now: Date): Date {
  const { weekday, hour, minute } = partsInPT(now);
  const time = hour * 60 + minute;

  let daysUntil: number;
  if (weekday === OPEN_DAY && time < OPEN_HOUR * 60 + OPEN_MINUTE) {
    daysUntil = 0;
  } else if (weekday < OPEN_DAY) {
    daysUntil = OPEN_DAY - weekday;
  } else {
    // Tuesday after open, or Wed–Sun → next Tuesday
    daysUntil = (OPEN_DAY - weekday + 7) % 7 || 7;
  }

  // Start from midnight-ish UTC on the current PT date, then add days.
  // We find today's PT date via Intl, build a naive UTC date at the target
  // PT time, then correct for the actual UTC offset.
  const ptDateStr = new Intl.DateTimeFormat("en-US", {
    timeZone: TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);

  const [month, day, year] = ptDateStr.split("/").map(Number);

  // Build a "naive" date as if PT were UTC
  const naive = new Date(
    Date.UTC(year, month - 1, day + daysUntil, OPEN_HOUR, OPEN_MINUTE)
  );

  // Determine actual PT offset at that moment by reading back what PT shows
  const check = new Intl.DateTimeFormat("en-US", {
    timeZone: TIMEZONE,
    hour12: false,
    hour: "numeric",
    minute: "numeric",
  }).formatToParts(naive);

  const checkH = Number(check.find((p) => p.type === "hour")?.value ?? "0");
  const checkM = Number(check.find((p) => p.type === "minute")?.value ?? "0");
  const drift = (checkH * 60 + checkM) - (OPEN_HOUR * 60 + OPEN_MINUTE);

  naive.setMinutes(naive.getMinutes() - drift);
  return naive;
}
