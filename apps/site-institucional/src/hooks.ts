import type { Reroute } from '@sveltejs/kit';
import { deLocalizeUrl } from '$lib/paraglide/runtime';

// Maps a localized URL (e.g. /en/about) back to the underlying route (/about)
// so a single set of pages serves every locale.
export const reroute: Reroute = (request) => deLocalizeUrl(request.url).pathname;
