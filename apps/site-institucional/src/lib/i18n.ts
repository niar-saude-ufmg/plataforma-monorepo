import { getLocale, baseLocale } from '$lib/paraglide/runtime';

/**
 * A piece of content that exists in both languages, stored side by side.
 * Used for structured data (team roles, objectives, milestones, …) that lives
 * in the route files rather than in messages/{locale}.json.
 */
export type Localized = { pt: string; en: string };

/** Picks the string for the active locale, falling back to the base locale. */
export function t(value: Localized): string {
	const locale = getLocale() as keyof Localized;
	return value[locale] ?? value[baseLocale as keyof Localized];
}
