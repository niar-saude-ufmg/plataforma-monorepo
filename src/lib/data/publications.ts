export type Publication = {
	year: string;
	metas: string[];
	title: string;
	authors: string;
	journal: string;
	doi: string;
};

export const publications: Publication[] = [
	{ year: '2026', metas: ['2'], title: 'Quem controla os dados? Governança e Responsabilidade na Era da Inteligência Artificial', authors: 'Carvalho, M., Azevedo, K., Rocha, L., Vasconcelos, M., Brandão, M., Meira, W.', journal: 'SBC Horizontes, ISSN 2175-9235, April 2026', doi: 'https://horizontes.sbc.org.br/index.php/2026/04/quem-controla-os-dados-governanca-e-responsabilidade-na-era-da-inteligencia-artificial/' },
	{ year: '2025', metas: ['4'], title: 'Artificial intelligence in the electrocardiogram: automatic diagnosis of the normal ECG in a Tele-electrocardiogram service', authors: 'Paixão, G., Abreu, P.E., Gomes, P.G., Schön, T.B., Ribeiro, A.H., Ribeiro, A.L.P.', journal: 'European Heart Journal, Volume 46, Issue Supplement_1, November 2025, ehaf784.4407', doi: 'https://doi.org/10.1093/eurheartj/ehaf784.4407' },
	{ year: '2025', metas: ['5'], title: 'Use of Machine Learning to Predict the Consumption of Fruits and Vegetables in Small Areas', authors: 'Gomes, C.S., Araújo, L.F., Faria, T.M.T.R., Bernal, R.T.I., Souza, J.B., Alves, S.N., Barbosa, B.R.G., Cardoso, L.S.M., Gonçalves, M.A., Almeida, J.M., Malta, D.C.', journal: 'Ciência e Saúde Coletiva, November 2025', doi: 'http://cienciaesaudecoletiva.com.br/artigos/uso-de-machine-learning-para-predizer-o-consumo-de-frutas-e-hortalicas-em-pequenas-areas/19858?id=19858' },
	{ year: '2025', metas: ['4'], title: 'High-precision automatic classification of normal electrocardiograms: An AI-based model for the telehealth system', authors: 'Abreu, P.E.O.G.B., Ribeiro, A.H., Paixão, G.M.M., Schön, T.B., Gomes, P.R., Ribeiro, A.L.P.', journal: 'Journal of Electrocardiology, Volume 91, July–August 2025, 153988', doi: 'https://doi.org/10.1016/j.jelectrocard.2025.153988' }
];
