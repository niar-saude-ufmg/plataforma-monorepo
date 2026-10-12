import { dev } from '$app/environment';
import { env } from '$env/dynamic/public';

/**
 * Origem da plataforma (apps/shell), onde ficam o cadastro de pesquisador e o
 * assistente. Vem do .env da raiz (kit.env.dir) ou do build arg do Docker:
 *   dev      -> http://localhost:5173 (fallback abaixo se não houver .env)
 *   produção -> vazio: mesma origem, e o Caddy repassa /cadastro/* e /assistente/* à shell.
 *
 * Os links para a plataforma são navegação comum (página inteira), não rotas do
 * SvelteKit — por isso não passam por `resolve` nem por `localizeHref`.
 */
const PLATFORM_URL = (env.PUBLIC_PLATFORM_URL ?? (dev ? 'http://localhost:5173' : '')).replace(
	/\/$/,
	''
);

export const platformHref = (path: `/${string}`) => `${PLATFORM_URL}${path}`;
