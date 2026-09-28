import { error } from '@sveltejs/kit';
import { news, getNewsItem, isInternalArticle } from '$lib/data/news';
import type { EntryGenerator, PageLoad } from './$types';

// Prerender one page per internally-hosted article so adapter-static emits them.
export const entries: EntryGenerator = () =>
	news.filter(isInternalArticle).map((item) => ({ slug: item.id }));

export const load: PageLoad = ({ params }) => {
	const item = getNewsItem(params.slug);
	if (!item || !isInternalArticle(item)) {
		error(404, 'Notícia não encontrada');
	}
	return { item };
};
