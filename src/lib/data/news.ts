import type { Localized } from '$lib/i18n';
import salaSeguraPais from '$lib/assets/news/sala-segura-primeira-do-pais.jpg';
import salaSeguraInaugurada from '$lib/assets/news/sala-segura-inaugurada.jpg';
import ramonSbcas from '$lib/assets/news/ramon_sbcas.jpeg';

export type NewsCategory =
	| 'event'
	| 'award'
	| 'media'
	| 'post'
	| 'publication'
	| 'partnership';

export type NewsItem = {
	id: string;
	date: string;
	category: NewsCategory;
	title: Localized;
	excerpt: Localized;
	image: string;
	imageAlt: Localized;
	/**
	 * Visible caption shown below the image on the internal article page.
	 * Optional — use for editorial photos (events, people), not for
	 * decorative images. `alt` is for screen readers; this is for everyone.
	 */
	caption?: Localized;
	/**
	 * CSS `object-position` for the image (e.g. 'left', '15% center').
	 * Use to keep the subject in frame when the card crops a wide photo.
	 * Defaults to centered.
	 */
	imagePosition?: string;
	/** External URL, opened in a new tab. Ignored when `body` is present. */
	link?: string;
	/**
	 * Full article content, as paragraphs, for news we publish ourselves.
	 * When present, the "read more" link points to the internal page
	 * `/news/<id>` instead of to an external site.
	 */
	body?: Localized[];
};

/** Whether the item links to an internally-hosted article page (`/news/<id>`). */
export function isInternalArticle(item: NewsItem): boolean {
	return Array.isArray(item.body) && item.body.length > 0;
}

const items: NewsItem[] = [
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
		image: salaSeguraPais,
		imageAlt: {
			pt: 'Sala segura da UFMG para uso de dados sensíveis em saúde',
			en: 'UFMG’s secure room for handling sensitive health data'
		},
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
		image: salaSeguraInaugurada,
		imageAlt: {
			pt: 'Inauguração da Sala Segura do NIAR-Saúde na Faculdade de Medicina da UFMG',
			en: 'Inauguration of NIAR-Saúde’s Secure Room at UFMG’s Medical School'
		},
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
		image: ramonSbcas,
		imagePosition: '15% center',
		imageAlt: {
			pt: 'Ramon Pereira apresenta o artigo do NIAR-Saúde no SBCAS 2026, em Ouro Preto',
			en: 'Ramon Pereira presents NIAR-Saúde’s paper at SBCAS 2026 in Ouro Preto'
		},
		caption: {
			pt: 'Ramon G. Pereira apresenta o artigo do NIAR-Saúde no SBCAS 2026, em Ouro Preto (MG).',
			en: 'Ramon G. Pereira presents NIAR-Saúde’s paper at SBCAS 2026 in Ouro Preto (MG).'
		},
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

export const news: NewsItem[] = items.sort((a, b) => b.date.localeCompare(a.date));

/** Looks up a news item by its id (used by the internal article route). */
export function getNewsItem(id: string): NewsItem | undefined {
	return items.find((item) => item.id === id);
}
