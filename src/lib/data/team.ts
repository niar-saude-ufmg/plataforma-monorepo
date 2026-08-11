/**
 * Equipe do NIAR-Saúde.
 *
 * Vivia dentro de `src/routes/team/+page.svelte`. Saiu de lá porque a home precisa da
 * contagem para o indicador "+N" da faixa institucional, e um número fixo lá ficaria
 * errado na primeira entrada ou saída de alguém.
 */

import type { Localized } from '$lib/i18n';

import wagnerImg from '$lib/assets/staff/wagner-meira.jpg';
import micheleImg from '$lib/assets/staff/michele.jpeg';
import dorgivalImg from '$lib/assets/staff/Dorgival-2.jpg';
import anaPaulaImg from '$lib/assets/staff/ana-paula.jpeg';
import ramonImg from '$lib/assets/staff/ramon.jpeg';
import guilhermeImg from '$lib/assets/staff/guilherme.jpg';
import karolImg from '$lib/assets/staff/karol.png';
import helenImg from '$lib/assets/staff/helen_pefil2.jpg';
import italoImg from '$lib/assets/staff/Italo.jpg';
import isadoraImg from '$lib/assets/staff/isadora.jpeg';
import adrianoCesarImg from '$lib/assets/staff/adriano-cesar.jpeg';
import camilaImg from '$lib/assets/staff/camila.jpeg';
import alineSantosImg from '$lib/assets/staff/aline-santos.jpeg';
import anaLuizaImg from '$lib/assets/staff/ana-luiza.jpeg';
import antonioImg from '$lib/assets/staff/antonio.jpeg';
import deborahImg from '$lib/assets/staff/deborah.jpeg';
import eduardoImg from '$lib/assets/staff/eduardo.jpeg';
import ernestoImg from '$lib/assets/staff/ernesto.jpeg';
import flaviaImg from '$lib/assets/staff/flavia.jpeg';
import gabrielaImg from '$lib/assets/staff/gabriela.jpeg';
import hugoImg from '$lib/assets/staff/hugo.jpeg';
import ilkaImg from '$lib/assets/staff/ilka.jpeg';
import jorgeImg from '$lib/assets/staff/jorge.jpeg';
import julioImg from '$lib/assets/staff/julio.jpeg';
import jussaraImg from '$lib/assets/staff/jussara.jpeg';
import marcoImg from '$lib/assets/staff/marco.jpeg';
import marcosAndreImg from '$lib/assets/staff/Marcos-Andre-4.jpg';
import marcosPratesImg from '$lib/assets/staff/marcos.jpeg';
import marianaAlmeidaImg from '$lib/assets/staff/mariana-almeida.jpeg';
import marianaOliveiraImg from '$lib/assets/staff/mariana-de-oliveira.jpeg';
import marianaMiskImg from '$lib/assets/staff/mariana-misk.jpeg';
import marisaImg from '$lib/assets/staff/marisa.jpeg';
import petrusImg from '$lib/assets/staff/petrus.jpeg';
import reginaImg from '$lib/assets/staff/regina.jpeg';
import saraImg from '$lib/assets/staff/sara.jpeg';
import sofiaImg from '$lib/assets/staff/sofia.jpeg';
import virgilioImg from '$lib/assets/staff/virgilio.jpeg';
import wesleyImg from '$lib/assets/staff/wesley.jpeg';
import zilmaImg from '$lib/assets/staff/zilma.jpeg';
import elieteImg from '$lib/assets/staff/eliete.png';
import barbaraImg from '$lib/assets/staff/barbara.jpeg';
import bernardoImg from '$lib/assets/staff/bernardo.jpeg';
import eduardoLuizImg from '$lib/assets/staff/eduardo-luiz.jpeg';
import eloyImg from '$lib/assets/staff/eloy.jpeg';
import erikaImg from '$lib/assets/staff/erika.jpeg';
import fabianaImg from '$lib/assets/staff/fabiana.jpeg';
import gregorioImg from '$lib/assets/staff/gregorio.jpeg';
import isadoraHortaImg from '$lib/assets/staff/isadora-horta.jpeg';
import joaoMarcosImg from '$lib/assets/staff/joao-marcos.jpeg';
import leonardoImg from '$lib/assets/staff/leonardo.jpeg';
import leticiaImg from '$lib/assets/staff/leticia.jpg';
import mariaCarvalhidoImg from '$lib/assets/staff/maria-carvalhido.jpeg';
import matheusImg from '$lib/assets/staff/matheus.jpeg';
import yasminImg from '$lib/assets/staff/yasmin.jpeg';

