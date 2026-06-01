import { getLocale } from '$lib/paraglide/runtime';

const LOCALE_MAP: Record<string, string> = {
	pt: 'pt-BR',
	en: 'en-US'
};

/**
 * Formats an ISO date string ('YYYY-MM-DD') as a long-form date in the active locale.
 * Parses the date components manually to avoid UTC interpretation by `new Date(string)`,
 * which would shift the displayed day in negative-UTC timezones (e.g., America/Sao_Paulo).
 */
export function formatNewsDate(iso: string): string {
	const [y, m, d] = iso.split('-').map(Number);
	const date = new Date(y, m - 1, d);
	const locale = LOCALE_MAP[getLocale()] ?? 'pt-BR';
	return new Intl.DateTimeFormat(locale, {
		day: '2-digit',
		month: 'long',
		year: 'numeric'
	}).format(date);
}
