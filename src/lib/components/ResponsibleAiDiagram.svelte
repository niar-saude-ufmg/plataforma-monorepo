<script lang="ts">
	import Scale from 'lucide-svelte/icons/scale';
	import ScanEye from 'lucide-svelte/icons/scan-eye';
	import ShieldCheck from 'lucide-svelte/icons/shield-check';
	import Landmark from 'lucide-svelte/icons/landmark';
	import Database from 'lucide-svelte/icons/database';
	import Users from 'lucide-svelte/icons/users';
	import { m } from '$lib/paraglide/messages';
	import { t, type Localized } from '$lib/i18n';

	type DimensionKey =
		| 'transparencia'
		| 'justica'
		| 'privacidade'
		| 'governanca-dados'
		| 'governanca-ia'
		| 'centro';

	type Dimension = {
		key: DimensionKey;
		icon: typeof Scale;
		title: Localized;
		description: Localized;
		/**
		 * Cor do círculo. Ver a nota sobre a paleta no comentário do bloco de estilo.
		 * (Evite escrever nomes de tag entre sinais de menor/maior aqui: o scanner do
		 * svelte2tsx os lê como abertura de bloco real e quebra o svelte-check.)
		 */
		color: string;
		/**
		 * Distância do rótulo ao centro, quando DIST_ROTULO não serve para esta dimensão.
		 * Mexe só no texto: o centro da bolha continua em DIST_ROTULO para todas.
		 */
		dist?: number;
	};

	// A ORDEM DO ARRAY É A ORDEM NO ANEL: cada dimensão fica 72° adiante da anterior,
	// no sentido horário a partir do topo. Toda a geometria (centros, rótulos e
	// interseções) é derivada dessa ordem — trocar dois itens de lugar gira o desenho.
	//
	// A paleta, porém, é do LUGAR e não do tema: as cores percorrem um arco violeta ->
	// ciano -> azul -> teal escolhido para que círculos VIZINHOS contrastem entre si
	// (os preenchimentos são translúcidos e se sobrepõem, então matizes próximos lado a
	// lado geram sobreposições barrentas) e para o azul mais escuro cair embaixo, onde
	// pesa menos. Ao girar os temas, as cores FICARAM onde estavam: quem gira leva o
	// texto e o ícone, não o matiz.
	const dimensoes: Dimension[] = [
		{
			key: 'transparencia',
			icon: ScanEye,
			title: { pt: 'Transparência', en: 'Transparency' },
			description: {
				pt: 'Torna o funcionamento, decisões e limitações da IA compreensíveis e auditáveis.',
				en: 'Makes the operation, decisions, and limitations of AI understandable and auditable.'
			},
			color: '#7451c9',
			// Título de uma linha só: sem a segunda linha, o bloco fica com o dobro de ar
			// abaixo do ícone e parece afundado na pétala. Sobe 18 para compensar.
			dist: 415
		},
		{
			key: 'justica',
			icon: Scale,
			title: { pt: 'Justiça e Vieses', en: 'Fairness and Bias' },
			description: {
				pt: 'Promove equidade, identifica e mitiga vieses e discriminações para garantir decisões justas para todos.',
				en: 'Promotes equity, identifies and mitigates bias and discrimination to ensure fair decisions for everyone.'
			},
			color: '#3fa9d9'
		},
		{
			key: 'privacidade',
			icon: ShieldCheck,
			title: { pt: 'Privacidade e Segurança', en: 'Privacy and Security' },
			description: {
				pt: 'Protege dados pessoais e informações sensíveis, garantindo confidencialidade, integridade e conformidade com a legislação.',
				en: 'Protects personal data and sensitive information, ensuring confidentiality, integrity, and compliance with legislation.'
			},
			color: '#1f5fbf'
		},
		{
			key: 'governanca-dados',
			icon: Database,
			title: { pt: 'Governança de Dados', en: 'Data Governance' },
			description: {
				pt: 'Estabelece práticas para coleta, armazenamento, qualidade, compartilhamento e uso dos dados com confiabilidade, rastreabilidade e conformidade.',
				en: 'Establishes practices for the collection, storage, quality, sharing, and use of data with reliability, traceability, and compliance.'
			},
			color: '#0f1f5b'
		},
		{
			key: 'governanca-ia',
			icon: Landmark,
			title: { pt: 'Governança de IA', en: 'AI Governance' },
			description: {
				pt: 'Define políticas, processos e responsabilidades para garantir uso ético, seguro e alinhado aos objetivos da organização.',
				en: 'Defines policies, processes, and responsibilities to ensure ethical and secure use aligned with the organization’s objectives.'
			},
			color: '#0e9394'
		}
	];

	const centro: { title: Localized; subtitle: Localized } = {
		title: { pt: 'IA Responsável', en: 'Responsible AI' },
		subtitle: {
			pt: 'Confiança, ética e benefícios para todos',
			en: 'Trust, ethics, and benefits for all'
		}
	};

	// Textos das interseções. Num Venn de cinco círculos só os pares VIZINHOS têm uma
	// região própria (ver o comentário da geometria), então apenas esses cinco são
	// desenhados dentro do diagrama; os demais continuam na lista abaixo, que é a
	// versão lida por leitores de tela e mostrada em telas estreitas.
	const intersecoes: Array<{
		entre: [DimensionKey, DimensionKey];
		/**
		 * Palavra-chave mostrada no desenho em repouso. Só os pares vizinhos precisam
		 * dela, que são os únicos que aparecem no Venn; a frase inteira entra na bolha.
		 */
		curto?: Localized;
		text: Localized;
	}> = [
		{
			entre: ['transparencia', 'justica'],
			curto: { pt: 'Vieses auditáveis', en: 'Auditable bias' },
			text: {
				pt: 'Transparência para uma IA mais justa',
				en: 'Transparency for fairer AI'
			}
		},
		{
			entre: ['justica', 'centro'],
			text: {
				pt: 'Menos vieses, mais confiança e inclusão',
				en: 'Less bias, more trust and inclusion'
			}
		},
		{
			entre: ['justica', 'privacidade'],
			curto: { pt: 'Equidade protegida', en: 'Protected equity' },
			text: {
				pt: 'Equidade com respeito à privacidade',
				en: 'Equity with respect for privacy'
			}
		},
		{
			entre: ['transparencia', 'governanca-ia'],
			curto: { pt: 'Dados transparentes', en: 'Transparent data' },
			text: {
				pt: 'Transparência sobre o uso e proteção dos dados',
				en: 'Transparency on data use and protection'
			}
		},
		{
			entre: ['privacidade', 'centro'],
			text: {
				pt: 'Proteção de direitos e confiança do usuário',
				en: 'Protection of rights and user trust'
			}
		},
		{
			entre: ['transparencia', 'governanca-dados'],
			text: {
				pt: 'Accountability através de explicabilidade',
				en: 'Accountability through explainability'
			}
		},
		{
			entre: ['governanca-ia', 'governanca-dados'],
			curto: { pt: 'Alinhamento ético', en: 'Ethical alignment' },
			text: {
				pt: 'Governança alinha IA e dados aos seus objetivos éticos',
				en: 'Governance aligns AI and data with its ethical objectives'
			}
		},
		{
			entre: ['privacidade', 'governanca-dados'],
			curto: { pt: 'Conformidade', en: 'Compliance' },
			text: {
				pt: 'Segurança viabiliza confiança e conformidade',
				en: 'Security enables trust and compliance'
			}
		}
	];

	/* Interseções de TRÊS círculos. Cada faixa de trio acompanha o eixo de um círculo e é
	   formada por ele mais os dois vizinhos, então basta dizer qual é o do MEIO. A frase
	   é opcional: quando a palavra-chave já diz tudo, não há o que abrir no realce. */
	const trios: Array<{
		meio: DimensionKey;
		curto: Localized;
		text?: Localized;
		/**
		 * Giro em graus sobre o eixo do trio, quando o texto precisa fugir de uma borda.
		 * Positivo é no sentido do anel (horário). Mexe só no texto, não na região.
		 */
		desvio?: number;
	}> = [
		{
			meio: 'transparencia',
			curto: { pt: 'Decisões confiáveis', en: 'Trustworthy decisions' },
			text: {
				pt: 'Decisões justas, transparentes e bem governadas.',
				en: 'Fair, transparent and well-governed decisions.'
			}
		},
		{
			meio: 'justica',
			curto: { pt: 'Confiança e inclusão', en: 'Trust and inclusion' },
			text: {
				pt: 'Menos vieses, mais confiança, segurança e inclusão.',
				en: 'Less bias, more trust, security, and inclusion.'
			}
		},
		{
			meio: 'privacidade',
			// Os dois trios de baixo caíam em cima da borda do círculo que passa ali; giram
			// 4° um na direção do outro (os dois para o fundo do desenho) para escapar dela.
			desvio: 4,
			curto: { pt: 'Direitos preservados', en: 'Rights preserved' },
			text: {
				pt: 'Equidade nas decisões, proteção de direitos e uso responsável dos dados.',
				en: 'Equity in decisions, protection of rights, and responsible use of data.'
			}
		},
		{
			meio: 'governanca-dados',
			desvio: -4,
			curto: { pt: 'Governança transparente', en: 'Transparent governance' },
			text: {
				pt: 'Governança transparente sobre dados, IA e segurança.',
				en: 'Transparent governance over data, AI, and security.'
			}
		},
		{
			meio: 'governanca-ia',
			curto: { pt: 'Prestação de contas', en: 'Accountability' },
			text: {
				pt: 'Responsabilização através de explicabilidade e governança de IA.',
				en: 'Accountability through explainability and AI governance.'
			}
		}
	];

	/** Vizinha anterior / seguinte no anel — usadas para nomear um trio na lista. */
	function vizinhoAntes(key: DimensionKey): DimensionKey {
		const i = dimensoes.findIndex((d) => d.key === key);
		return dimensoes[(i - 1 + dimensoes.length) % dimensoes.length].key;
	}

	function vizinhoDepois(key: DimensionKey): DimensionKey {
		const i = dimensoes.findIndex((d) => d.key === key);
		return dimensoes[(i + 1) % dimensoes.length].key;
	}

	/** Título de uma dimensão pela chave — usado na lista das interseções. */
	function nomeDe(key: DimensionKey): string {
		if (key === 'centro') return t(centro.title);
		const dim = dimensoes.find((d) => d.key === key);
		return dim ? t(dim.title) : '';
	}

	/* GEOMETRIA DO VENN (viewBox 0 0 1000 1000)
	   =========================================
	   É um Venn convencional: cinco círculos iguais com centros num pentágono de raio
	   RAIO_ANEL em volta de CENTRO, e raio MAIOR que esse anel — por isso todo círculo
	   contém o centro do desenho e os cinco se sobrepõem numa região comum, em vez de
	   apenas se tocarem como numa rosácea decorativa.

	   Quem fixa os números:
	   - a LARGURA do desenho é 2 × (sen72° × anel + raio) = 1,902 × anel + 2 × raio, e é
	     ela (não a altura) que estoura primeiro o quadrado. Com anel 209 e raio 298 dá
	     ~994 dos 1000 disponíveis, ou seja, o desenho é o maior que cabe nessa proporção;
	   - a proporção raio/anel ≈ 1,43 é escolhida pela região central: dois círculos
	     OPOSTOS (144°) só deixam de cobrir o centro comum a partir de
	     u = (−1,618 × anel + √(1,618² × anel² + 4 × (raio² − anel²))) / 2 ≈ 102, ou seja,
	     a área comum aos CINCO comporta uma circunferência de raio 102.

	   O alcance de um círculo numa direção que faz Δ com o centro dele é
	   t(Δ) = anel × cosΔ + √(raio² − anel² × sen²Δ). Com anel 209 e raio 298:
	   t(0°) = 507, t(36°) = 441, t(72°) = 287, t(108°) = 157, t(144°) = 102. Essa tabela
	   descreve o desenho inteiro — cada valor é a distância em que se sai de um círculo:
	   - numa direção de CÍRCULO saem os dois opostos (144°) em 102 e os dois vizinhos
	     (72°) em 287: a faixa 102–287 pertence a três círculos, e daí para fora só ao
	     próprio (a "pétala" onde fica o rótulo);
	   - numa BISSETRIZ sai o círculo de trás (180°) em 89, saem os dois de 108° em 157 e
	     os dois do par em 441: a faixa 89–157 pertence a QUATRO círculos, e 157–441 é a
	     lente só do par vizinho, que é onde vai o texto de interseção.

	   RAIO_HUB sai daí: o disco escuro existe para cobrir as sobreposições de quatro e
	   cinco itens, que são as que não têm leitura própria. O valor "exato" seria 157 — o
	   ponto mais distante do centro que ainda pertence a quatro círculos, encostando na
	   ponta das cinco lentes de par vizinho. Ficamos com 140 por decisão visual: em 157 o
	   disco pesava demais no meio do desenho, e o que escapa em 140 é só a pontinha de
	   cada faixa de quatro, junto às pontas das lentes. As sobreposições que ficam à
	   vista continuam sendo as de três e as de dois, e o hub as costura no meio.

	   Onde o texto pode ficar, em distância a partir de CENTRO:
	   - RÓTULO de cada dimensão, na direção do próprio círculo: a partir de ~287 o ponto
	     já saiu dos dois vizinhos (é a "pétala" exclusiva) e vai até anel + raio = 507.
	     DIST_ROTULO = 397 é o meio dessa faixa e é também o centro da
	     bolha da pétala,
	     para a bolha inflar centrada no texto. Empurrar TODOS os rótulos para fora (já
	     tentamos, a 425) desequilibra o desenho; quem precisa de ajuste sobe sozinho pelo
	     campo `dist` da própria dimensão. A pétala é estreita nas duas pontas: a ~350 do
	     centro ela tem ±116 de largura, a ~440 tem ±186. Por isso o rótulo em repouso é só
	     ÍCONE + TÍTULO: a descrição não cabe aqui em tamanho legível, e aparece na bolha
	     (ver o realce no estilo);
	   - INTERSEÇÃO de um par vizinho, na bissetriz entre os dois: a faixa que está nos
	     dois e fora dos outros três vai de ~158 a ~441. DIST_INTERSECAO = 299 é o meio
	     dela, onde a largura disponível (~±170) acomoda com sobra os 15cqw do bloco.

	   Pares OPOSTOS (144°) também se cruzam, mas a lente que formam fica inteira dentro
	   do círculo que está entre eles ou dentro da região central — não existe área só
	   deles. Por isso só os cinco pares vizinhos recebem texto no desenho. */
	const CENTRO_X = 500;
	const CENTRO_Y = 520;
	const RAIO_ANEL = 209;
	const RAIO_CIRCULO = 298;
	const RAIO_HUB = 140;
	const DIST_ROTULO = 397;
	const DIST_INTERSECAO = 299;
	/* O texto do trio puxa para DENTRO do meio visível da faixa. A faixa vai de 102 a 287
	   e o núcleo cobre até 140, então o meio do que se vê seria ~213; a 197 a chave do
	   trio fica mais perto do núcleo, alinhada com o resto do desenho. O piso é ~190: uma
	   chave de duas linhas tem ~40 de altura, e abaixo disso ela encosta no disco. */
	const DIST_TRIO = 197;
	const N = dimensoes.length;
	const PASSO = 360 / N;

	/** Ponto do viewBox a `distancia` do centro, no ângulo dado (0° = topo, horário). */
	function ponto(angulo: number, distancia: number) {
		const rad = (angulo * Math.PI) / 180;
		return {
			x: CENTRO_X + distancia * Math.sin(rad),
			y: CENTRO_Y - distancia * Math.cos(rad)
		};
	}

	/* Os textos são HTML sobreposto ao SVG, então precisam do mesmo ponto em % do
	   container — como o viewBox tem 1000 de lado, é só dividir por 10. */
	function pontoPct(angulo: number, distancia: number) {
		const p = ponto(angulo, distancia);
		return { x: p.x / 10, y: p.y / 10 };
	}

	const circulos = dimensoes.map((dim, i) => ({
		...dim,
		centro: ponto(i * PASSO, RAIO_ANEL),
		rotulo: pontoPct(i * PASSO, dim.dist ?? DIST_ROTULO)
	}));

	const hub = pontoPct(0, 0);

	/** Par de dimensões VIZINHAS no anel: bissetriz entre elas e índice do primeiro. */
	function parVizinho(a: DimensionKey, b: DimensionKey): { angulo: number; indice: number } | null {
		const i = dimensoes.findIndex((d) => d.key === a);
		const j = dimensoes.findIndex((d) => d.key === b);
		if (i < 0 || j < 0) return null;
		const salto = (j - i + N) % N;
		if (salto === 1) return { angulo: i * PASSO + PASSO / 2, indice: i };
		if (salto === N - 1) return { angulo: j * PASSO + PASSO / 2, indice: j };
		return null;
	}

	const intersecoesVenn = intersecoes.flatMap((item) => {
		const par = parVizinho(item.entre[0], item.entre[1]);
		if (par === null) return [];
		return [{ ...item, id: `par-${par.indice}`, ...pontoPct(par.angulo, DIST_INTERSECAO) }];
	});

	const triosVenn = trios.flatMap((item) => {
		const i = dimensoes.findIndex((d) => d.key === item.meio);
		if (i < 0) return [];
		return [{ ...item, id: `trio-${i}`, ...pontoPct(i * PASSO + (item.desvio ?? 0), DIST_TRIO) }];
	});

	/* AS 21 REGIÕES DO ARRANJO E O REALCE NO MOUSE
	   ============================================
	   O desenho tem 21 áreas: 5 pétalas (um círculo só), 5 lentes de par vizinho, 5
	   faixas de trio, 5 faixas de quatro e a central de cinco — estas seis últimas ficam
	   debaixo do hub. As 15 primeiras viram um path próprio, que é o que reage ao mouse.

	   Os paths são recortes EXATOS, então não se sobrepõem: cada ponto do desenho cai num
	   único path, e não há ordem de pintura a acertar para o hit-test sair certo. Todo
	   vértice do arranjo está num dos quatro raios da tabela de alcance (441, 287, 157 e
	   102) e toda aresta é um arco de um dos cinco círculos — daí as três formas abaixo,
	   cada uma instanciada cinco vezes pela rotação de 72°.

	   O sentido de cada arco (os flags do comando A do SVG) não está escrito à mão: das
	   duas voltas possíveis entre dois vértices, `arco` fica com a que tem o MEIO dentro
	   da região, usando o mesmo teste de pertinência que define a região. */
	type Ponto = { x: number; y: number };

	/** Até onde um círculo alcança numa direção que faz `delta` graus com o centro dele. */
	function alcance(delta: number): number {
		const rad = (delta * Math.PI) / 180;
		return (
			RAIO_ANEL * Math.cos(rad) + Math.sqrt(RAIO_CIRCULO ** 2 - (RAIO_ANEL * Math.sin(rad)) ** 2)
		);
	}

	const V_PAR = alcance(36); // ~441: ponta externa da lente de um par vizinho
	const V_TRIO = alcance(72); // ~287: ponta externa de uma faixa de trio
	const V_QUARTETO = alcance(108); // ~157: canto de uma faixa de quatro
	const V_QUINTETO = alcance(144); // ~102: ponta interna de uma faixa de trio

	const indiceNoAnel = (i: number) => ((i % N) + N) % N;
	const anguloDe = (i: number) => indiceNoAnel(i) * PASSO;
	const centroDe = (i: number) => ponto(anguloDe(i), RAIO_ANEL);

	/** O ponto está dentro de todos os círculos de `dentro` e fora dos de `fora`? */
	function pertence(p: Ponto, dentro: number[], fora: number[]): boolean {
		// Vértices e meios de arco ficam EM cima de um círculo, daí a tolerância.
		const TOL = 0.5;
		const dist = (i: number) => Math.hypot(p.x - centroDe(i).x, p.y - centroDe(i).y);
		return (
			dentro.every((i) => dist(i) <= RAIO_CIRCULO + TOL) &&
			fora.every((i) => dist(i) >= RAIO_CIRCULO - TOL)
		);
	}

	const xy = (p: Ponto) => `${p.x.toFixed(1)} ${p.y.toFixed(1)}`;

	/* Os arcos são escritos como CÚBICAS, e não com o comando A do SVG, porque a peça
	   realçada vira uma bolha por interpolação do próprio `d` (ver o realce no estilo):
	   o navegador só interpola dois caminhos com a MESMA lista de comandos, e arco para
	   arco ainda esbarraria nos flags, que não interpolam — saltam no meio da transição.
	   Com PARTES pedaços por aresta, região e bolha têm a mesma contagem de cúbicas. */
	const PARTES = 4;

	function cubicas(o: Ponto, raio: number, inicio: number, delta: number, partes: number): string {
		let d = '';
		const passo = delta / partes;
		const k = (4 / 3) * Math.tan(passo / 4);
		for (let i = 0; i < partes; i++) {
			const a = inicio + passo * i;
			const b = a + passo;
			const p0 = { x: o.x + raio * Math.cos(a), y: o.y + raio * Math.sin(a) };
			const p3 = { x: o.x + raio * Math.cos(b), y: o.y + raio * Math.sin(b) };
			const c1 = { x: p0.x - k * raio * Math.sin(a), y: p0.y + k * raio * Math.cos(a) };
			const c2 = { x: p3.x + k * raio * Math.sin(b), y: p3.y - k * raio * Math.cos(b) };
			d += ` C ${xy(c1)} ${xy(c2)} ${xy(p3)}`;
		}
		return d;
	}

	function aresta(p: Ponto, q: Ponto, o: Ponto, dentro: number[], fora: number[]): string {
		const VOLTA = Math.PI * 2;
		const a1 = Math.atan2(p.y - o.y, p.x - o.x);
		const a2 = Math.atan2(q.y - o.y, q.x - o.x);
		const positivo = (((a2 - a1) % VOLTA) + VOLTA) % VOLTA;
		for (const delta of [positivo, positivo - VOLTA]) {
			const meio = a1 + delta / 2;
			const m = { x: o.x + RAIO_CIRCULO * Math.cos(meio), y: o.y + RAIO_CIRCULO * Math.sin(meio) };
			if (!pertence(m, dentro, fora)) continue;
			return cubicas(o, RAIO_CIRCULO, a1, delta, PARTES);
		}
		// Não acontece com os vértices abaixo: um dos dois arcos é sempre da região.
		return ` L ${xy(q)}`;
	}

	/* A bolha em que a peça se transforma: mesmo número de cúbicas, mesmo sentido (todas
	   as regiões são desenhadas em sentido horário) e começando no ângulo do primeiro
	   vértice da peça. É isso que faz o morph parecer a peça inflando, e não torcendo. */
	function bolha(centro: Ponto, raio: number, primeiro: Ponto, partes: number): string {
		const inicio = Math.atan2(primeiro.y - centro.y, primeiro.x - centro.x);
		const p0 = { x: centro.x + raio * Math.cos(inicio), y: centro.y + raio * Math.sin(inicio) };
		return `M ${xy(p0)}${cubicas(centro, raio, inicio, Math.PI * 2, partes)} Z`;
	}

	/** Cor que as camadas translúcidas produzem sobre o branco, com o alfa dado. */
	function mistura(cores: string[], alfa: number): string {
		const canais = [255, 255, 255];
		for (const cor of cores) {
			for (let c = 0; c < 3; c++) {
				const valor = parseInt(cor.slice(1 + c * 2, 3 + c * 2), 16);
				canais[c] = alfa * valor + (1 - alfa) * canais[c];
			}
		}
		return `rgb(${canais.map((v) => Math.round(v)).join(' ')})`;
	}

	type Aresta = { p: Ponto; circulo: number };
	type Regiao = {
		id: string;
		d: string;
		bolha: string;
		fill: string;
		origem: Ponto;
	};

	/* Raio da bolha, o MESMO para as quinze peças: no ar elas viram todas o mesmo círculo,
	   e é o tamanho que diz "esta é a peça em foco", não o nível dela. Quem fixa o piso é a
	   pétala, a única que carrega título e descrição — a meia-diagonal daquele bloco é ~145,
	   então abaixo disso o texto vazaria da bolha. As bolhas não precisam caber lado a lado:
	   só uma peça fica no ar por vez, e as vizinhas nunca aparecem juntas na tela.

	   Toda bolha nasce CENTRADA no mesmo ponto em que o texto da peça já estava, para o
	   realce ler como a peça inflando no lugar. A de uma pétala não cabe no quadrado por
	   causa disso — a pétala já encosta na borda —, então ela transborda ~8% do lado do
	   diagrama, e é o estilo que reserva esse espaço em volta (ver a medida do quadrado).
	   Já tentamos o contrário: recuar o centro da bolha até caber. Ficava com cara de
	   pétala encolhendo para dentro, diferente dos outros dois níveis, que inflam. */
	const RAIO_BOLHA = 200;

	/* `arestas[k].circulo` é o círculo em que corre o arco que SAI do vértice k. A cor é a
	   mesma mistura que as camadas produzem ali, só que com alfa maior: no realce a peça
	   fica mais densa sem mudar de matiz. */
	function montar(id: string, cru: number[], arestas: Aresta[], origem: Ponto): Regiao {
		const dentro = cru.map(indiceNoAnel);
		const fora = dimensoes.map((_, i) => i).filter((i) => !dentro.includes(i));
		let d = `M ${xy(arestas[0].p)}`;
		arestas.forEach((lado, k) => {
			const proximo = arestas[(k + 1) % arestas.length].p;
			d += aresta(lado.p, proximo, centroDe(lado.circulo), dentro, fora);
		});
		return {
			id,
			d: `${d} Z`,
			bolha: bolha(origem, RAIO_BOLHA, arestas[0].p, arestas.length * PARTES),
			fill: mistura(
				dentro.sort((x, y) => x - y).map((i) => dimensoes[i].color),
				0.26
			),
			origem
		};
	}

	const regioes: Regiao[] = dimensoes.flatMap((dim, i) => {
		const eixo = anguloDe(i);
		const bissetriz = eixo + PASSO / 2;
		return [
			// Nível 1: a pétala do próprio círculo, um triângulo curvo com a ponta para dentro.
			montar(
				`petala-${dim.key}`,
				[i],
				[
					{ p: ponto(eixo - PASSO / 2, V_PAR), circulo: i },
					{ p: ponto(eixo + PASSO / 2, V_PAR), circulo: i + 1 },
					{ p: ponto(eixo, V_TRIO), circulo: i - 1 }
				],
				ponto(eixo, DIST_ROTULO)
			),
			// Nível 2: a lente do par (i, i+1), entre a ponta em 441 e o canto em 157.
			montar(
				`par-${i}`,
				[i, i + 1],
				[
					{ p: ponto(bissetriz, V_PAR), circulo: i },
					{ p: ponto(anguloDe(i + 1), V_TRIO), circulo: i + 2 },
					{ p: ponto(bissetriz, V_QUARTETO), circulo: i - 1 },
					{ p: ponto(eixo, V_TRIO), circulo: i + 1 }
				],
				ponto(bissetriz, (V_PAR + V_QUARTETO) / 2)
			),
			// Nível 3: a faixa do trio (i-1, i, i+1), entre 287 e 102 no eixo do círculo i.
			montar(
				`trio-${i}`,
				[i - 1, i, i + 1],
				[
					{ p: ponto(eixo, V_TRIO), circulo: i - 1 },
					{ p: ponto(bissetriz, V_QUARTETO), circulo: i + 2 },
					{ p: ponto(eixo, V_QUINTETO), circulo: i - 2 },
					{ p: ponto(eixo - PASSO / 2, V_QUARTETO), circulo: i + 1 }
				],
				ponto(eixo, (V_TRIO + V_QUINTETO) / 2)
			)
		];
	});

	/* A dica só começa quando o diagrama aparece na tela: se disparasse no carregamento,
	   ela já teria acabado quando alguém rolasse até aqui. */
	let dica = $state(false);

	/* Qual peça está sob o mouse. O realce é do desenho inteiro (peça + texto), então o
	   estado mora aqui em vez de sair de um :hover em cada elemento. */
	let ativa: string | null = $state(null);

	/* MORPH DA BOLHA, EM JAVASCRIPT
	   O caminho de uma peça e o da bolha dela têm a MESMA lista de comandos (ver PARTES),
	   então basta interpolar número a número para um virar o outro. Fazíamos isso pelo
	   CSS, com `transition: d`, até descobrir que o Safari não implementa `d` como
	   propriedade — lá a peça acendia mas nunca virava círculo. Em JS funciona em todo
	   navegador, e de quebra a duração e a suavização ficam onde dá para lê-las. */
	const MORPH_MS = 320;

	/** Quebra um caminho em pedaços: letras de comando e números, na ordem em que estão. */
	function fatiar(caminho: string): string[] {
		return caminho.match(/[A-Za-z]|-?\d+(?:\.\d+)?/g) ?? [];
	}

	const formas = regioes.map((r) => ({ de: fatiar(r.d), para: fatiar(r.bolha) }));

	function caminhoEm(indice: number, t: number): string {
		const { de, para } = formas[indice];
		let saida = '';
		for (let k = 0; k < de.length; k++) {
			const n = Number(de[k]);
			saida += (Number.isNaN(n) ? de[k] : (n + (Number(para[k]) - n) * t).toFixed(1)) + ' ';
		}
		return saida;
	}

	/** Aceleração no começo, freio no fim — o mesmo espírito da curva que o CSS usava. */
	const suavizar = (t: number) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2);

	let pinceis: Array<SVGPathElement | null> = $state([]);
	const progresso = regioes.map(() => 0);
	let quadro: number | null = null;
	let instante = 0;

	function passo(agora: number) {
		const dt = instante ? agora - instante : 16;
		instante = agora;
		let andando = false;
		regioes.forEach((reg, i) => {
			const alvo = ativa === reg.id ? 1 : 0;
			if (progresso[i] === alvo) return;
			const direcao = Math.sign(alvo - progresso[i]);
			const novo = progresso[i] + (direcao * dt) / MORPH_MS;
			progresso[i] = direcao > 0 ? Math.min(novo, 1) : Math.max(novo, 0);
			pinceis[i]?.setAttribute('d', caminhoEm(i, suavizar(progresso[i])));
			andando = true;
		});
		quadro = andando ? requestAnimationFrame(passo) : null;
		if (!andando) instante = 0;
	}

	/** O sistema pediu menos movimento? Então a peça acende, mas não vira bolha. */
	const semMovimento = () =>
		typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

	$effect(() => {
		ativa; // é a mudança dela que acorda o motor
		if (semMovimento()) return;
		if (quadro === null) {
			instante = 0;
			quadro = requestAnimationFrame(passo);
		}
	});

	$effect(() => () => {
		if (quadro !== null) cancelAnimationFrame(quadro);
	});

	/* Rodízio de destaque: de tempos em tempos uma peça sorteada se acende sozinha, para
	   contar que o desenho responde ao mouse. Só roda depois que o diagrama aparece na
	   tela, cala enquanto o mouse está numa peça e volta quando ele sai. */
	let destaque: string | null = $state(null);
	const PAUSA_DESTAQUE = 2600;

	$effect(() => {
		const parado =
			typeof window !== 'undefined' &&
			window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		if (!dica || parado || ativa !== null) {
			destaque = null;
			return;
		}
		// `anterior` mora aqui, e não no estado, para o sorteio não reiniciar o próprio
		// intervalo: o efeito só depende de quem o mouse está tocando.
		let anterior: string | null = null;
		const sortear = () => {
			const outras = regioes.filter((r) => r.id !== anterior);
			anterior = outras[Math.floor(Math.random() * outras.length)].id;
			destaque = anterior;
		};
		sortear();
		const relogio = setInterval(sortear, PAUSA_DESTAQUE);
		return () => clearInterval(relogio);
	});
