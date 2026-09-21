import type { Localized } from '$lib/i18n';
import salaSeguraPais from '$lib/assets/news/sala-segura-primeira-do-pais.jpg';
import salaSeguraInaugurada from '$lib/assets/news/sala-segura-inaugurada.jpg';
import ramonSbcas from '$lib/assets/news/ramon_sbcas.jpeg';
import marisaDfp from '$lib/assets/news/marisa_dataforpolicy.png';
import marisaDfpCover from '$lib/assets/news/marisa_dataforpolicy_cover.png';

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
	/** De 1 a 3 fotos. A primeira também alimenta os cards, salvo se houver `cover`. */
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
		photos: [
			{
				src: salaSeguraPais,
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
				src: salaSeguraInaugurada,
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
				src: ramonSbcas,
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

export const news: NewsItem[] = items.sort((a, b) => b.date.localeCompare(a.date));

/** Looks up a news item by its id (used by the internal article route). */
export function getNewsItem(id: string): NewsItem | undefined {
	return items.find((item) => item.id === id);
}
