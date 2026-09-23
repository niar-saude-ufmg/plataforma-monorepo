import type { Localized } from '$lib/i18n';

/**
 * As imagens de cada notícia moram em `src/lib/assets/news/<id>/`, com nomes
 * fixos: `foto-1`, `foto-2`, `foto-3` (na ordem em que aparecem na matéria) e,
 * opcionalmente, `cover` — um recorte só para os cards. A extensão é livre.
 * Por isso nenhuma notícia aqui escreve caminho de imagem: a pasta é o `id` e a
 * posição na lista `photos` dá o nome do arquivo.
 *
 * Arquivos que não vão ao ar (enquadramentos alternativos, originais) ficam em
 * uma subpasta, ex.: `<id>/nao-usadas/`, fora do alcance deste glob — senão
 * entrariam no build sem nunca serem exibidos.
 */
const arquivos = import.meta.glob('$lib/assets/news/*/*.{jpg,jpeg,png,webp,avif}', {
	eager: true,
	query: '?url',
	import: 'default'
}) as Record<string, string>;

/** `<id>/<nome sem extensão>` → URL final do asset. */
const porNome = new Map(
	Object.entries(arquivos).map(([caminho, url]) => {
		const chave = caminho.match(/\/news\/([^/]+\/[^/]+)\.[^.]+$/)?.[1];
		return [chave ?? caminho, url];
	})
);

/**
 * URL da imagem `<nome>` da notícia `<id>`. Explode na carga do módulo — ou
 * seja, no build, já que o site é pré-renderizado — se o arquivo não existir.
 */
function asset(id: string, nome: string): string {
	const url = porNome.get(`${id}/${nome}`);
	if (!url) {
		throw new Error(`Notícia “${id}”: falta o arquivo src/lib/assets/news/${id}/${nome}.*`);
	}
	return url;
}

export type NewsCategory = 'event' | 'award' | 'media' | 'post' | 'publication' | 'partnership';

/** Uma foto da notícia, com seu texto alternativo e legenda próprios. */
export type NewsPhoto = {
	src: string;
	/** Descrição para leitores de tela. Obrigatória. */
	alt: Localized;
	/**
	 * Legenda visível sob a foto na página da matéria. Opcional — use em fotos
	 * editoriais (eventos, pessoas), não em imagens decorativas. O `alt` é para
	 * quem não vê a foto; a legenda é para todo mundo.
	 */
	caption?: Localized;
	/**
	 * CSS `object-position` (ex.: 'left', 'center 25%'), para manter o assunto
	 * no enquadramento quando o template recorta a foto. Padrão: centralizado.
	 */
	position?: string;
};

/**
 * Template da galeria na página da matéria. O nome diz a quantidade de fotos e
 * o arranjo; `galleryOptions` lista as opções válidas para cada quantidade, que
 * é o que a futura tela de cadastro vai oferecer depois que a pessoa escolher
 * quantas fotos quer enviar.
 */
export type NewsGallery =
	/** 1 foto horizontal, largura inteira, recortada em 16:9. */
	| 'wide'
	/** 1 foto vertical, inteira e sem recorte, em coluna estreita centralizada. */
	| 'tall'
	/** 2 fotos lado a lado, mesma altura, recorte 4:5 (bom para verticais). */
	| 'duo'
	/** 2 fotos empilhadas, cada uma em 16:9 (bom para horizontais). */
	| 'duo-stacked'
	/**
	 * 2 fotos verticais escalonadas dentro do texto: a primeira à direita, no
	 * alto, e a segunda à esquerda, mais abaixo, com os parágrafos contornando
	 * as duas. No celular viram blocos de largura inteira, em ordem.
	 */
	| 'duo-float-right'
	/** Igual ao anterior, começando pela esquerda. */
	| 'duo-float-left'
	/** 3 fotos lado a lado, recorte 4:5. */
	| 'trio'
	/** 3 fotos: uma em 16:9 no topo e duas menores abaixo. */
	| 'trio-lead';

