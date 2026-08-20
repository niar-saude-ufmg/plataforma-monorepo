<script lang="ts">
	import { resolve } from '$app/paths';
	import { pageTitle } from '$lib/seo';
	import Lock from 'lucide-svelte/icons/lock';
	import GraduationCap from 'lucide-svelte/icons/graduation-cap';
	import Server from 'lucide-svelte/icons/server';
	import Microscope from 'lucide-svelte/icons/microscope';
	import Share2 from 'lucide-svelte/icons/share-2';
	import micheleImg from '$lib/assets/staff/michele.jpeg';
	import anaPaulaImg from '$lib/assets/staff/ana-paula.jpeg';
	import zilmaImg from '$lib/assets/staff/zilma.jpeg';
	import wagnerImg from '$lib/assets/staff/wagner-meira.jpg';
	import dorgivalImg from '$lib/assets/staff/Dorgival-2.jpg';
	import antonioImg from '$lib/assets/staff/antonio.jpeg';
	import deborahImg from '$lib/assets/staff/deborah.jpeg';
	import { m } from '$lib/paraglide/messages';
	import { localizeHref } from '$lib/paraglide/runtime';
	import { t, type Localized } from '$lib/i18n';
	import ResponsibleAiDiagram from '$lib/components/ResponsibleAiDiagram.svelte';

	const objetivos: Array<{ icon: typeof Lock; title: Localized; description: Localized }> = [
		{
			icon: Lock,
			title: { pt: 'Acesso responsável a dados', en: 'Responsible data access' },
			description: {
				pt: 'Projetar, implementar e operar um serviço que viabilize o acesso responsável a dados e modelos em saúde, assegurando ética, segurança e conformidade legal.',
				en: 'Design, implement, and operate a service that enables responsible access to health data and models, ensuring ethics, security, and legal compliance.'
			}
		},
		{
			icon: GraduationCap,
			title: { pt: 'Capacitação e formação', en: 'Training and education' },
			description: {
				pt: 'Disseminar conhecimento e promover a capacitação em inteligência artificial responsável aplicada à saúde, formando profissionais qualificados na área.',
				en: 'Disseminate knowledge and promote training in responsible artificial intelligence applied to healthcare, qualifying professionals in the field.'
			}
		},
		{
			icon: Server,
			title: { pt: 'Plataforma computacional', en: 'Computational platform' },
			description: {
				pt: 'Projetar, implementar e validar uma plataforma computacional voltada ao desenvolvimento e uso de soluções em IA responsável, com foco em transparência e rastreabilidade.',
				en: 'Design, implement, and validate a computational platform for developing and using responsible AI solutions, focused on transparency and traceability.'
			}
		},
		{
			icon: Microscope,
			title: { pt: 'Estudos de caso aplicados', en: 'Applied case studies' },
			description: {
				pt: 'Planejar, executar e avaliar estudos de caso que demonstrem, na prática, a aplicação de IA responsável em saúde.',
				en: 'Plan, conduct, and evaluate case studies that demonstrate, in practice, the application of responsible AI in healthcare.'
			}
		},
		{
			icon: Share2,
			title: { pt: 'Transferência de tecnologia', en: 'Technology transfer' },
			description: {
				pt: 'Promover a transferência de tecnologia e conhecimento relacionados à implantação e operação do NIAR-Saúde, ampliando o impacto das soluções desenvolvidas.',
				en: 'Promote the transfer of technology and knowledge related to the deployment and operation of NIAR-Saúde, expanding the impact of the solutions developed.'
			}
		}
	];

	const trajetoria: Array<{ titulo: Localized; data: Localized | null }> = [
		{ titulo: { pt: 'Assinatura do TED', en: 'Signing of the TED' }, data: null },
		{
			titulo: { pt: 'Início do projeto', en: 'Project kickoff' },
			data: { pt: 'Set 2025', en: 'Sep 2025' }
		},
		{ titulo: { pt: 'Framework NIAR', en: 'NIAR Framework' }, data: null },
		{
			titulo: { pt: 'Inauguração da sala segura', en: 'Secure room inauguration' },
			data: { pt: 'Mar 2026', en: 'Mar 2026' }
		}
	];

	type Coord = { name: string; initials: string; photo?: string };

	const metas: Array<{
		num: string;
		title: Localized;
		description: Localized;
		coords: Coord[];
	}> = [
		{
			num: '1',
			title: { pt: 'Serviço de acesso responsável', en: 'Responsible access service' },
			description: {
				pt: 'Especificação, implementação e operação de um serviço experimental para acesso responsável a dados e modelos em saúde.',
				en: 'Specification, implementation, and operation of an experimental service for responsible access to health data and models.'
			},
			coords: [{ name: 'Michele Brandão', initials: 'MB', photo: micheleImg }]
		},
		{
			num: '2',
			title: { pt: 'Capacitação e formação', en: 'Training and education' },
			description: {
				pt: 'Disseminação de conhecimento e oferta de cursos em ética e uso do ambiente NIAR para formação em IA responsável.',
				en: 'Knowledge dissemination and courses on ethics and use of the NIAR environment for training in responsible AI.'
			},
			coords: [
				{ name: 'Ana Paula Silva', initials: 'AP', photo: anaPaulaImg },
				{ name: 'Zilma Reis', initials: 'ZR', photo: zilmaImg }
			]
		},
		{
			num: '3',
			title: { pt: 'Plataforma computacional', en: 'Computational platform' },
			description: {
				pt: 'Desenvolvimento e validação de uma plataforma computacional para suporte à IA responsável em saúde.',
				en: 'Development and validation of a computational platform to support responsible AI in healthcare.'
			},
			coords: [
				{ name: 'Wagner Meira', initials: 'WM', photo: wagnerImg },
				{ name: 'Dorgival Guedes', initials: 'DG', photo: dorgivalImg }
			]
		},
		{
			num: '4',
			title: { pt: 'IA para eletrocardiograma', en: 'AI for electrocardiogram' },
			description: {
				pt: 'Desenvolvimento de algoritmo para diagnóstico automatizado de ECG, ampliando acesso e apoiando o laudo médico.',
				en: 'Development of an algorithm for automated ECG diagnosis, expanding access and supporting medical reporting.'
			},
			coords: [{ name: 'Antonio Ribeiro', initials: 'AR', photo: antonioImg }]
		},
		{
			num: '5',
			title: { pt: 'Modelos preditivos em DCNT', en: 'Predictive models for NCDs' },
			description: {
				pt: 'Predição de doenças crônicas e fatores de risco com base em dados epidemiológicos e sociodemográficos.',
				en: 'Prediction of chronic diseases and risk factors based on epidemiological and sociodemographic data.'
			},
			coords: [{ name: 'Deborah Malta', initials: 'DM', photo: deborahImg }]
		},
		{
			num: '6',
			title: { pt: 'IA em dados oncológicos do SUS', en: 'AI on SUS oncology data' },
			description: {
				pt: 'Integração e análise preditiva de dados de pacientes oncológicos do SUS em Belo Horizonte.',
				en: 'Integration and predictive analysis of oncology patient data from SUS in Belo Horizonte.'
			},
			coords: [{ name: 'Mariangela Cherchiglia', initials: 'ML' }]
		},
		{
			num: '7',
			title: { pt: 'Transferência de tecnologia', en: 'Technology transfer' },
			description: {
				pt: 'Disseminação e transferência de conhecimento e tecnologias desenvolvidas no projeto.',
				en: 'Dissemination and transfer of knowledge and technologies developed in the project.'
			},
			coords: [{ name: 'Wagner Meira', initials: 'WM', photo: wagnerImg }]
		}
	];

	// Coordinator label and name connector for the meta cards.
	const coordLabel: Localized = { pt: 'Coordenação', en: 'Coordination' };
	const andConnector: Localized = { pt: ' e ', en: ' and ' };