</script>

<div>
	<div class="mx-auto max-w-3xl text-center">
		<p class="text-sm font-semibold tracking-widest text-secondary uppercase">
			{m.about_dimensions_eyebrow()}
		</p>
		<h2 class="mt-2 text-3xl font-bold tracking-tight text-primary sm:text-4xl">
			{m.about_dimensions_heading()}
		</h2>
		<p class="mt-4 text-lg leading-relaxed text-muted-foreground">
			{m.about_dimensions_subtitle()}
		</p>
	</div>

	<!--
		Duas apresentações dos MESMOS dados:
		- venn: só a partir de lg. Um Venn de 5 círculos com texto interno fica
		  ilegível em telas estreitas. É decorativo (aria-hidden) — a lista abaixo é
		  a fonte lida por leitores de tela, então nada é anunciado duas vezes.
		- lista: sempre no DOM. Visível abaixo de lg, e sr-only a partir de lg.
	-->
	<div
		class="venn relative mx-auto hidden aspect-square lg:block"
		{@attach (node) => {
			const observador = new IntersectionObserver(
				(entradas) => {
					if (entradas.some((e) => e.isIntersecting)) {
						dica = true;
						observador.disconnect();
					}
				},
				{ threshold: 0.35 }
			);
			observador.observe(node);
			return () => observador.disconnect();
		}}
	>
		<svg viewBox="0 0 1000 1000" class="absolute inset-0 h-full w-full" aria-hidden="true">
			{#each circulos as dim (dim.key)}
				<circle
					cx={dim.centro.x}
					cy={dim.centro.y}
					r={RAIO_CIRCULO}
					fill={dim.color}
					fill-opacity="0.16"
					stroke={dim.color}
					stroke-opacity="0.5"
					stroke-width="2"
				/>
			{/each}

			<circle cx={CENTRO_X} cy={CENTRO_Y} r={RAIO_HUB} fill="var(--azul-profundo)" />

			<!-- Aqui as peças são só ALVO: invisíveis, existem para receber o mouse. Quem
			     pinta a realçada é a camada de cima (ver o comentário das camadas). Manter o
			     alvo com a forma parada, e não crescendo junto, deixa o mapa de hover
			     estável: a fronteira entre duas peças não se mexe enquanto uma está no ar. -->
			{#each regioes as reg (reg.id)}
				<path
					class="venn-alvo"
					class:destacada={destaque === reg.id}
					role="presentation"
					data-regiao={reg.id}
					d={reg.d}
					pathLength="1"
					stroke="var(--azul-profundo)"
					style="--cor: {reg.fill}"
					onmouseenter={() => (ativa = reg.id)}
					onmouseleave={() => {
						if (ativa === reg.id) ativa = null;
					}}
				/>
			{/each}

			<!-- Guarda: com o núcleo pintado lá embaixo, as peças que passam por baixo dele
			     também ficariam por cima no hit-test, e passear o mouse pelo miolo realçaria
			     um trio atrás do disco. Este círculo transparente no topo da pilha devolve o
			     miolo ao núcleo — no meio do desenho, nada é realçado. -->
			<circle class="venn-guarda" cx={CENTRO_X} cy={CENTRO_Y} r={RAIO_HUB} />
		</svg>

		<!-- pointer-events-none: quem responde ao mouse são os paths do SVG, que estão
		     embaixo. Sem isso um rótulo roubaria o hover da própria peça que o contém. -->
		<div class="pointer-events-none absolute inset-0" aria-hidden="true">
			{#each circulos as dim (dim.key)}
				<div
					class="venn-dim absolute -translate-x-1/2 -translate-y-1/2 text-center"
					class:ativa={ativa === `petala-${dim.key}`}
					style="left: {dim.rotulo.x}%; top: {dim.rotulo.y}%; color: {dim.color}"
				>
					<dim.icon class="venn-icon mx-auto" />
					<p class="venn-title mt-1 font-bold uppercase">{t(dim.title)}</p>
					<p class="venn-desc mt-1 leading-snug text-foreground">{t(dim.description)}</p>
				</div>
			{/each}

			{#each intersecoesVenn as item (item.text.pt)}
				<div
					class="venn-inter absolute -translate-x-1/2 -translate-y-1/2 text-center leading-snug text-foreground"
					class:ativa={ativa === item.id}
					style="left: {item.x}%; top: {item.y}%"
				>
					<p class="venn-inter-chave font-semibold">{t(item.curto ?? item.text)}</p>
					<p class="venn-inter-frase mt-1">{t(item.text)}</p>
				</div>
			{/each}

			{#each triosVenn as item (item.id)}
				<div
					class="venn-trio absolute -translate-x-1/2 -translate-y-1/2 text-center leading-snug text-foreground"
					class:ativa={ativa === item.id}
					style="left: {item.x}%; top: {item.y}%"
				>
					<p class="venn-trio-chave font-semibold">{t(item.curto)}</p>
					{#if item.text}
						<p class="venn-trio-frase mt-1">{t(item.text)}</p>
					{/if}
				</div>
			{/each}

			<div
				class="venn-hub absolute -translate-x-1/2 -translate-y-1/2 text-center text-white"
				style="left: {hub.x}%; top: {hub.y}%"
			>
				<Users class="venn-hub-icon mx-auto" />
				<p class="venn-hub-title mt-1 font-bold">{t(centro.title)}</p>
				<p class="venn-hub-sub mt-0.5 leading-snug text-white/85">{t(centro.subtitle)}</p>
			</div>
		</div>

		<!-- Camada de cima: as mesmas peças, sem mouse, só para PINTAR a que está realçada
		     acima dos textos. O texto da própria peça sobe junto (ver .ativa no estilo). -->
		<svg
			viewBox="0 0 1000 1000"
			class="venn-topo pointer-events-none absolute inset-0 h-full w-full"
			aria-hidden="true"
		>
			{#each regioes as reg, i (reg.id)}
				<path
					bind:this={pinceis[i]}
					class="venn-regiao"
					class:ativa={ativa === reg.id}
					d={reg.d}
					fill={reg.fill}
					stroke="var(--azul-profundo)"
				/>
			{/each}
		</svg>
	</div>

	<div class="mt-12 lg:sr-only">
		<div class="grid gap-6 sm:grid-cols-2">
			{#each dimensoes as dim (dim.key)}
				<div class="rounded-2xl bg-muted p-6 ring-1 ring-border">
					<dim.icon class="h-9 w-9" style="color: {dim.color}" />
					<h3 class="mt-3 text-lg font-bold" style="color: {dim.color}">{t(dim.title)}</h3>
					<p class="mt-2 leading-relaxed text-muted-foreground">{t(dim.description)}</p>
				</div>
			{/each}

			<div
				class="flex flex-col justify-center rounded-2xl bg-primary p-6 text-center text-white sm:col-span-2"
			>
				<Users class="mx-auto h-9 w-9" />
				<p class="mt-3 text-lg font-bold">{t(centro.title)}</p>
				<p class="mt-1 text-white/85">{t(centro.subtitle)}</p>
			</div>
		</div>

		<ul class="mt-6 grid gap-3 sm:grid-cols-2">
			{#each trios as item (item.curto.pt)}
				<li class="rounded-xl bg-muted p-4 ring-1 ring-border">
					<p class="text-xs font-semibold tracking-wide text-secondary uppercase">
						{nomeDe(vizinhoAntes(item.meio))} + {nomeDe(item.meio)} + {nomeDe(
							vizinhoDepois(item.meio)
						)}
					</p>
					<p class="mt-1 leading-relaxed text-foreground">{t(item.text ?? item.curto)}</p>
				</li>
			{/each}

			{#each intersecoes as item (item.text.pt)}
				<!-- bg-muted, e não bg-white: a seção que envolve o diagrama é branca. -->
				<li class="rounded-xl bg-muted p-4 ring-1 ring-border">
					<p class="text-xs font-semibold tracking-wide text-secondary uppercase">
						{nomeDe(item.entre[0])} + {nomeDe(item.entre[1])}
					</p>
					<p class="mt-1 leading-relaxed text-foreground">{t(item.text)}</p>
				</li>
			{/each}
		</ul>
	</div>

	<!-- Síntese do diagrama: apresentação -> visualização -> síntese. Sem caixa, sem
	     ring: a moldura fazia a frase parecer um aviso da interface, quando ela é a
	     conclusão conceitual do desenho. O fio fino (704px, mais estreito que o texto)
	     é o único separador de que ela precisa. -->
	<hr class="mx-auto mt-12 w-full max-w-[44rem] border-t border-border" />
	<p class="mx-auto mt-6 max-w-[50rem] text-center text-lg leading-relaxed text-muted-foreground">
		{m.about_dimensions_footer()}
	</p>
</div>

<style>
	/* O texto do Venn é HTML sobreposto ao SVG (e não elementos de texto dentro dele)
	   para ganhar quebra de linha automática — o SVG não quebra texto sozinho, e os
	   textos têm comprimentos bem diferentes em PT e EN.

	   As medidas ficam em cqw (1cqw = 1% da largura do container) para o diagrama
	   escalar como um bloco só: assim o texto acompanha os círculos em qualquer
	   largura, sem media query por tamanho. */
	.venn {
		container-type: inline-size;
		isolation: isolate;
	}

	/* O diagrama é quadrado, e o lado dele é a MENOR entre três coisas: um teto de
	   largura, a largura da coluna e a altura livre da tela. Os três termos, na ordem:

	   84%, e não 100%, da coluna: a bolha de uma pétala lateral passa ~8% do lado para
	   FORA do quadrado (ver RAIO_BOLHA), e sem essa folga de cada lado ela criaria
	   rolagem horizontal na página quando é a coluna que manda no tamanho.

	   74rem = 1184px é o teto absoluto. A seção do diagrama usa max-w-7xl (e não o
	   max-w-6xl das demais) justamente para ele caber; os textos internos continuam em
	   max-w-3xl/4xl, então a coluna mais larga só serve ao desenho.

	   A altura livre é o termo que manda em quase toda tela. As 13rem descontadas são o
	   que aparece ACIMA do diagrama (96px de padding da seção + ~142 de título e
	   subtítulo); reservamos menos que a soma de propósito, e a diferença sai do padding
	   de topo, que tem 96 de folga — com a seção rolada até o topo, título e subtítulo
	   continuam inteiros, só com menos ar acima. O parágrafo de fecho fica fora da conta:
	   é um comentário sobre o desenho e cabe lê-lo depois de um empurrãozinho de rolagem.
	   O `max(28rem, …)` é um piso: abaixo disso o texto interno fica ilegível.

	   O /1,09 e a margem de 9% são o espaço que a bolha da pétala DE CIMA precisa acima
	   do quadrado (ela transborda ~7,7% do lado). A margem entra no mesmo orçamento
	   vertical, por isso ela divide a altura livre em vez de só somar. Como as duas saem
	   do mesmo --lado, mudar o raio da bolha é mudar esses dois números juntos.

	   svh, e não vh: no mobile o vh ignora a barra de endereço, mas aqui isso não chega a
	   importar porque o Venn só existe a partir de lg. */
	.venn {
		--lado: min(84%, 74rem, max(28rem, (100svh - 13rem) / 1.09));

		width: var(--lado);
		margin-top: calc(0.09 * var(--lado));
	}

	/* REALCE NO MOUSE
	   As peças (os paths do SVG) são invisíveis em repouso e só existem para receber o
	   mouse; ao ativar, a peça aparece com a cor densa, ganha sombra, sobe um tico e VIRA
	   UMA BOLHA: o `d` do path é interpolado da forma recortada para um círculo em volta
	   do próprio texto. As duas formas são cúbicas na mesma quantidade (ver PARTES), que
	   é o que permite ao navegador interpolar uma na outra. O texto que mora na peça
	   cresce junto, e usa a propriedade `scale` em vez de `transform` para não brigar com
	   o `translate` das utilitárias que centralizam o bloco.

	   Navegador sem suporte a animar `d` (anterior a 2022) ignora a linha e fica só com a
	   cor e a sombra — o realce continua de pé, sem a graça do morph.

	   O `overflow: visible` no SVG é pela SOMBRA: as bolhas cabem dentro do quadrado (ver
	   RAIO_BOLHA), mas o borrão da sombra vaza, e sem isso ele seria cortado em linha reta
	   na borda. */
	.venn svg {
		overflow: visible;
	}

	.venn-guarda,
	.venn-alvo {
		fill: transparent;
		pointer-events: all;
	}

	/* AS CAMADAS, de baixo para cima: SVG base (círculos, núcleo, alvos de mouse) →
	   textos → SVG de cima (a peça realçada) → texto da peça realçada. É o que faz uma
	   peça no ar passar por cima do núcleo E dos rótulos vizinhos, sem esconder o próprio
	   texto. Os z-index só valem aqui dentro por causa do isolation na .venn; os textos
	   ficam em z-index automático, então basta a peça de cima ser 2 e o texto dela 3. */
	.venn-topo {
		z-index: 2;
	}

	.venn-regiao {
		fill-opacity: 0;
		stroke-opacity: 0;
		stroke-width: 1.5;
		transition:
			fill-opacity 180ms ease,
			stroke-opacity 180ms ease;
	}

	/* DICA DE INTERAÇÃO
	   Enquanto ninguém mexe, o desenho se destaca sozinho: de tempos em tempos uma peça
	   sorteada acende o contorno e ganha um véu de cor, com entrada lenta (700ms) para
	   parecer respiração e não pisca-pisca. É o que conta ao visitante que cada pedaço do
	   Venn é uma peça, e não um desenho chapado.

	   Quem manda é o mouse: assim que ele entra numa peça o rodízio para, e quando sai ele
	   volta (a lógica está no efeito lá em cima). Por isso a regra do realce vem DEPOIS
	   desta: as duas têm a mesma força, e quem estiver por último ganha.

	   O cursor continua o normal, de propósito: a peça não é clicável, e `pointer`
	   prometeria um clique que não existe. Quem avisa é a própria resposta ao mouse, que
	   é imediata e grande — mais eloquente que qualquer seta. */
	/* O rodízio pinta no ALVO, que vive na camada de baixo, e não na peça de cima: lá em
	   cima o véu passaria por cima dos textos e lavaria as palavras. Aqui ele fica onde
	   deve — sobre os círculos, sob o texto —, como uma sombra do próprio desenho. A peça
	   de cima continua reservada ao hover, que aí sim tem de cobrir tudo. */
	.venn-alvo {
		stroke-opacity: 0;
		stroke-width: 3.2;
		transition:
			fill-opacity 700ms ease,
			stroke-opacity 700ms ease;
	}

	.venn-alvo.destacada {
		fill: var(--cor);
		fill-opacity: 0.38;
		stroke-opacity: 0.9;
		/* Com pathLength="1" no path, o contorno inteiro vale 1: um traço de 1 seguido de
		   um vão de 1, e o deslocamento indo de 1 a 0 desenha a borda de ponta a ponta. */
		stroke-dasharray: 1;
		animation: venn-traco 900ms ease-out both;
	}

	@keyframes venn-traco {
		from {
			stroke-dashoffset: 1;
		}
		to {
			stroke-dashoffset: 0;
		}
	}

	.venn-regiao.ativa {
		fill-opacity: 1;
		stroke-opacity: 0.3;
		filter: drop-shadow(0 6px 18px rgb(15 31 91 / 0.3));
	}

	.venn-inter {
		transition: scale 320ms cubic-bezier(0.2, 0.7, 0.3, 1);
	}

	.venn-dim.ativa,
	.venn-inter.ativa {
		z-index: 3;
		scale: 1.05;
	}

	@media (prefers-reduced-motion: reduce) {
		/* O rodízio nem chega a começar quando o sistema pede menos movimento (o efeito
		   consulta a mesma media query), então aqui não há o que desligar. */

		.venn-regiao,
		.venn-dim,
		.venn-inter {
			transition-duration: 1ms;
		}

		.venn-dim.ativa,
		.venn-inter.ativa,
		.venn-trio.ativa {
			scale: 1;
		}
	}

	/* Em repouso o rótulo é só ícone + título, porque é o que cabe dentro da pétala (ver
	   DIST_ROTULO). A largura da caixa não é folga, é quebra de linha: a 18cqw os títulos
	   longos partem em duas linhas equilibradas ("PRIVACIDADE E" / "SEGURANÇA"), e tanto
	   estreitar quanto alargar piora o encaixe — a 19cqw a primeira linha fica comprida
	   demais e quatro dos cinco rótulos passam da borda da pétala. */
	.venn-dim {
		width: 18cqw;
		transition: scale 320ms cubic-bezier(0.2, 0.7, 0.3, 1);
	}

	.venn-dim :global(.venn-icon) {
		width: 4cqw;
		height: 4cqw;
	}

	/* 2,2cqw é onde o título fica grande e ainda bem posto. Medir só a caixa do texto
	   engana aqui: a essa altura ela acusa uns 14 unidades de canto fora da pétala, mas o
	   canto é entrelinha, não letra — no desenho as palavras ficam dentro. Acima disso o
	   estrago passa a ser real: a 2,3 um dos títulos quebra em três linhas e dois deles
	   cruzam a borda com letra e tudo. A quebra também depende da caixa: é a 18cqw que
	   "PRIVACIDADE E SEGURANÇA" parte em duas linhas equilibradas. */
	.venn-title {
		font-size: 2.2cqw;
		letter-spacing: 0.05em;
	}

	/* A descrição só existe dentro da bolha, que é larga o bastante para ela. Ela é MAIS
	   LARGA que o rótulo e vaza para os lados com margem negativa, em vez de esticar a
	   caixa: animar a largura da caixa fazia o título requebrar a cada quadro, e o texto
	   ficava se acomodando durante toda a transição. Assim a caixa não muda de largura
	   nunca, e o único movimento é o fade da frase. */
	.venn-desc {
		display: none;
		width: 24cqw;
		margin-inline: -3cqw;
		font-size: 1.5cqw;
	}

	.venn-dim.ativa .venn-desc {
		display: block;
		animation: venn-entra 260ms ease both;
	}

	@keyframes venn-entra {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	/* Como nas pétalas, a lente mostra só uma palavra-chave em repouso e guarda a frase
	   inteira para a bolha — a lente é estreita e a frase inteira competia com os rótulos
	   ao redor. Ao realçar, a caixa abre de 16 para 22cqw e a frase entra com o mesmo
	   fade da descrição. */
	.venn-inter {
		width: 17cqw;
	}

	.venn-inter-chave {
		font-size: 1.75cqw;
	}

	/* Mesma ideia da descrição das pétalas: a frase é mais larga que a chave e vaza para
	   os lados, em vez de esticar a caixa e requebrar o texto durante a transição. */
	.venn-inter-frase {
		display: none;
		width: 22cqw;
		margin-inline: -2.5cqw;
		font-size: 1.4cqw;
	}

	.venn-inter.ativa .venn-inter-frase {
		display: block;
		animation: venn-entra 260ms ease both;
	}

	/* A faixa de trio é a região mais apertada do desenho: entre o núcleo e a ponta em
	   287 sobram ~147 unidades de altura e uns ±90 de largura no ponto em que o texto
	   fica. Por isso a caixa é bem menor que a das lentes — cabe uma palavra-chave em
	   duas linhas, e a frase inteira espera a bolha. */
	.venn-trio {
		width: 11cqw;
		transition: scale 320ms cubic-bezier(0.2, 0.7, 0.3, 1);
	}

	.venn-trio-chave {
		font-size: 1.35cqw;
	}

	.venn-trio-frase {
		display: none;
		width: 22cqw;
		margin-inline: -5.5cqw;
		font-size: 1.4cqw;
	}

	.venn-trio.ativa {
		z-index: 3;
		scale: 1.05;
	}

	.venn-trio.ativa .venn-trio-frase {
		display: block;
		animation: venn-entra 260ms ease both;
	}

	/* O texto acompanha o disco: com 18cqw de largura (180 unidades do viewBox) e ~115
	   de altura, a meia-diagonal do bloco fica em ~107 — dentro do RAIO_HUB de 140, e os
	   cantos de texto centralizado são vazios, então o branco não encosta no escuro. */
	.venn-hub {
		width: 18cqw;
	}

	.venn-hub :global(.venn-hub-icon) {
		width: 4cqw;
		height: 4cqw;
	}

	.venn-hub-title {
		font-size: 2.1cqw;
	}

	.venn-hub-sub {
		font-size: 1.55cqw;
	}

	/* Telas baixas: o quadrado encolheu para caber na altura e os cqw encolheram junto —
	   a 600px de lado o título cairia para ~10px. Aqui tudo cresce em cqw para compensar,
	   inclusive a descrição que aparece na bolha.

	   45rem é o ponto em que o texto começa a ficar pequeno demais. */
	@container (max-width: 45rem) {
		/* O título e o ícone NÃO mudam aqui: como tudo é medido em cqw, o encaixe deles na
		   pétala é o mesmo em qualquer tamanho de quadrado, e 2,2cqw já dá 14px num
		   quadrado de 635. O que precisa de ajuda é o texto pequeno — descrição e
		   interseções —, que a essa altura cairia para uns 8px. */
		.venn-desc {
			font-size: 1.9cqw;
		}

		.venn-inter {
			width: 18cqw;
		}

		.venn-inter-chave {
			font-size: 2.2cqw;
		}

		.venn-inter-frase {
			font-size: 1.9cqw;
		}

		.venn-trio {
			width: 13cqw;
		}

		.venn-trio-chave {
			font-size: 1.7cqw;
		}

		.venn-trio-frase {
			font-size: 1.9cqw;
		}

		.venn-hub {
			width: 20cqw;
		}

		.venn-hub :global(.venn-hub-icon) {
			width: 4.8cqw;
			height: 4.8cqw;
		}

		.venn-hub-title {
			font-size: 2.65cqw;
		}

		.venn-hub-sub {
			font-size: 1.9cqw;
		}
	}
</style>
