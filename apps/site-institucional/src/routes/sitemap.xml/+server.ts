import { locales, localizeHref } from '$lib/paraglide/runtime';
import { news, isInternalArticle } from '$lib/data/news';
import { absoluteUrl } from '$lib/seo';

// Prerenderizado junto com o resto do site: o adapter estático emite /sitemap.xml
// como arquivo, sem precisar de servidor.
export const prerender = true;

/** Rotas fixas. As notícias internas entram abaixo, a partir de `news`. */
const staticPaths = ['/', '/about', '/news', '/publications', '/team', '/assistant', '/contact'];

export function GET() {
	const paths = [
		...staticPaths,
		...news.filter(isInternalArticle).map((item) => `/news/${item.id}`)
	];

	// Uma entrada por página e por idioma, cada uma listando as demais como alternativas
	// hreflang — é assim que o Google entende PT e EN como versões da mesma página.
	const urls = paths
		.flatMap((path) =>
			locales.map((locale) => {
				const alternates = locales
					.map(
						(alt) =>
							`\t\t<xhtml:link rel="alternate" hreflang="${alt}" href="${absoluteUrl(localizeHref(path, { locale: alt }))}" />`
					)
					.join('\n');

				return `\t<url>\n\t\t<loc>${absoluteUrl(localizeHref(path, { locale }))}</loc>\n${alternates}\n\t</url>`;
			})
		)
		.join('\n');

	const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls}
</urlset>
`;

	return new Response(xml, {
		headers: { 'Content-Type': 'application/xml' }
	});
}