export type TeamMember = {
	initials: string;
	name: string;
	info: Localized;
	metas: string[];
	group: string;
	photo?: string;
	photoPos?: string;
};

export const team: TeamMember[] = [
	// Coordenação
	{
		initials: 'AP',
		name: 'Profa. Ana Paula Couto Silva',
		info: {
			pt: 'Coordenadora Meta 2 · Computação Social',
			en: 'Goal 2 Coordinator · Social Computing'
		},
		metas: ['2'],
		group: 'Coordenação',
		photo: anaPaulaImg
	},
	{
		initials: 'AR',
		name: 'Prof. Antonio Luiz Pinho Ribeiro',
		info: {
			pt: 'Coordenador Meta 4 · Infectologia e Medicina Tropical',
			en: 'Goal 4 Coordinator · Infectious Diseases and Tropical Medicine'
		},
		metas: ['4'],
		group: 'Coordenação',
		photo: antonioImg
	},
	{
		initials: 'CC',
		name: 'Camila dos Reis Cunha',
		info: {
			pt: 'Gerente de Projetos · Administração e Gestão da Inovação',
			en: 'Project Manager · Administration and Innovation Management'
		},
		metas: ['1', '3', '7'],
		group: 'Coordenação',
		photo: camilaImg
	},
	{
		initials: 'DM',
		name: 'Profa. Deborah Carvalho Malta',
		info: {
			pt: 'Coordenadora Meta 5 · Saúde Coletiva e Saúde Pública',
			en: 'Goal 5 Coordinator · Collective Health and Public Health'
		},
		metas: ['5'],
		group: 'Coordenação',
		photo: deborahImg
	},
	{
		initials: 'DG',
		name: 'Prof. Dorgival Guedes Neto',
		info: {
			pt: 'Coordenador Meta 3 · Sistemas Distribuídos',
			en: 'Goal 3 Coordinator · Distributed Systems'
		},
		metas: ['3'],
		group: 'Coordenação',
		photo: dorgivalImg,
		photoPos: '30% 20%'
	},
	{
		initials: 'FP',
		name: 'Fabiana Costa Pereira Peixoto',
		info: {
			pt: 'Gerente de Projetos · Ciência da Computação',
			en: 'Project Manager · Computer Science'
		},
		metas: ['1', '2', '3', '4', '5', '6', '7'],
		group: 'Coordenação',
		photo: fabianaImg
	},
	{
		initials: 'LN',
		name: 'Letícia Santos Neto',
		info: {
			pt: 'Gerente de Projetos · Ciência da Computação',
			en: 'Project Manager · Computer Science'
		},
		metas: ['1', '2', '3', '4', '5', '6', '7'],
		group: 'Coordenação',
		photo: leticiaImg
	},
	{
		initials: 'ML',
		name: 'Profa. Mariangela Leal Cherchiglia',
		info: { pt: 'Coordenadora Meta 6 · Saúde Pública', en: 'Goal 6 Coordinator · Public Health' },
		metas: ['6'],
		group: 'Coordenação'
	},
	{
		initials: 'MB',
		name: 'Profa. Michele Amaral Brandão',
		info: {
			pt: 'Coordenadora Meta 1 · Ciência da Computação e IA Responsável',
			en: 'Goal 1 Coordinator · Computer Science and Responsible AI'
		},
		metas: ['1', '2', '3'],
		group: 'Coordenação',
		photo: micheleImg
	},
	{
		initials: 'WM',
		name: 'Prof. Wagner Meira Júnior',
		info: {
			pt: 'Coordenador Metas 3 e 7 · Ciência da Computação',
			en: 'Goals 3 and 7 Coordinator · Computer Science'
		},
		metas: ['3', '7'],
		group: 'Coordenação',
		photo: wagnerImg
	},
	{
		initials: 'ZR',
		name: 'Profa. Zilma Silveira Nogueira Reis',
		info: {
			pt: 'Coordenadora Meta 2 · Ginecologia e Obstetrícia',
			en: 'Goal 2 Coordinator · Gynecology and Obstetrics'
		},
		metas: ['2'],
		group: 'Coordenação',
		photo: zilmaImg
	},
	// Pesquisadores
	{
		initials: 'AC',
		name: 'Prof. Adriano César Machado Pereira',
		info: { pt: 'Pesquisador · Ciência da Computação', en: 'Researcher · Computer Science' },
		metas: ['3'],
		group: 'Pesquisadores',
		photo: adrianoCesarImg
	},
	{
		initials: 'AS',
		name: 'Dra. Aline Cristina dos Santos',
		info: { pt: 'Analista Finalística · Saúde pública', en: 'Technical Analyst · Public Health' },
		metas: ['6'],
		group: 'Pesquisadores',
		photo: alineSantosImg
	},
	{
		initials: 'CO',
		name: 'Profa. Clara Rodrigues Alves de Oliveira',
		info: {
			pt: 'Pesquisadora · Infectologia e Medicina Tropical',
			en: 'Researcher · Infectious Diseases and Tropical Medicine'
		},
		metas: ['4'],
		group: 'Pesquisadores'
	},
	{
		initials: 'CG',
		name: 'Dra. Crizian Saar Gomes',
		info: {
			pt: 'Desenvolvedora Plena · Saúde Pública',
			en: 'Mid-level Developer · Public Health'
		},
		metas: ['5'],
		group: 'Pesquisadores'
	},
	{
		initials: 'ES',
		name: 'Dr. Eduardo Campos dos Santos',
		info: {
			pt: 'Analista Finalístico · Mineração de Dados',
			en: 'Technical Analyst · Data Mining'
		},
		metas: ['3'],
		group: 'Pesquisadores',
		photo: eduardoImg
	},
	{
		initials: 'ER',
		name: 'Prof. Eduardo Luiz Gonçalves Rios Neto',
		info: { pt: 'Pesquisador · Economia', en: 'Researcher · Economics' },
		metas: ['3'],
		group: 'Pesquisadores',
		photo: eduardoLuizImg
	},
	{
		initials: 'EA',
		name: 'Dra. Érika Carvalho de Aquino',
		info: {
			pt: 'Pesquisadora · Medicina Tropical e Saúde Pública',
			en: 'Researcher · Tropical Medicine and Public Health'
		},
		metas: ['5'],
		group: 'Pesquisadores',
		photo: erikaImg
	},
	{
		initials: 'EP',
		name: 'Prof. Ernesto Perini Frizzera da Mota Santos',
		info: { pt: 'Pesquisador · Filosofia', en: 'Researcher · Philosophy' },
		metas: ['2'],
		group: 'Pesquisadores',
		photo: ernestoImg
	},
	{
		initials: 'FP',
		name: 'Profa. Flávia Bulegon Pilecco',
		info: { pt: 'Pesquisadora · Epidemiologia', en: 'Researcher · Epidemiology' },
		metas: ['6'],
		group: 'Pesquisadores',
		photo: flaviaImg
	},
	{
		initials: 'GA',
		name: 'Prof. Gabriel Oliveira Assunção',
		info: { pt: 'Pesquisador · Estatística', en: 'Researcher · Statistics' },
		metas: ['3'],
		group: 'Pesquisadores'
	},
	{
		initials: 'GP',
		name: 'Profa. Gabriela Miana de Mattos Paixão',
		info: {
			pt: 'Pesquisadora · Infectologia e Medicina Tropical',
			en: 'Researcher · Infectious Diseases and Tropical Medicine'
		},
		metas: ['4'],
		group: 'Pesquisadores',
		photo: gabrielaImg
	},
	{
		initials: 'HL',
		name: 'Profa. Helen de Cássia Sousa da Costa Lima',
		info: {
			pt: 'Pós-doutoranda · IA Responsável e IA em Saúde',
			en: 'Postdoctoral Researcher · Responsible AI and AI in Healthcare'
		},
		metas: ['1'],
		group: 'Pesquisadores',
		photo: helenImg
	},
	{
		initials: 'HR',
		name: 'Prof. Hugo André da Rocha',
		info: { pt: 'Pesquisador · Saúde Pública', en: 'Researcher · Public Health' },
		metas: ['6'],
		group: 'Pesquisadores',
		photo: hugoImg
	},
	{
		initials: 'IR',
		name: 'Profa. Ilka Afonso Reis',
		info: { pt: 'Pesquisadora · Estatística', en: 'Researcher · Statistics' },
		metas: ['6'],
		group: 'Pesquisadores',
		photo: ilkaImg
	},
	{
		initials: 'IB',
		name: 'Profa. Isabela Nascimento Borges',
		info: {
			pt: 'Pesquisadora · Infectologia e Medicina Tropical',
			en: 'Researcher · Infectious Diseases and Tropical Medicine'
		},
		metas: ['4'],
		group: 'Pesquisadores'
	},
	{
		initials: 'JS',
		name: 'Joabe Dias Salgueiro',
		info: { pt: 'Pesquisador · Sistemas de Informação', en: 'Researcher · Information Systems' },
		metas: ['2'],
		group: 'Pesquisadores'
	},
	{
		initials: 'JM',
		name: 'Prof. Jorge Gustavo Velasquez Melendez',
		info: {
			pt: 'Pesquisador · Epidemiologia Nutricional',
			en: 'Researcher · Nutritional Epidemiology'
		},
		metas: ['5'],
		group: 'Pesquisadores',
		photo: jorgeImg
	},
	{
		initials: 'JR',
		name: 'Prof. Júlio Soares dos Reis',
		info: {
			pt: 'Pesquisador · Sistemas de Informação e Ciência da Computação',
			en: 'Researcher · Information Systems and Computer Science'
		},
		metas: ['1'],
		group: 'Pesquisadores',
		photo: julioImg
	},
	{
		initials: 'JG',
		name: 'Profa. Jussara Marques de Almeida Gonçalves',
		info: { pt: 'Pesquisadora · Ciência da Computação', en: 'Researcher · Computer Science' },
		metas: ['5'],
		group: 'Pesquisadores',
		photo: jussaraImg
	},
	{
		initials: 'LA',
		name: 'Profa. Larissa Fortunato Araújo',
		info: { pt: 'Pesquisadora · Saúde Pública', en: 'Researcher · Public Health' },
		metas: ['5'],
		group: 'Pesquisadores'
	},
	{
		initials: 'MA',
		name: 'Prof. Marco Antônio Sousa Alves',
		info: { pt: 'Pesquisador · Filosofia', en: 'Researcher · Philosophy' },
		metas: ['2'],
		group: 'Pesquisadores',
		photo: marcoImg
	},
	{
		initials: 'MG',
		name: 'Prof. Marcos André Gonçalves',
		info: { pt: 'Pesquisador · Ciência da Computação', en: 'Researcher · Computer Science' },
		metas: ['5'],
		group: 'Pesquisadores',
		photo: marcosAndreImg
	},
	{
		initials: 'MP',
		name: 'Prof. Marcos Oliveira Prates',
		info: { pt: 'Pesquisador · Estatística', en: 'Researcher · Statistics' },
		metas: ['3'],
		group: 'Pesquisadores',
		photo: marcosPratesImg
	},
	{
		initials: 'MC',
		name: 'Mariana Almeida Carneiro',
		info: { pt: 'Analista Finalística · Engenharia', en: 'Technical Analyst · Engineering' },
		metas: ['6'],
		group: 'Pesquisadores',
		photo: marianaAlmeidaImg
	},
	{
		initials: 'MS',
		name: 'Dra. Mariana de Oliveira Santos Silva',
		info: {
			pt: 'Analista Finalística · Ciência da Computação',
			en: 'Technical Analyst · Computer Science'
		},
		metas: ['2'],
		group: 'Pesquisadores',
		photo: marianaOliveiraImg
	},
	{
		initials: 'MM',
		name: 'Mariana Misk Moysés',
		info: { pt: 'Pesquisadora · Design Industrial', en: 'Researcher · Industrial Design' },
		metas: ['2'],
		group: 'Pesquisadores',
		photo: marianaMiskImg
	},
	{
		initials: 'MV',
		name: 'Dra. Marisa Affonso Vasconcelos',
		info: { pt: 'Pesquisadora · IA Responsável', en: 'Researcher · Responsible AI' },
		metas: ['1', '2'],
		group: 'Pesquisadores',
		photo: marisaImg
	},
	{
		initials: 'PA',
		name: 'Dr. Petrus Emmanuel Oliveira Gomes Brant Abreu',
		info: {
			pt: 'Analista de Modelos de IA · Engenharia Elétrica',
			en: 'AI Models Analyst · Electrical Engineering'
		},
		metas: ['4'],
		group: 'Pesquisadores',
		photo: petrusImg
	},
	{
		initials: 'RS',
		name: 'Profa. Regina Helena Alves da Silva',
		info: {
			pt: 'Pesquisadora · História Social e Ciências Sociais',
			en: 'Researcher · Social History and Social Sciences'
		},
		metas: ['2'],
		group: 'Pesquisadores'
	},
	{
		initials: 'RB',
		name: 'Dra. Regina Tomie Ivata Bernal',
		info: {
			pt: 'Pós-doutoranda · Estatística e Saúde Pública',
			en: 'Postdoctoral Researcher · Statistics and Public Health'
		},
		metas: ['5'],
		group: 'Pesquisadores',
		photo: reginaImg
	},
	{
		initials: 'VA',
		name: 'Prof. Virgílio Augusto Fernandes Almeida',
		info: {
			pt: 'Pesquisador · Ciência da Computação e IA Responsável',
			en: 'Researcher · Computer Science and Responsible AI'
		},
		metas: ['3', '7'],
		group: 'Pesquisadores',
		photo: virgilioImg
	},
	// Doutorandos
	{
		initials: 'GR',
		name: 'Gregório Victor Rodrigues',
		info: {
			pt: 'Doutorando · Medicina e Ciência de Dados',
			en: 'PhD Student · Medicine and Data Science'
		},
		metas: ['5'],
		group: 'Doutorandos',
		photo: gregorioImg
	},
	{
		initials: 'RG',
		name: 'Ramon Gonçalves Pereira',
		info: { pt: 'Doutorando · IA em Saúde', en: 'PhD Student · AI in Healthcare' },
		metas: ['1', '3', '6'],
		group: 'Doutorandos',
		photo: ramonImg
	},
	{
		initials: 'SR',
		name: 'Sofia Maria Amorim Falco Rodrigues',
		info: { pt: 'Doutoranda · Engenharia Elétrica', en: 'PhD Student · Electrical Engineering' },
		metas: ['4'],
		group: 'Doutorandos',
		photo: sofiaImg
	},
	// Mestrandos
	{
		initials: 'BC',
		name: 'Barbara Aguiar Carrato',
		info: {
			pt: 'Mestranda · Enfermagem e Epidemiologia',
			en: "Master's Student · Nursing and Epidemiology"
		},
		metas: ['5'],
		group: 'Mestrandos',
		photo: barbaraImg
	},
	{
		initials: 'KA',
		name: 'Karolina Ivete Azevedo',
		info: { pt: 'Mestranda · IA Responsável', en: "Master's Student · Responsible AI" },
		metas: ['1', '2'],
		group: 'Mestrandos',
		photo: karolImg
	},
	{
		initials: 'LP',
		name: 'Leonardo Lemos Pena',
		info: { pt: 'Mestrando · Enfermagem', en: "Master's Student · Nursing" },
		metas: ['5'],
		group: 'Mestrandos',
		photo: leonardoImg
	},
	// Alunos de Iniciação Científica
	{
		initials: 'AL',
		name: 'Ana Luiza Coimbra Carvalho Gallo',
		info: {
			pt: 'Graduanda em Design Gráfico · Desenho de Produto',
			en: 'Undergraduate in Graphic Design · Product Design'
		},
		metas: ['2'],
		group: 'Alunos de Iniciação Científica',
		photo: anaLuizaImg
	},
	{
		initials: 'BA',
		name: 'Bernardo Loeser Amaral',
		info: {
			pt: 'Graduando em Engenharia de Controle e Automação',
			en: 'Undergraduate in Control and Automation Engineering'
		},
		metas: ['3'],
		group: 'Alunos de Iniciação Científica',
		photo: bernardoImg
	},
	{
		initials: 'EM',
		name: 'Eloy Ribeiro Pereira Maciel',
		info: { pt: 'Graduando em Ciência da Computação', en: 'Undergraduate in Computer Science' },
		metas: ['3'],
		group: 'Alunos de Iniciação Científica',
		photo: eloyImg
	},
	{
		initials: 'FC',
		name: 'Fabíola Siomara Liboreiro Chicata',
		info: { pt: 'Graduanda em Medicina', en: 'Undergraduate in Medicine' },
		metas: ['6'],
		group: 'Alunos de Iniciação Científica'
	},
	{
		initials: 'IH',
		name: 'Isadora Horta Rates',
		info: {
			pt: 'Graduanda em Sistemas de Informação',
			en: 'Undergraduate in Information Systems'
		},
		metas: ['3'],
		group: 'Alunos de Iniciação Científica',
		photo: isadoraHortaImg
	},
	{
		initials: 'IA',
		name: 'Italo Rodrigues de Matos Avelar',
		info: {
			pt: 'Graduando em Sistemas de Informação · IA Responsável',
			en: 'Undergraduate in Information Systems · Responsible AI'
		},
		metas: ['1'],
		group: 'Alunos de Iniciação Científica',
		photo: italoImg
	},
	{
		initials: 'JC',
		name: 'João Marcos Tomáz Silva Campos',
		info: { pt: 'Graduando em Ciência da Computação', en: 'Undergraduate in Computer Science' },
		metas: ['3'],
		group: 'Alunos de Iniciação Científica',
		photo: joaoMarcosImg
	},
	{
		initials: 'LR',
		name: 'Lucas Martins Rocha',
		info: {
			pt: 'Graduando em Engenharia de Controle e Automação · Sistemas Embarcados',
			en: 'Undergraduate in Control and Automation Engineering · Embedded Systems'
		},
		metas: ['1', '2'],
		group: 'Alunos de Iniciação Científica'
	},
	{
		initials: 'LB',
		name: 'Luís Eduardo Limas Brito',
		info: {
			pt: 'Graduando em Ciência da Computação · Ciência de Dados',
			en: 'Undergraduate in Computer Science · Data Science'
		},
		metas: ['2'],
		group: 'Alunos de Iniciação Científica'
	},
	{
		initials: 'MB',
		name: 'Maria Carvalhido Izabel Barreto',
		info: { pt: 'Graduanda em Ciência da Computação', en: 'Undergraduate in Computer Science' },
		metas: ['2'],
		group: 'Alunos de Iniciação Científica',
		photo: mariaCarvalhidoImg
	},
	{
		initials: 'MC',
		name: 'Matheus Araújo Pinto Carvalho',
		info: {
			pt: 'Graduando em Sistemas de Informação · IA Responsável',
			en: 'Undergraduate in Information Systems · Responsible AI'
		},
		metas: ['1'],
		group: 'Alunos de Iniciação Científica',
		photo: matheusImg
	},
	{
		initials: 'SG',
		name: 'Sara Ribeiro Guimarães',
		info: { pt: 'Graduanda em Design Gráfico', en: 'Undergraduate in Graphic Design' },
		metas: ['2'],
		group: 'Alunos de Iniciação Científica',
		photo: saraImg
	},
	{
		initials: 'YS',
		name: 'Yasmin Lourdes e Silva',
		info: {
			pt: 'Graduanda em Ciência da Computação · Computação Quântica',
			en: 'Undergraduate in Computer Science · Quantum Computing'
		},
		metas: ['3'],
		group: 'Alunos de Iniciação Científica',
		photo: yasminImg
	},
	// Colaboradores Externos
	{
		initials: 'EC',
		name: 'Eliete Guizilini Moreira de Carvalho',
		info: {
			pt: 'Desenvolvedora Júnior · Ciência da Informação',
			en: 'Junior Developer · Information Science'
		},
		metas: ['6'],
		group: 'Colaboradores Externos',
		photo: elieteImg
	},
	{
		initials: 'GV',
		name: 'Guilherme Vezula Mateveli',
		info: {
			pt: 'Desenvolvedor Sênior · Aplicações Web',
			en: 'Senior Developer · Web Applications'
		},
		metas: ['3'],
		group: 'Colaboradores Externos',
		photo: guilhermeImg,
		photoPos: 'center 15%'
	},
	{
		initials: 'IR',
		name: 'Isadora Cristina de Matos Rodrigues',
		info: {
			pt: 'Desenvolvedora · Aplicações Web e Dados Públicos',
			en: 'Developer · Web Applications and Public Data'
		},
		metas: ['3'],
		group: 'Colaboradores Externos',
		photo: isadoraImg
	},
	// Alumni
	{
		initials: 'WC',
		name: 'Wesley Santos Costa',
		info: {
			pt: 'Analista Finalístico · Sistema de Informação e Ciência da Computação',
			en: 'Technical Analyst · Information Systems and Computer Science'
		},
		metas: ['6'],
		group: 'Alumni',
		photo: wesleyImg
	}
];

/**
 * Grupo dos egressos. Eles aparecem na página /team, em seção própria, mas não contam
 * como equipe atual — daí a separação.
 */
export const ALUMNI_GROUP = 'Alumni';

/** Equipe atual: todo mundo menos os egressos. Use para contagens. */
export const currentTeam = team.filter((member) => member.group !== ALUMNI_GROUP);
