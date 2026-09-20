/**
 * Acervo consultado pelo LEME (RAG).
 *
 * Espelha `rag-api/corpus_manifest.csv`, que é a fonte de verdade e vive no repo
 * `niar-rag-prototype`. Ao reindexar o corpus lá, regenere esta lista para que a
 * página do LEME não anuncie documentos que o modelo não consulta.
 */

export type CorpusDocType = 'legislation' | 'standard' | 'institutional' | 'certification';

export type CorpusDoc = {
	title: string;
	author: string;
	/** Ausente quando o documento não tem ano definido (páginas vivas, ex.: RNDS). */
	year?: string;
	type: CorpusDocType;
	/** Fonte oficial, aberta em nova aba. */
	url: string;
};

/** Ordem em que os grupos aparecem na lista. */
export const corpusTypeOrder: CorpusDocType[] = [
	'legislation',
	'standard',
	'institutional',
	'certification'
];

/** Ordenado por tipo (conforme `corpusTypeOrder`) e, dentro do tipo, por título. */
export const corpus: CorpusDoc[] = [
	{
		title: 'Código de Defesa do Consumidor',
		author: 'Congresso Nacional e Presidência da República do Brasil',
		year: '1990',
		type: 'legislation',
		url: 'https://www.planalto.gov.br/ccivil_03/leis/l8078compilado.htm'
	},
	{
		title: 'Código Penal',
		author: 'Presidência da República do Brasil',
		year: '1940',
		type: 'legislation',
		url: 'https://www.planalto.gov.br/ccivil_03/decreto-lei/del2848compilado.htm'
	},
	{
		title: 'Constituição da República Federativa do Brasil de 1988',
		author: 'Assembleia Nacional Constituinte',
		year: '1988',
		type: 'legislation',
		url: 'https://www.planalto.gov.br/ccivil_03/constituicao/constituicao.htm'
	},
	{
		title:
			'Council of Europe Framework Convention on Artificial Intelligence and Human Rights, Democracy and the Rule of Law',
		author: 'Conselho da Europa',
		year: '2024',
		type: 'legislation',
		url: 'https://rm.coe.int/1680afae3c'
	},
	{
		title: 'Decreto nº 44.045, de 19 de julho de 1958',
		author: 'Presidência da República do Brasil',
		year: '1958',
		type: 'legislation',
		url: 'https://www.planalto.gov.br/ccivil_03/decreto/1950-1969/d44045.htm'
	},
	{
		title: 'Estatuto da Criança e do Adolescente (ECA)',
		author: 'Congresso Nacional e Presidência da República do Brasil',
		year: '1990',
		type: 'legislation',
		url: 'https://www.planalto.gov.br/ccivil_03/leis/l8069.htm'
	},
	{
		title: 'Lei Geral de Proteção de Dados Pessoais (LGPD)',
		author: 'Congresso Nacional e Presidência da República do Brasil',
		year: '2018',
		type: 'legislation',
		url: 'https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm'
	},
	{
		title: 'Lei nº 13.787, de 27 de dezembro de 2018',
		author: 'Congresso Nacional e Presidência da República do Brasil',
		year: '2018',
		type: 'legislation',
		url: 'https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13787.htm'
	},
	{
		title: 'Lei nº 14.874, de 28 de maio de 2024',
		author: 'Congresso Nacional e Presidência da República do Brasil',
		year: '2024',
		type: 'legislation',
		url: 'https://www.planalto.gov.br/ccivil_03/_ato2023-2026/2024/lei/l14874.htm'
	},
	{
		title: 'Lei nº 3.268, de 30 de setembro de 1957',
		author: 'Congresso Nacional e Presidência da República do Brasil',
		year: '1957',
		type: 'legislation',
		url: 'https://www.planalto.gov.br/ccivil_03/leis/l3268.htm'
	},
	{
		title: 'Lei nº 6.681, de 16 de agosto de 1979',
		author: 'Congresso Nacional e Presidência da República do Brasil',
		year: '1979',
		type: 'legislation',
		url: 'https://www.planalto.gov.br/ccivil_03/leis/1970-1979/l6681.htm'
	},
	{
		title: 'Lei nº 8.080, de 19 de setembro de 1990',
		author: 'Congresso Nacional e Presidência da República do Brasil',
		year: '1990',
		type: 'legislation',
		url: 'https://www.planalto.gov.br/ccivil_03/leis/l8080.htm'
	},
	{
		title: 'PL 2338/2023',
		author: 'Congresso Nacional do Brasil',
		year: '2025',
		type: 'legislation',
		url: 'https://www.camara.leg.br/proposicoesWeb/prop_mostrarintegra?codteor=2868197&filename=PL%202338/2023'
	},
	{
		title: 'Regulation (EU) 2016/679 of the European Parliament and of the Council',
		author: 'European Parliament and Council of the European Union',
		year: '2016',
		type: 'legislation',
		url: 'https://eur-lex.europa.eu/legal-content/EN/TXT/PDF/?uri=CELEX:32016R0679'
	},
	{
		title: 'Regulation (EU) 2025/327 of the European Parliament and of the Council',
		author: 'European Parliament and Council of the European Union',
		year: '2025',
		type: 'legislation',
		url: 'https://eur-lex.europa.eu/legal-content/PT/TXT/PDF/?uri=OJ:L_202500327'
	},
	{
		title: 'Resolução CD/ANPD nº 19, de 23 de agosto de 2024',
		author: 'Autoridade Nacional de Proteção de Dados Pessoais (ANPD)',
		year: '2024',
		type: 'legislation',
		url: 'https://www.gov.br/anpd/pt-br/acesso-a-informacao/institucional/atos-normativos/regulamentacoes_anpd/resolucao-cd-anpd-no-19-de-23-de-agosto-de-2024'
	},
	{
		title: 'Resolução CD/ANPD nº 2, de 27 de janeiro de 2022',
		author: 'Autoridade Nacional de Proteção de Dados Pessoais (ANPD)',
		year: '2022',
		type: 'legislation',
		url: 'https://www.gov.br/anpd/pt-br/acesso-a-informacao/institucional/atos-normativos/regulamentacoes_anpd/resolucao-cd-anpd-no-2-de-27-de-janeiro-de-2022'
	},
	{
		title: 'Resolução CFM nº 1.627/2001',
		author: 'Conselho Federal de Medicina (CFM)',
		year: '2001',
		type: 'legislation',
		url: 'https://sistemas.cfm.org.br/normas/arquivos/resolucoes/BR/2001/1627_2001.pdf'
	},
	{
		title: 'Resolução CFM nº 1.638/2002',
		author: 'Conselho Federal de Medicina (CFM)',
		year: '2002',
		type: 'legislation',
		url: 'https://sistemas.cfm.org.br/normas/arquivos/resolucoes/BR/2002/1638_2002.pdf'
	},
	{
		title: 'Resolução CFM nº 1.821/2007',
		author: 'Conselho Federal de Medicina (CFM)',
		year: '2007',
		type: 'legislation',
		url: 'https://sistemas.cfm.org.br/normas/arquivos/resolucoes/BR/2007/1821_2007.pdf'
	},
	{
		title: 'Resolução CFM nº 2.217, de 27 de setembro de 2018',
		author: 'Conselho Federal de Medicina (CFM)',
		year: '2018',
		type: 'legislation',
		url: 'https://portal.cfm.org.br/images/PDF/cem2019.pdf'
	},
	{
		title: 'Resolução CFM nº 2.306/2022',
		author: 'Conselho Federal de Medicina (CFM)',
		year: '2022',
		type: 'legislation',
		url: 'https://sistemas.cfm.org.br/normas/arquivos/resolucoes/BR/2022/2306_2022.pdf'
	},
	{
		title: 'Resolução CFM nº 2.314/2022',
		author: 'Conselho Federal de Medicina (CFM)',
		year: '2022',
		type: 'legislation',
		url: 'https://sistemas.cfm.org.br/normas/arquivos/resolucoes/BR/2022/2314_2022.pdf'
	},
	{
		title: 'Resolução CFM nº 2.336/2023',
		author: 'Conselho Federal de Medicina (CFM)',
		year: '2024',
		type: 'legislation',
		url: 'https://sistemas.cfm.org.br/normas/arquivos/resolucoes/BR/2023/2336_2023.pdf'
	},
	{
		title: 'Resolução CFM nº 2.424, de 27 de março de 2025',
		author: 'Conselho Federal de Medicina (CFM)',
		year: '2025',
		type: 'legislation',
		url: 'https://sistemas.cfm.org.br/normas/arquivos/resolucoes/BR/2025/2424_2025.pdf'
	},
	{
		title: 'Resolução CFM nº 2.454, de 11 de fevereiro de 2026',
		author: 'Conselho Federal de Medicina (CFM)',
		year: '2026',
		type: 'legislation',
		url: 'https://sistemas.cfm.org.br/normas/arquivos/resolucoes/BR/2026/2454_2026.pdf'
	},
	{
		title: 'Resolução nº 01/2022, de 17 de fevereiro de 2022',
		author: 'Universidade Federal de Minas Gerais (UFMG)',
		year: '2022',
		type: 'legislation',
		url: 'https://www.ufmg.br/bioetica/coep/wp-content/uploads/2022/03/Resolucao-012022.pdf'
	},
	{
		title: 'ISO 25237:2017',
		author: 'International Organization for Standardization (ISO)',
		year: '2017',
		type: 'standard',
		url: 'https://www.iso.org/standard/63553.html'
	},
	{
		title: 'ISO/IEC 22989:2022',
		author: 'International Organization for Standardization (ISO)',
		year: '2022',
		type: 'standard',
		url: 'https://www.iso.org/standard/74296.html'
	},
	{
		title: 'ISO/IEC 23894:2023',
		author: 'International Organization for Standardization (ISO)',
		year: '2023',
		type: 'standard',
		url: 'https://www.iso.org/standard/77304.html'
	},
	{
		title: 'ISO/IEC 27001:2022',
		author: 'International Organization for Standardization (ISO)',
		year: '2022',
		type: 'standard',
		url: 'https://www.iso.org/standard/27001'
	},
	{
		title: 'ISO/IEC 27701:2025',
		author: 'International Organization for Standardization (ISO)',
		year: '2025',
		type: 'standard',
		url: 'https://www.iso.org/standard/27701'
	},
	{
		title: 'ISO/IEC 38507:2022',
		author: 'International Organization for Standardization (ISO)',
		year: '2022',
		type: 'standard',
		url: 'https://www.iso.org/standard/56641.html'
	},
	{
		title: 'ISO/IEC 42001:2023',
		author: 'International Organization for Standardization (ISO)',
		year: '2023',
		type: 'standard',
		url: 'https://www.iso.org/standard/42001'
	},
	{
		title: 'ISO/IEC 5338:2023',
		author: 'International Organization for Standardization (ISO)',
		year: '2023',
		type: 'standard',
		url: 'https://www.iso.org/standard/81118.html'
	},
	{
		title: 'ISO/IEC TR 24368:2022',
		author: 'International Organization for Standardization (ISO)',
		year: '2022',
		type: 'standard',
		url: 'https://www.iso.org/standard/78507.html'
	},
	{
		title:
			'"Software as a Medical Device": Possible Framework for Risk Categorization and Corresponding Considerations',
		author: 'International Medical Device Regulators Forum (IMDRF)',
		year: '2014',
		type: 'institutional',
		url: 'https://www.imdrf.org/sites/default/files/docs/imdrf/final/technical/imdrf-tech-140918-samd-framework-risk-categorization-141013.pdf'
	},
	{
		title: 'Artificial Intelligence Risk Management Framework (AI RMF 1.0)',
		author: 'National Institute of Standards and Technology (NIST) - U.S. Department of Commerce',
		year: '2023',
		type: 'institutional',
		url: 'https://nvlpubs.nist.gov/nistpubs/ai/NIST.AI.100-1.pdf'
	},
	{
		title:
			'Artificial Intelligence-Enabled Device Software Functions: Lifecycle Management and Marketing Submission Recommendations',
		author: 'U.S. Food & Drug Administration (FDA)',
		year: '2025',
		type: 'institutional',
		url: 'https://www.fda.gov/media/184856/download'
	},
	{
		title:
			'Artificial Intelligence/Machine Learning (AI/ML)-Based Software as a Medical Device (SaMD) Action Plan',
		author: 'U.S. Food & Drug Administration (FDA)',
		year: '2021',
		type: 'institutional',
		url: 'https://www.fda.gov/media/145022/download'
	},
	{
		title: 'De-Identifying Government Datasets: Techniques and Governance',
		author: 'National Institute of Standards and Technology (NIST) - U.S. Department of Commerce',
		year: '2023',
		type: 'institutional',
		url: 'https://nvlpubs.nist.gov/nistpubs/SpecialPublications/NIST.SP.800-188.pdf'
	},
	{
		title: 'Estratégia Brasileira de Inteligência Artificial - EBIA',
		author: 'Ministério da Ciência, Tecnologia e Inovações (MCTI) - Governo Federal do Brasil',
		year: '2021',
		type: 'institutional',
		url: 'https://www.gov.br/mcti/pt-br/acompanhe-o-mcti/transformacaodigital/ebia.pdf'
	},
	{
		title:
			'Ethical impact assessment: a tool of the Recommendation on the Ethics of Artificial Intelligence',
		author: 'Organização das Nações Unidas para a Educação, Ciência e Cultura (UNESCO)',
		year: '2023',
		type: 'institutional',
		url: 'https://unesdoc.unesco.org/ark:/48223/pf0000386276'
	},
	{
		title:
			'Ethics and governance of artificial intelligence for health. Guidance on large multi-modal models',
		author: 'World Health Organization (WHO)',
		year: '2024',
		type: 'institutional',
		url: 'https://iris.who.int/bitstream/handle/10665/375579/9789240084759-eng.pdf'
	},
	{
		title: 'Ethics and governance of artificial intelligence for health: WHO guidance',
		author: 'World Health Organization (WHO)',
		year: '2021',
		type: 'institutional',
		url: 'https://iris.who.int/bitstream/handle/10665/341996/9789240029200-eng.pdf'
	},
	{
		title: 'Global strategy on digital health 2020 - 2027',
		author: 'World Health Organization (WHO)',
		year: '2025',
		type: 'institutional',
		url: 'https://iris.who.int/server/api/core/bitstreams/0e489e36-bb8a-4d5f-8fda-1aa9d06b7d8e/content'
	},
	{
		title: 'Good Machine Learning Practice for Medical Device Development: Guiding Principles',
		author:
			'U.S. Food & Drug Administration (FDA); Health Canada; Medicines and Healthcare products Regulatory Agency (MHRA)',
		year: '2021',
		type: 'institutional',
		url: 'https://www.fda.gov/media/153486/download'
	},
	{
		title: 'Good machine learning practice for medical device development: Guiding principles',
		author: 'International Medical Device Regulators Forum (IMDRF)',
		year: '2025',
		type: 'institutional',
		url: 'https://www.imdrf.org/sites/default/files/2025-01/IMDRF%20AIML%20WG%20GMLP%20N88%20Final.pdf'
	},
	{
		title: 'Machine Learning-enabled Medical Devices: Key Terms and Definitions',
		author: 'International Medical Device Regulators Forum (IMDRF)',
		year: '2022',
		type: 'institutional',
		url: 'https://www.imdrf.org/sites/default/files/2022-05/IMDRF%20AIMD%20WG%20Final%20Document%20N67.pdf'
	},
	{
		title: 'OECD AI Principles overview',
		author: 'Organisation for Economic Co-operation and Development (OECD)',
		type: 'institutional',
		url: 'https://oecd.ai/en/ai-principles'
	},
	{
		title: 'Plano Brasileiro de Inteligência Artificial',
		author: 'Ministério da Ciência, Tecnologia e Inovações (MCTI) - Governo Federal do Brasil',
		year: '2025',
		type: 'institutional',
		url: 'https://www.gov.br/mcti/pt-br/centrais-de-conteudo/publicacoes-mcti/plano-brasileiro-de-inteligencia-artificial/pbia_mcti_2025.pdf'
	},
	{
		title:
			'Predetermined Change Control Plans for Machine Learning-Enabled Medical Devices: Guiding Principles',
		author:
			'U.S. Food & Drug Administration (FDA); Health Canada; Medicines and Healthcare products Regulatory Agency (MHRA)',
		year: '2023',
		type: 'institutional',
		url: 'https://www.fda.gov/media/173206/download'
	},
	{
		title:
			'Proposed Regulatory Framework for Modifications to Artificial Intelligence/Machine Learning (AI/ML)-Based Software as a Medical Device (SaMD) - Discussion Paper and Request for Feedback',
		author: 'U.S. Food & Drug Administration (FDA)',
		year: '2019',
		type: 'institutional',
		url: 'https://www.fda.gov/media/122535/download'
	},
	{
		title: 'Rede Nacional de Dados em Saúde',
		author: 'Ministério da Saúde (MS)',
		type: 'institutional',
		url: 'https://www.gov.br/saude/pt-br/composicao/seidigi/rnds'
	},
	{
		title:
			'Regulamento Interno do Comitê de Ética em Pesquisa da Universidade Federal de Minas Gerais - CEP/UFMG',
		author: 'Comitê de Ética em Pesquisa - CEP-UFMG',
		year: '2024',
		type: 'institutional',
		url: 'https://www.ufmg.br/bioetica/cep/regimento/'
	},
	{
		title: 'Regulatory considerations on artificial intelligence for health',
		author: 'World Health Organization (WHO)',
		year: '2023',
		type: 'institutional',
		url: 'https://iris.who.int/bitstream/handle/10665/373421/9789240078871-eng.pdf'
	},
	{
		title: 'Relatório de Pesquisa (Comitê de Ética em Pesquisa)',
		author: 'Comitê de Ética em Pesquisa - CEP-UFMG',
		type: 'institutional',
		url: 'https://www.ufmg.br/bioetica/cep/modelo-de-relatorio-parcial-ou-final/'
	},
	{
		title: 'Software as a Medical Device (SaMD): Clinical Evaluation',
		author: 'International Medical Device Regulators Forum (IMDRF)',
		year: '2017',
		type: 'institutional',
		url: 'https://www.imdrf.org/sites/default/files/docs/imdrf/final/technical/imdrf-tech-170921-samd-n41-clinical-evaluation_1.pdf'
	},
	{
		title: 'Termo de Compromisso de Utilização de Dados (TCUD)',
		author: 'Comitê de Ética em Pesquisa - CEP-UFMG',
		year: '2015',
		type: 'institutional',
		url: 'https://www.ufmg.br/bioetica/cep/tcud/'
	},
	{
		title: 'Towards effective governance of justice data',
		author: 'Organisation for Economic Co-operation and Development (OECD)',
		year: '2024',
		type: 'institutional',
		url: 'https://www.oecd.org/content/dam/oecd/en/publications/reports/2024/04/towards-effective-governance-of-justice-data_d2950e02/39db1f05-en.pdf'
	},
	{
		title: 'Transparency for Machine Learning-Enabled Medical Devices: Guiding Principles',
		author:
			'U.S. Food & Drug Administration (FDA); Health Canada; Medicines and Healthcare products Regulatory Agency (MHRA)',
		year: '2024',
		type: 'institutional',
		url: 'https://www.fda.gov/media/179263/download'
	},
	{
		title: 'What is a DPIA?',
		author: "Information Commissioner's Office (ICO)",
		type: 'institutional',
		url: 'https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/accountability-and-governance/data-protection-impact-assessments-dpias/what-is-a-dpia/#what1'
	},
	{
		title: 'Certificação de Aplicações de Inteligência Artificial em Saúde',
		author: 'Sociedade Brasileira de Informática em Saúde (SBIS)',
		type: 'certification',
		url: 'https://sbis.org.br/certificacoes/certificacao-de-ia/'
	}
];

/** Quantidade de documentos por tipo, para o resumo do aviso. */
export const corpusCountByType = corpusTypeOrder.reduce<Record<CorpusDocType, number>>(
	(acc, type) => {
		acc[type] = corpus.filter((doc) => doc.type === type).length;
		return acc;
	},
	{} as Record<CorpusDocType, number>
);
