import type { Localized } from '$lib/i18n';
import salaSeguraPais from '$lib/assets/news/sala-segura-primeira-do-pais.jpg';
import salaSeguraInaugurada from '$lib/assets/news/sala-segura-inaugurada.jpg';

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
	link?: string;
};

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
	}
];

export const news: NewsItem[] = items.sort((a, b) => b.date.localeCompare(a.date));
