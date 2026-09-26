// Site institucional (apps/site-institucional). Não é uma rota React da shell:
// em produção o Caddy serve o site em "/", e em dev ele roda em outra porta.
export const SITE_URL = import.meta.env.VITE_SITE_URL || "/";
