/**
 * Constantes e helpers de SEO compartilhados pelo layout, pelas páginas e pelo sitemap.
 */

/**
 * Origem de produção. Usada para montar URLs absolutas (canonical, hreflang, sitemap,
 * JSON-LD), que o Google exige totalmente qualificadas. Trocar aqui se o domínio mudar.
 */
export const SITE_URL = 'https://www.niar.dcc.ufmg.br';

/** Nome curto do site, usado como sufixo dos títulos e no JSON-LD. */
export const SITE_NAME = 'NIAR-Saúde';

/**
 * Sufixa o título da página com o nome do site.
 *
 * Sem isso, cada aba (e cada resultado de busca) mostra só "Equipe" ou "Assistente",
 * sem dizer de quem é o site. A home não usa este helper: o título dela já começa
 * pelo nome, porque é o resultado que as pessoas veem ao buscar pelo laboratório.
 */
export const pageTitle = (title: string) => `${title} | ${SITE_NAME}`;

/** `trailingSlash` é 'always', então toda URL absoluta precisa terminar em barra. */
export const ensureSlash = (path: string) => (path.endsWith('/') ? path : `${path}/`);

/** URL absoluta de um caminho interno, pronta para canonical/sitemap. */
export const absoluteUrl = (path: string) => `${SITE_URL}${ensureSlash(path)}`;