</script>

<svelte:head>
	<title>{pageTitle(m.about_title())}</title>
	<meta name="description" content={m.about_meta_desc()} />
</svelte:head>

<!-- A partir daqui as seções alternam cinza e branco, sem exceção: topo, apresentação
     (mesmo cinza, é continuação do topo), diagrama, objetivos, metas e trajetória. `bg-muted` é o mesmo #F5F5F5 que estava escrito à mão no style.

     Duas convenções valem para TODAS elas — ao acrescentar uma seção, copie daqui:

     1. Ritmo vertical: `py-24` (96px em cima e embaixo), de modo que toda troca de
        fundo tenha a mesma respiração dos dois lados. A única exceção é o par
        topo+apresentação: são uma seção só aos olhos (mesmo cinza), então o intervalo
        interno entre eles é menor de propósito (pb-16 + pt-6 = 88px) e só a borda
        externa do bloco fecha em 96px.

     2. Cabeçalho: rótulo em azul claro, H2 e subtítulo, sempre com as mesmas classes e
        as mesmas distâncias — `mx-auto mb-12 max-w-3xl text-center` no bloco,
        `text-sm font-semibold tracking-widest text-secondary uppercase` no rótulo,
        `mt-2 text-3xl ... sm:text-4xl` no H2 e `mt-4 text-lg ...` no subtítulo. Os
        compromissos alinham à esquerda porque o conteúdo abaixo é uma lista de linhas,
        mas usam a mesma escala; o cabeçalho do diagrama vive em ResponsibleAiDiagram e
        segue a mesma regra. -->
