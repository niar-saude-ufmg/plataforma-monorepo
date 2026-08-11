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
	import virgilioImg from '$lib/assets/staff/virgilio.jpeg';
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
			title: { pt: 'IA para eletrocardiograma (IA-ECG)', en: 'AI for electrocardiogram (AI-ECG)' },
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

	const featuredMembers: Array<{
		initials: string;
		name: string;
		role: Localized;
		area: Localized;
		photo?: string;
		photoPos?: string;
	}> = [
		{
			initials: 'WM',
			name: 'Wagner Meira',
			role: { pt: 'Coordenador Metas 3 e 7', en: 'Goals 3 and 7 Coordinator' },
			area: { pt: 'Ciência da Computação', en: 'Computer Science' },
			photo: wagnerImg
		},
		{
			initials: 'MB',
			name: 'Michele Brandão',
			role: { pt: 'Coordenadora Meta 1', en: 'Goal 1 Coordinator' },
			area: {
				pt: 'Ciência da Computação e IA Responsável',
				en: 'Computer Science and Responsible AI'
			},
			photo: micheleImg
		},
		{
			initials: 'DG',
			name: 'Dorgival Guedes',
			role: { pt: 'Coordenador Meta 3', en: 'Goal 3 Coordinator' },
			area: { pt: 'Sistemas Distribuídos', en: 'Distributed Systems' },
			photo: dorgivalImg,
			photoPos: '30% 20%'
		},
		{
			initials: 'AP',
			name: 'Ana Paula Silva',
			role: { pt: 'Coordenadora Meta 2', en: 'Goal 2 Coordinator' },
			area: { pt: 'Computação Social', en: 'Social Computing' },
			photo: anaPaulaImg
		},
		{
			initials: 'VA',
			name: 'Virgílio Almeida',
			role: { pt: 'Pesquisador', en: 'Researcher' },
			area: {
				pt: 'Ciência da Computação e IA Responsável',
				en: 'Computer Science and Responsible AI'
			},
			photo: virgilioImg
		},
		{
			initials: 'ML',
			name: 'Mariangela Cherchiglia',
			role: { pt: 'Coordenadora Meta 6', en: 'Goal 6 Coordinator' },
			area: { pt: 'Saúde Pública', en: 'Public Health' }
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

<section class="py-16" style="background-color: rgb(245, 245, 245);">
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

<!-- Missão e diagrama: seguem no mesmo cinza do topo, que só termina quando
     começa "Como atuamos". -->
<section class="py-20" style="background-color: rgb(245, 245, 245);">
	<div class="mx-auto max-w-6xl space-y-20 px-6">
		<div class="mx-auto max-w-3xl text-center">
			<p class="text-sm font-semibold tracking-widest text-secondary uppercase">
				{m.about_mission_eyebrow()}
			</p>
			<p class="mt-4 text-2xl leading-relaxed font-medium text-primary sm:text-3xl">
				{m.about_mission_text()}
			</p>
		</div>

		<!-- Define "IA responsável" antes de qualquer conteúdo operacional: os blocos
		     seguintes (objetivos, metas) pressupõem o conceito. -->
		<ResponsibleAiDiagram />
	</div>
</section>

<!-- Objetivos: primeira seção branca da página. -->
<section class="py-20">
	<div class="mx-auto max-w-6xl px-6">
		<div>
			<div class="text-center">
				<p class="text-sm font-semibold tracking-widest text-secondary uppercase">
					{m.about_objectives_eyebrow()}
				</p>
				<h2 class="mt-2 text-3xl font-bold tracking-tight text-primary sm:text-4xl">
					{m.about_objectives_heading()}
				</h2>
			</div>
			<div class="mt-12 flex flex-wrap justify-center gap-8">
				{#each objetivos as item (item.title)}
					<div
						class="w-full rounded-2xl bg-white p-8 ring-1 ring-border sm:w-[calc(50%_-_1rem)] lg:w-[calc(33.333%_-_1.334rem)]"
					>
						<item.icon class="h-12 w-12 text-secondary" />
						<h3 class="mt-4 text-xl font-bold text-primary">{t(item.title)}</h3>
						<p class="mt-3 leading-relaxed text-muted-foreground">{t(item.description)}</p>
					</div>
				{/each}
			</div>
		</div>
	</div>
</section>

<!-- Linhas de Pesquisa -->
<section class="bg-muted py-20">
	<div class="mx-auto max-w-6xl px-6">
		<div class="mx-auto mb-12 max-w-3xl text-center">
			<p class="text-sm font-semibold tracking-widest text-secondary uppercase">
				{m.about_metas_eyebrow()}
			</p>
			<h2 class="mt-2 text-3xl font-bold tracking-tight text-primary sm:text-4xl">
				{m.about_metas_heading()}
			</h2>
			<!-- eslint-disable-next-line svelte/no-at-html-tags -->
			<p class="mt-6 text-lg leading-relaxed text-muted-foreground">{@html m.about_metas_text()}</p>
		</div>

		<div class="grid auto-rows-fr grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
			{#each metas as meta, i (meta.num)}
				<div
					class="flex flex-col rounded-2xl bg-white p-8 ring-1 ring-border {i === metas.length - 1
						? 'sm:col-span-2 sm:w-[calc(50%-1rem)] sm:justify-self-center lg:col-span-1 lg:col-start-2 lg:w-auto'
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
										class="h-9 w-9 rounded-full object-cover ring-2 ring-white"
										style="object-position: center 20%; margin-left: {i > 0 ? '-10px' : '0'}"
									/>
								{:else}
									<div
										class="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary text-xs font-bold text-white ring-2 ring-white"
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

<!-- Equipe -->
<section id="equipe" class="py-20">
	<div class="mx-auto max-w-6xl px-6">
		<div class="mb-12 flex items-end justify-between">
			<div>
				<p class="text-sm font-semibold tracking-widest text-secondary uppercase">
					{m.about_team_eyebrow()}
				</p>
				<h2 class="mt-2 text-3xl font-bold tracking-tight text-primary sm:text-4xl">
					{m.about_team_heading()}
				</h2>
				<p class="mt-4 text-lg leading-relaxed text-muted-foreground">
					{m.about_team_text()}
				</p>
			</div>
			<a
				href={localizeHref(resolve('/team'))}
				class="inline-flex items-center gap-1 text-base font-medium text-secondary hover:underline"
			>
				{m.about_team_link()} <span aria-hidden="true">&rarr;</span>
			</a>
		</div>

		<div class="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
			{#each featuredMembers as member (member.initials)}
				<div
					class="flex flex-col items-center rounded-lg bg-white p-8 text-center shadow-sm ring-1 ring-border transition-shadow hover:shadow-md"
				>
					{#if member.photo}
						<img
							src={member.photo}
							alt={member.name}
							class="h-20 w-20 rounded-full object-cover"
							style="object-position: {member.photoPos ?? 'center 20%'}"
						/>
					{:else}
						<div
							class="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary text-lg font-bold text-white"
						>
							{member.initials}
						</div>
					{/if}
					<p class="mt-4 text-lg font-bold text-primary">{member.name}</p>
					<p class="mt-1 text-sm font-semibold text-secondary">{t(member.role)}</p>
					<p class="mt-1 text-sm text-muted-foreground">{t(member.area)}</p>
				</div>
			{/each}
		</div>
	</div>
</section>

<!-- Trajetória -->
<section class="bg-muted py-20">
	<div class="mx-auto max-w-6xl px-6">
		<div class="mx-auto mb-16 max-w-3xl text-center">
			<p class="text-sm font-semibold tracking-widest text-secondary uppercase">
				{m.about_trajectory_eyebrow()}
			</p>
			<h2 class="mt-2 text-3xl font-bold tracking-tight text-primary sm:text-4xl">
				{m.about_trajectory_heading()}
			</h2>
		</div>

		<div class="relative mx-auto max-w-3xl">
			<span
				class="absolute top-0 bottom-0 left-4 w-px bg-border sm:left-1/2 sm:-translate-x-1/2"
				aria-hidden="true"
			></span>

			<ol class="space-y-12">
				{#each trajetoria as marco, i (marco.titulo)}
					<li class="relative grid grid-cols-1 sm:grid-cols-2 sm:gap-8">
						<span
							class="absolute top-1.5 left-4 h-3 w-3 -translate-x-1/2 rounded-full bg-secondary ring-4 ring-muted sm:left-1/2"
							aria-hidden="true"
						></span>

						<div
							class={i % 2 === 0
								? 'pl-12 sm:col-start-1 sm:pr-8 sm:pl-0 sm:text-right'
								: 'pl-12 sm:col-start-2 sm:pl-8'}
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