/** Templates disponíveis para cada quantidade de fotos. */
export const galleryOptions: Record<1 | 2 | 3, NewsGallery[]> = {
	1: ['wide', 'tall'],
	2: ['duo', 'duo-stacked', 'duo-float-right', 'duo-float-left'],
	3: ['trio', 'trio-lead']
};

export type NewsItem = {
	id: string;
	date: string;
	category: NewsCategory;
	title: Localized;
	excerpt: Localized;
	/**
	 * De 1 a 3 fotos, na ordem dos arquivos `foto-1`, `foto-2`, `foto-3` da
	 * pasta da notícia. A primeira também alimenta os cards, salvo se houver
	 * `cover`.
	 */
	photos: NewsPhoto[];
	/** Arranjo das fotos na matéria. Precisa constar de `galleryOptions[photos.length]`. */
	gallery?: NewsGallery;
	/**
	 * Imagem dos cards (lista e carrossel), que recortam sempre em 16:9. Use
	 * quando nenhuma foto da galeria sobrevive ao recorte — uma vertical, por
	 * exemplo. Sem isso, vale a primeira foto.
	 */
	cover?: { src: string; position?: string };
	/** External URL, opened in a new tab. Ignored when `body` is present. */
	link?: string;
	/**
	 * Full article content, as paragraphs, for news we publish ourselves.
	 * When present, the "read more" link points to the internal page
	 * `/news/<id>` instead of to an external site.
	 */
	body?: Localized[];
};

/**
 * A notícia como se escreve na lista abaixo: sem caminho nenhum. Cada foto vira
 * `<id>/foto-<n>` pela posição, e `cover` aponta para uma das fotos (`photo`,
 * contando de 1) ou, sem isso, para o arquivo `<id>/cover.*`.
 */
type NewsInput = Omit<NewsItem, 'photos' | 'cover'> & {
	photos: Omit<NewsPhoto, 'src'>[];
	cover?: { photo?: number; position?: string };
};

/** Preenche os `src` de uma notícia a partir da convenção de nomes. */
function resolver({ cover, ...item }: NewsInput): NewsItem {
	const photos = item.photos.map((photo, i) => ({
		...photo,
		src: asset(item.id, `foto-${i + 1}`)
	}));
	if (!cover) return { ...item, photos };
	const src = cover.photo ? photos[cover.photo - 1].src : asset(item.id, 'cover');
	return { ...item, photos, cover: { src, position: cover.position } };
}

/** Foto dos cards, com o `object-position` que o recorte 16:9 precisa. */
export function cardPhoto(item: NewsItem): { src: string; position?: string; alt: Localized } {
	const primeira = item.photos[0];
	return {
		src: item.cover?.src ?? primeira.src,
		position: item.cover ? item.cover.position : primeira.position,
		alt: primeira.alt
	};
}

/** Whether the item links to an internally-hosted article page (`/news/<id>`). */
export function isInternalArticle(item: NewsItem): boolean {
	return Array.isArray(item.body) && item.body.length > 0;
}