<section class="bg-muted py-16">
	<div class="mx-auto max-w-6xl px-6">
		<a
			href={localizeHref(resolve('/'))}
			class="inline-flex items-center gap-1 text-sm font-medium text-secondary hover:underline"
		>
			<span aria-hidden="true">&larr;</span>
			{m.back_home()}
		</a>

		<h1 class="mt-6 text-4xl font-bold tracking-tight text-primary sm:text-5xl">
			{m.about_heading()}
		</h1>
		<p class="mt-4 max-w-3xl text-lg leading-relaxed text-muted-foreground">
			{m.about_subtitle()}
		</p>
	</div>
</section>

<!-- Apresentação: mesmo cinza do topo, é a continuação dele.

     Três níveis, não dois: rótulo, frase-chave e texto explicativo. A frase é a antiga
     missão, que era uma seção inteira e agora funciona como abertura editorial deste
     bloco — sem ela a coluna da esquerda ficava só com o rótulo, e as duas colunas não
     se sustentavam.

     `font-medium` e não `font-bold`: a frase precisa pesar mais que o corpo do texto,
     mas não competir com os H2 das seções seguintes — o tamanho já faz esse trabalho.

     pt-6, e não py-20: somado ao pb-16 do topo dá ~88px até o rótulo. O bloco não deve
     ocupar um viewport — a ideia é que "Dimensões da IA Responsável" já apareça na
     primeira rolagem. -->
<section class="bg-muted pt-6 pb-24">
	<div class="mx-auto max-w-6xl px-6">
		<p class="text-sm font-semibold tracking-widest text-secondary uppercase">
			{m.about_intro_eyebrow()}
		</p>

		<div class="mt-4 grid gap-8 lg:grid-cols-2 lg:gap-16">
			<!-- 30px contra os 48px do H1: destaque, mas claramente de segundo nível. -->
			<p class="max-w-lg text-[1.5rem] leading-snug font-medium text-primary sm:text-[1.875rem]">
				{m.about_intro_statement()}
			</p>

			<!-- max-w-lg: ~68 caracteres por linha. space-y-4, e não 6: o intervalo fica
			     menor que a altura de linha, então os dois parágrafos leem como um
			     raciocínio só. -->
			<div class="max-w-lg space-y-4">
				<p class="leading-relaxed text-muted-foreground">{m.about_intro_p1()}</p>
				<p class="leading-relaxed text-muted-foreground">{m.about_intro_p2()}</p>
			</div>
		</div>
	</div>
</section>

<!-- Diagrama: define "IA responsável" antes de qualquer conteúdo operacional — os
     blocos seguintes (objetivos, metas) pressupõem o conceito.

     py-24 como todas as seções daqui para baixo — o pt entra na conta de altura do
     Venn (ver o comentário em ResponsibleAiDiagram), então mexer aqui pede mexer lá. -->
<section class="py-24">
	<!-- max-w-7xl, e não o max-w-6xl das demais seções: é a única exceção da página e
	     existe só para o quadrado de 1120px não encostar nas laterais da coluna. Os
	     textos do bloco continuam em max-w-3xl/4xl, então a medida de linha não muda. -->
	<div class="mx-auto max-w-7xl px-6">
		<ResponsibleAiDiagram />
	</div>
</section>

