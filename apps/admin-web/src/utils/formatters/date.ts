type DateFormatterOptions = {
  fallback?: string;
};

const toDate = (value?: string): Date | null => {
  if (!value) return null;

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

export function formatDate(
  value?: string,
  { fallback = "Data não informada" }: DateFormatterOptions = {},
): string {
  const date = toDate(value);
  return date
    ? new Intl.DateTimeFormat("pt-BR", { timeZone: "UTC" }).format(date)
    : fallback;
}

export function formatDateTime(
  value?: string,
  { fallback = "Data não informada" }: DateFormatterOptions = {},
): string {
  const date = toDate(value);
  return date
    ? new Intl.DateTimeFormat("pt-BR", {
        dateStyle: "short",
        timeStyle: "short",
        timeZone: "UTC",
      }).format(date)
    : fallback;
}