const items: NewsInput[] = [
	{
		id: 'niar-na-data-for-policy-2026',
		date: '2026-09-17',
		category: 'event',
		title: {
			pt: 'NIAR-Saúde apresenta framework de governança de IA na Data for Policy 2026',
			en: 'NIAR-Saúde presents AI governance framework at Data for Policy 2026'
		},
		excerpt: {
			pt: 'Na 10ª edição da conferência, em Barcelona, o grupo apresentou o FIAR, que traduz princípios de IA responsável em evidências e níveis de maturidade para o acompanhamento contínuo de sistemas.',
			en: 'At the conference’s 10th edition, in Barcelona, the group presented FIAR, which turns responsible AI principles into evidence and maturity levels for the continuous oversight of systems.'
		},
		gallery: 'duo-float-right',
		photos: [
			{
				alt: {
					pt: 'Marisa Vasconcelos apresenta o trabalho do NIAR-Saúde na Data for Policy 2026, com o slide do FIAR projetado ao fundo',
					en: 'Marisa Vasconcelos presents NIAR-Saúde’s work at Data for Policy 2026, with the FIAR slide projected behind her'
				},
				caption: {
					pt: 'Marisa Vasconcelos apresenta o trabalho do NIAR-Saúde na Data for Policy 2026.',
					en: 'Marisa Vasconcelos presents NIAR-Saúde’s work at Data for Policy 2026.'
				},
				position: 'center 70%'
			},
			{
				alt: {
					pt: 'Slide de abertura da sessão “Participatory AI and Public Perception”, com a lista de palestrantes',
					en: 'Opening slide of the “Participatory AI and Public Perception” session, listing the speakers'
				},
				caption: {
					pt: 'A sessão “Participatory AI and Public Perception”, no primeiro dia da conferência, em Barcelona (Espanha).',
					en: 'The “Participatory AI and Public Perception” session, on the conference’s first day, in Barcelona, Spain.'
				},
				position: 'center 25%'
			}
		],
		cover: { photo: 2, position: 'center 25%' },
		body: [
			{
				pt: 'O NIAR-Saúde participou da 10ª edição da Data for Policy, realizada entre 8 e 10 de setembro de 2026 na Universitat Pompeu Fabra, em Barcelona, na Espanha. Com o tema “Governance of/with AI: Implications for Data, Infrastructure, and Tech Sovereignty”, a conferência reuniu pesquisadores, formuladores de políticas públicas e profissionais de diferentes países para discutir os impactos da inteligência artificial sobre a governança e a tomada de decisão.',
				en: 'NIAR-Saúde took part in the 10th edition of Data for Policy, held from 8 to 10 September 2026 at Universitat Pompeu Fabra in Barcelona, Spain. Under the theme “Governance of/with AI: Implications for Data, Infrastructure, and Tech Sovereignty”, the conference brought together researchers, policymakers and practitioners from different countries to discuss the impacts of artificial intelligence on governance and decision-making.'
			},
			{
				pt: 'Durante o evento, o grupo apresentou o trabalho “From Principles to Longitudinal AI Governance: An Evidence-Based Framework for Continuous Oversight”, que investiga como princípios de IA responsável podem ser traduzidos em práticas concretas de governança e acompanhamento contínuo de sistemas de inteligência artificial.',
				en: 'During the event, the group presented the work “From Principles to Longitudinal AI Governance: An Evidence-Based Framework for Continuous Oversight”, which investigates how responsible AI principles can be translated into concrete practices of governance and continuous oversight of artificial intelligence systems.'
			},
			{
				pt: 'O artigo apresenta o FIAR (Framework for Institutional AI Responsibility), uma proposta que organiza a governança de IA a partir da produção e da avaliação de evidências relacionadas a diferentes dimensões de responsabilidade. O framework também estabelece níveis de maturidade que representam a evolução dessas práticas, desde iniciativas pontuais até processos institucionalizados de acompanhamento contínuo.',
				en: 'The paper introduces FIAR (Framework for Institutional AI Responsibility), a proposal that organizes AI governance around the production and assessment of evidence related to different dimensions of responsibility. The framework also establishes maturity levels representing how these practices evolve, from isolated initiatives to institutionalized processes of continuous oversight.'
			},
			{
				pt: 'A aplicação é ilustrada por meio de um modelo de previsão de internações por doenças respiratórias desenvolvido com dados do SUS. O estudo de caso demonstra como evidências relacionadas a aspectos como desempenho, justiça e explicabilidade podem ser incorporadas à governança do sistema, em conjunto com a definição de responsabilidades institucionais e mecanismos de monitoramento ao longo de seu ciclo de vida.',
				en: 'Its application is illustrated through a model for forecasting hospitalizations due to respiratory diseases, developed with data from Brazil’s Unified Health System (SUS). The case study shows how evidence on aspects such as performance, fairness and explainability can be incorporated into the system’s governance, together with the definition of institutional responsibilities and monitoring mechanisms throughout its lifecycle.'
			},
			{
				pt: 'Com isso, o trabalho busca aproximar os princípios de IA responsável da prática institucional, oferecendo uma abordagem estruturada e baseada em evidências para acompanhar sistemas de IA desde seu desenvolvimento e avaliação até sua utilização e eventuais modificações.',
				en: 'In doing so, the work seeks to bring responsible AI principles closer to institutional practice, offering a structured, evidence-based approach to monitoring AI systems from development and evaluation through to use and any subsequent changes.'
			},
			{
				pt: 'A versão completa do trabalho está disponível nos anais da Data for Policy 2026 e pode ser acessada na página de publicações do NIAR-Saúde.',
				en: 'The full version of the work is available in the Data for Policy 2026 proceedings and can be accessed on NIAR-Saúde’s publications page.'
			}
		]
	},
	{
		id: 'sala-segura-primeira-do-pais',
		date: '2026-03-10',
		category: 'media',
		title: {
			pt: 'UFMG é a primeira universidade do país a contar com sala segura para uso de dados sensíveis em saúde',
			en: 'UFMG becomes the first university in Brazil with a secure room for sensitive health data'
		},
		excerpt: {
			pt: 'Ambiente inédito no país viabiliza o tratamento de dados sensíveis e o desenvolvimento de soluções de IA para aprimorar diagnósticos, prognósticos e tratamentos.',
			en: 'The country’s first such environment enables sensitive-data processing and AI solutions to improve diagnoses, prognoses and treatments.'
		},
		photos: [
			{
				alt: {
					pt: 'Sala segura da UFMG para uso de dados sensíveis em saúde',
					en: 'UFMG’s secure room for handling sensitive health data'
				}
			}
		],
		link: 'https://www.ufmg.br/comunicacao/noticias/saude/ufmg-e-a-primeira-universidade-do-pais-a-contar-com-sala-segura-para-uso-de-dados-sensiveis-em-saude/'
	},
	{
		id: 'sala-segura-inaugurada',
		date: '2026-03-09',
		category: 'event',
		title: {
			pt: 'Sala Segura do NIAR-Saúde é inaugurada para ampliar pesquisas com IA e dados de saúde',
			en: 'NIAR-Saúde’s Secure Room is inaugurated to expand research with AI and health data'
		},
		excerpt: {
			pt: 'Novo espaço na Faculdade de Medicina da UFMG permite desenvolver análises e modelos de IA aplicados à saúde em um ambiente controlado, monitorado e auditável.',
			en: 'New space at UFMG’s Medical School lets AI analyses and models for health be developed in a controlled, monitored and auditable environment.'
		},
		photos: [
			{
				alt: {
					pt: 'Inauguração da Sala Segura do NIAR-Saúde na Faculdade de Medicina da UFMG',
					en: 'Inauguration of NIAR-Saúde’s Secure Room at UFMG’s Medical School'
				}
			}
		],
		link: 'https://dcc.ufmg.br/sala-segura-do-niar-saude-e-inaugurada-para-ampliar-pesquisas-com-ia-e-dados-de-saude/'
	},
	{
		id: 'niar-no-sbcas-2026',
		date: '2026-06-04',
		category: 'event',
		title: {
			pt: 'NIAR-Saúde apresenta artigo sobre IA responsável no SBCAS 2026',
			en: 'NIAR-Saúde presents paper on responsible AI at SBCAS 2026'
		},
		excerpt: {
			pt: 'O grupo levou ao Simpósio Brasileiro de Computação Aplicada à Saúde um trabalho sobre previsão de internações respiratórias com dados do SUS e uso responsável de inteligência artificial.',
			en: 'The group brought to the Brazilian Symposium on Computing Applied to Health a study on forecasting respiratory hospitalizations with SUS data and the responsible use of artificial intelligence.'
		},
		gallery: 'wide',
		photos: [
			{
				alt: {
					pt: 'Ramon Pereira apresenta o artigo do NIAR-Saúde no SBCAS 2026, em Ouro Preto',
					en: 'Ramon Pereira presents NIAR-Saúde’s paper at SBCAS 2026 in Ouro Preto'
				},
				caption: {
					pt: 'Ramon G. Pereira apresenta o artigo do NIAR-Saúde no SBCAS 2026, em Ouro Preto (MG).',
					en: 'Ramon G. Pereira presents NIAR-Saúde’s paper at SBCAS 2026 in Ouro Preto (MG).'
				},
				position: '15% center'
			}
		],
		body: [
			{
				pt: 'O NIAR-Saúde marcou presença no XXVI Simpósio Brasileiro de Computação Aplicada à Saúde (SBCAS 2026), realizado de 1º a 4 de junho de 2026 em Ouro Preto (MG), no Centro de Artes e Convenções da UFOP. O SBCAS é um dos principais fóruns de encontro entre pesquisadores das áreas de computação e saúde no país.',
				en: 'NIAR-Saúde took part in the 26th Brazilian Symposium on Computing Applied to Health (SBCAS 2026), held from June 1–4, 2026, in Ouro Preto (MG), at UFOP’s Arts and Conventions Center. SBCAS is one of the country’s leading forums bringing together researchers from the computing and health fields.'
			},
			{
				pt: 'Na ocasião, o grupo apresentou o artigo “Responsible AI for Public Health: A Methodological Illustration with a Forecasting Model applied to Respiratory Hospitalizations on SUS Data”, publicado nos anais do simpósio. O trabalho utiliza dados do Sistema Único de Saúde (SUS) para ilustrar, na prática, como construir modelos de previsão de internações por causas respiratórias com foco no rigor metodológico.',
				en: 'On the occasion, the group presented the paper “Responsible AI for Public Health: A Methodological Illustration with a Forecasting Model applied to Respiratory Hospitalizations on SUS Data”, published in the symposium proceedings. The work uses data from Brazil’s Unified Health System (SUS) to illustrate, in practice, how to build forecasting models for respiratory hospitalizations with a focus on methodological rigor.'
			},
			{
				pt: 'O estudo é um dos primeiros trabalhos a aplicar o framework desenvolvido pelo NIAR para avaliação de responsabilidade em modelos de aprendizado de máquina. Como exemplo ilustrativo, são apresentadas análises de justiça entre diferentes unidades federativas do Brasil, além de procedimentos de auditoria e explicabilidade que permitem compreender melhor o comportamento e os possíveis impactos do modelo.',
				en: 'The study is one of the first works to apply the framework developed by NIAR for assessing responsibility in machine learning models. As an illustrative example, it presents fairness analyses across different Brazilian federative units, along with auditing and explainability procedures that allow a better understanding of the model’s behavior and its potential impacts.'
			},
			{
				pt: 'Ao priorizar aspectos para além do desempenho preditivo, tais como transparência, reprodutibilidade e mitigação de vieses, o trabalho reforça o compromisso do NIAR-Saúde com o desenvolvimento de soluções de inteligência artificial confiáveis para apoiar a saúde pública. O artigo é assinado por Ramon G. Pereira, Luís Eduardo Limas Brito, Italo Avelar, Matheus Carvalho, Marisa Vasconcelos, Michele A. Brandão e Wagner Meira Jr.',
				en: 'By prioritizing aspects beyond predictive performance — such as transparency, reproducibility, and bias mitigation — the work reinforces NIAR-Saúde’s commitment to developing trustworthy artificial intelligence solutions to support public health. The paper is authored by Ramon G. Pereira, Luís Eduardo Limas Brito, Italo Avelar, Matheus Carvalho, Marisa Vasconcelos, Michele A. Brandão, and Wagner Meira Jr.'
			},
			{
				pt: 'A versão completa do trabalho está disponível nos anais do SBCAS 2026 e pode ser acessada na página de publicações.',
				en: 'The full version of the work is available in the SBCAS 2026 proceedings and can be accessed on the publications page.'
			}
		]
	}
];

export const news: NewsItem[] = items.map(resolver).sort((a, b) => b.date.localeCompare(a.date));

/** Looks up a news item by its id (used by the internal article route). */
export function getNewsItem(id: string): NewsItem | undefined {
	return news.find((item) => item.id === id);
}