<!-- Objetivos -->
<section class="bg-muted py-24">
	<div class="mx-auto max-w-6xl px-6">
		<!-- Alinhado à esquerda, e não centralizado como os demais cabeçalhos: o conteúdo
		     abaixo é uma lista de linhas, toda encostada à esquerda. Um título centralizado
		     sobre ela criaria dois eixos concorrentes. O bloco e a lista compartilham a
		     mesma margem esquerda (sem mx-auto nos dois). -->
		<div class="mb-10 max-w-3xl">
			<p class="text-sm font-semibold tracking-widest text-secondary uppercase">
				{m.about_objectives_eyebrow()}
			</p>
			<h2 class="mt-2 text-3xl font-bold tracking-tight text-primary sm:text-4xl">
				{m.about_objectives_heading()}
			</h2>
		</div>

		<!-- Linhas, e não cartões: são cinco itens de uma mesma lista, e cinco caixas
		     fechadas os transformavam em cinco objetos independentes (com a última fila
		     sobrando duas colunas vazias). O fio entre as linhas basta para separá-los.

		     Três colunas a partir de lg — ícone, título e descrição —, de modo que os
		     títulos formem uma coluna própria e possam ser varridos de cima a baixo sem
		     ler as descrições. Abaixo disso a descrição desce para a segunda linha,
		     alinhada ao título (col-start-2), e o ícone mantém a sangria.

		     O gap do grid é curto (20px) para o ícone colar no título e os dois lerem
		     como um conjunto; a distância maior até a descrição vem do pl-5 dela, e não
		     do gap — column-gap no CSS é um valor só para todas as colunas.

		     20rem na coluna dos títulos: em 18rem "Transferência de tecnologia" quebrava
		     em duas linhas sozinha, com a coluna do texto ainda sobrando largura.

		     O ícone tem 28px, a mesma altura da linha do título (text-lg), e fica no topo:
		     assim os dois se alinham exatamente e leem como um par. Centrá-lo na altura
		     da linha inteira, como cheguei a tentar, o fazia flutuar abaixo do título
		     sempre que a descrição passava de duas linhas.

		     first:pt-0 / last:pb-0: sem isso o py-10 das linhas somaria ao mb-10 do
		     cabeçalho e ao py-24 da seção, e as bordas do bloco respirariam mais que o
		     miolo. -->
		<ul class="max-w-5xl divide-y divide-border">
			{#each objetivos as item (item.title)}
				<li
					class="grid grid-cols-[auto_1fr] items-start gap-x-4 gap-y-3 py-10 first:pt-0 last:pb-0 lg:grid-cols-[auto_20rem_1fr]"
				>
					<item.icon class="h-7 w-7 shrink-0 self-start text-secondary" />
					<h3 class="text-lg font-bold text-primary">{t(item.title)}</h3>
					<p class="col-start-2 leading-relaxed text-muted-foreground lg:col-start-3 lg:pl-6">
						{t(item.description)}
					</p>
				</li>
			{/each}
		</ul>
	</div>
</section>

<!-- Linhas de Pesquisa -->
<section class="py-24">
	<!-- max-w-6xl como o resto da página: os cartões alinham com a lista de compromissos
	     acima. A largura que se perde por coluna volta como texto pelo padding menor —
	     p-5 em vez de p-8, já que num cartão de ~260px cada 8px de moldura custa uma
	     palavra por linha. -->
	<div class="mx-auto max-w-6xl px-6">
		<div class="mx-auto mb-12 max-w-3xl text-center">
			<p class="text-sm font-semibold tracking-widest text-secondary uppercase">
				{m.about_metas_eyebrow()}
			</p>
			<h2 class="mt-2 text-3xl font-bold tracking-tight text-primary sm:text-4xl">
				{m.about_metas_heading()}
			</h2>
			<!-- eslint-disable-next-line svelte/no-at-html-tags -->
			<p class="mt-4 text-lg leading-relaxed text-muted-foreground">{@html m.about_metas_text()}</p>
		</div>

		<!-- 4 + 3, e não 3 + 3 + 1: são sete metas, e em três colunas a última ficava
		     sozinha numa fila com duas lacunas ao lado — parecia sobra, não meta.

		     O grid tem 8 colunas e cada cartão ocupa 2: assim os sete têm exatamente a
		     mesma largura e o mesmo gap entre si nas duas filas. A segunda fila começa na
		     coluna 2 (lg:col-start-2 no quinto cartão), o que a centraliza sem mexer em
		     largura nenhuma — o deslocamento é de uma coluna + um gap de cada lado.
		     Com lg:grid-cols-4 a fila de baixo ficaria encostada à esquerda; com um grid
		     de 12 os cartões de baixo ficariam mais largos, sugerindo uma hierarquia que
		     não existe.

		     gap-x menor que gap-y (24 contra 32): cada 8px tirados do gap horizontal viram
		     largura de cartão, e na vertical o respiro maior é que separa as duas filas.

		     Abaixo de lg continua 1 e 2 colunas, com o último cartão centralizado. -->
		<div class="grid auto-rows-fr grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-8">
			{#each metas as meta, i (meta.num)}
				<!-- bg-muted, e não bg-white: a seção agora é branca e um cartão branco só
				     apareceria pelo ring. -->
				<div
					class="flex flex-col rounded-2xl bg-muted p-5 ring-1 ring-border lg:col-span-2 {i === 4
						? 'lg:col-start-2'
						: ''} {i === metas.length - 1
						? 'sm:col-span-2 sm:w-[calc(50%-0.75rem)] sm:justify-self-center lg:w-auto lg:justify-self-stretch'
						: ''}"
				>
					<p class="text-sm font-semibold tracking-widest text-secondary uppercase">
						{m.meta_label({ meta: meta.num })}
					</p>
					<h3 class="mt-2 text-xl font-bold text-primary">{t(meta.title)}</h3>
					<p class="mt-4 mb-4 leading-relaxed text-muted-foreground">{t(meta.description)}</p>
					<div class="mt-auto flex items-center gap-3 border-t border-border pt-4">
						<div class="flex shrink-0">
							{#each meta.coords as coord, i (coord.name)}
								{#if coord.photo}
									<img
										src={coord.photo}
										alt={coord.name}
										class="h-9 w-9 rounded-full object-cover ring-2 ring-muted"
										style="object-position: center 20%; margin-left: {i > 0 ? '-10px' : '0'}"
									/>
								{:else}
									<div
										class="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary text-xs font-bold text-white ring-2 ring-muted"
										style="margin-left: {i > 0 ? '-10px' : '0'}"
									>
										{coord.initials}
									</div>
								{/if}
							{/each}
						</div>
						<div class="text-sm">
							<p class="text-sm font-semibold text-primary">{t(coordLabel)}</p>
							<p class="text-muted-foreground">
								{meta.coords.map((c) => c.name).join(t(andConnector))}
							</p>
						</div>
					</div>
				</div>
			{/each}
		</div>
	</div>
</section>

<!-- Trajetória -->
<section class="bg-muted py-24">
	<div class="mx-auto max-w-6xl px-6">
		<div class="mx-auto mb-12 max-w-3xl text-center">
			<p class="text-sm font-semibold tracking-widest text-secondary uppercase">
				{m.about_trajectory_eyebrow()}
			</p>
			<h2 class="mt-2 text-3xl font-bold tracking-tight text-primary sm:text-4xl">
				{m.about_trajectory_heading()}
			</h2>
			<p class="mt-4 text-lg leading-relaxed text-muted-foreground">
				{m.about_trajectory_subtitle()}
			</p>
		</div>

		<div class="relative mx-auto max-w-3xl">
			<span
				class="absolute top-0 bottom-0 left-4 w-px bg-border sm:left-1/2 sm:-translate-x-1/2"
				aria-hidden="true"
			></span>

			<!-- space-y-8, e não 12: com quatro marcos a linha ficava alta demais para o
			     que mostra. O intervalo volta a crescer sozinho conforme entrarem novos
			     marcos, então não é um ajuste que precise ser refeito. -->
			<ol class="space-y-8">
				{#each trajetoria as marco, i (marco.titulo)}
					<li class="relative grid grid-cols-1 sm:grid-cols-2 sm:gap-8">
						<span
							class="absolute top-1.5 left-4 h-3 w-3 -translate-x-1/2 rounded-full bg-secondary sm:left-1/2"
							aria-hidden="true"
						></span>

						<div
							class={i % 2 === 0
								? 'pl-12 sm:col-start-1 sm:pr-6 sm:pl-0 sm:text-right'
								: 'pl-12 sm:col-start-2 sm:pl-6'}
						>
							{#if marco.data}
								<span
									class="inline-block rounded-full bg-secondary/10 px-3 py-1 text-sm font-semibold text-secondary"
								>
									{t(marco.data)}
								</span>
							{/if}
							<h3 class="mt-2 text-lg font-bold text-primary">{t(marco.titulo)}</h3>
						</div>
					</li>
				{/each}
			</ol>
		</div>
	</div>
</section>
