const TIMEZONE = "America/Los_Angeles";

export function parseConfigResponse(values: string[][]): Record<string, string> {
  const map: Record<string, string> = {};
  for (let i = 1; i < values.length; i++) {
    const [key, value] = values[i];
    if (key) map[key] = value ?? "";
  }
  return map;
}

const DEFAULT_BUNDLES = [5, 10, 15];

export function parseBundles(str: string): number[] {
  try {
    const parsed = JSON.parse(str);
    if (!Array.isArray(parsed)) return DEFAULT_BUNDLES;
    const nums = parsed.filter((x): x is number => typeof x === "number");
    return nums.length > 0 ? nums : DEFAULT_BUNDLES;
  } catch {
    return DEFAULT_BUNDLES;
  }
}

export function computePricing(
  unitPriceStr: string,
  quantities: number[],
): { qty: number; total: string }[] {
  const price = parseFloat(unitPriceStr.replace("$", ""));
  if (isNaN(price)) return [];
  return quantities.map((qty) => ({
    qty,
    total: (qty * price).toFixed(2),
  }));
}

const DOW_MAP: Record<string, number> = {
  Sunday: 0, Monday: 1, Tuesday: 2, Wednesday: 3, Thursday: 4, Friday: 5, Saturday: 6,
};

export function getNextPickupDate(now: Date, dow?: string): string {
  const dayFmt = new Intl.DateTimeFormat("en-US", {
    timeZone: TIMEZONE,
    weekday: "short",
  });
  const dayMap: Record<string, number> = {
    Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6,
  };

  const ptDay = dayMap[dayFmt.format(now)] ?? 0;
  const targetDay = (dow && dow in DOW_MAP) ? DOW_MAP[dow] : 6;
  const daysUntil = (targetDay - ptDay + 7) % 7;

  const dateFmt = new Intl.DateTimeFormat("en-US", {
    timeZone: TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const [month, day, year] = dateFmt.format(now).split("/").map(Number);
  const target = new Date(year, month - 1, day + daysUntil);

  const displayFmt = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
  return displayFmt.format(target);
}
