<script lang="ts">
	import { resolve } from '$app/paths';
	import Lock from 'lucide-svelte/icons/lock';
	import GraduationCap from 'lucide-svelte/icons/graduation-cap';
	import Server from 'lucide-svelte/icons/server';
	import Microscope from 'lucide-svelte/icons/microscope';
	import Share2 from 'lucide-svelte/icons/share-2';

	const objetivos = [
		{
			icon: Lock,
			title: 'Acesso responsável a dados',
			description:
				'Projetar, implementar e operar um serviço que viabilize o acesso responsável a dados e modelos em saúde, assegurando ética, segurança e conformidade legal.'
		},
		{
			icon: GraduationCap,
			title: 'Capacitação e formação',
			description:
				'Disseminar conhecimento e promover a capacitação em inteligência artificial responsável aplicada à saúde, formando profissionais qualificados na área.'
		},
		{
			icon: Server,
			title: 'Plataforma computacional',
			description:
				'Projetar, implementar e validar uma plataforma computacional voltada ao desenvolvimento e uso de soluções em IA responsável, com foco em transparência e rastreabilidade.'
		},
		{
			icon: Microscope,
			title: 'Estudos de caso aplicados',
			description:
				'Planejar, executar e avaliar estudos de caso que demonstrem, na prática, a aplicação de IA responsável em saúde.'
		},
		{
			icon: Share2,
			title: 'Transferência de tecnologia',
			description:
				'Promover a transferência de tecnologia e conhecimento relacionados à implantação e operação do NIAR-Saúde, ampliando o impacto das soluções desenvolvidas.'
		}
	];

	const trajetoria = [
		{ titulo: 'Assinatura do TED', data: null },
		{ titulo: 'Início do projeto', data: 'Set 2025' },
		{ titulo: 'Framework NIAR', data: null },
		{ titulo: 'Inauguração da sala segura', data: 'Mar 2026' }
	];

	const metas = [
		{
			num: '01',
			title: 'Serviço de acesso responsável',
			description:
				'Especificação, implementação e operação de um serviço experimental para acesso responsável a dados e modelos em saúde.',
			coordenacao: 'Michele'
		},
		{
			num: '02',
			title: 'Capacitação e formação',
			description:
				'Disseminação de conhecimento e oferta de cursos em ética e uso do ambiente NIAR para formação em IA responsável.',
			coordenacao: 'Ana Paula e Zilma'
		},
		{
			num: '03',
			title: 'Plataforma computacional',
			description:
				'Desenvolvimento e validação de uma plataforma computacional para suporte à IA responsável em saúde.',
			coordenacao: 'Wagner Meira'
		},
		{
			num: '04',
			title: 'IA para eletrocardiograma (IA-ECG)',
			description:
				'Desenvolvimento de algoritmo para diagnóstico automatizado de ECG, ampliando acesso e apoiando o laudo médico.',
			coordenacao: 'Antonio'
		},
		{
			num: '05',
			title: 'Modelos preditivos em DCNT',
			description:
				'Predição de doenças crônicas e fatores de risco com base em dados epidemiológicos e sociodemográficos.',
			coordenacao: 'Deborah'
		},
		{
			num: '06',
			title: 'IA em dados oncológicos do SUS',
			description:
				'Integração e análise preditiva de dados de pacientes oncológicos do SUS em Belo Horizonte.',
			coordenacao: 'Mariângela'
		},
		{
			num: '07',
			title: 'Transferência de tecnologia',
			description:
				'Disseminação e transferência de conhecimento e tecnologias desenvolvidas no projeto.',
			coordenacao: 'Wagner Meira'
		}
	];
</script>

<svelte:head>
	<title>Sobre</title>
	<meta name="description" content="Conheça a NIAR e nossa missão" />
</svelte:head>

<section class="py-16" style="background-color: rgb(245, 245, 245);">
	<div class="mx-auto max-w-6xl px-6">
		<a
			href={resolve('/')}
			class="inline-flex items-center gap-1 text-sm font-medium text-secondary hover:underline"
		>
			<span aria-hidden="true">&larr;</span> Voltar à página inicial
		</a>

		<h1 class="mt-6 text-4xl font-bold tracking-tight text-primary sm:text-5xl">
			Sobre o NIAR-Saúde
		</h1>
		<p class="mt-4 max-w-3xl text-lg leading-relaxed text-muted-foreground">
			Núcleo de Inteligência Artificial Responsável para Saúde da UFMG.
		</p>
	</div>
</section>

<!-- Missão e Objetivos -->
<section class="py-20">
	<div class="mx-auto max-w-6xl space-y-20 px-6">
		<div class="mx-auto max-w-3xl text-center">
			<p class="text-sm font-semibold tracking-widest text-secondary uppercase">Missão</p>
			<p class="mt-4 text-2xl leading-relaxed font-medium text-primary sm:text-3xl">
				Transformar o uso de dados em saúde por meio de uma inteligência artificial ética, segura e
				responsável.
			</p>
		</div>

		<div>
			<div class="text-center">
				<p class="text-sm font-semibold tracking-widest text-secondary uppercase">
					Objetivos específicos
				</p>
				<h2 class="mt-2 text-3xl font-bold tracking-tight text-primary sm:text-4xl">
					Como atuamos
				</h2>
			</div>
			<div class="mt-12 flex flex-wrap justify-center gap-8">
				{#each objetivos as item (item.title)}
					<div
						class="w-full rounded-2xl bg-white p-8 ring-1 ring-border sm:w-[calc(50%_-_1rem)] lg:w-[calc(33.333%_-_1.334rem)]"
					>
						<item.icon class="h-12 w-12 text-secondary" />
						<h3 class="mt-4 text-xl font-bold text-primary">{item.title}</h3>
						<p class="mt-3 leading-relaxed text-muted-foreground">{item.description}</p>
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
			<p class="text-sm font-semibold tracking-widest text-secondary uppercase">Metas</p>
			<h2 class="mt-2 text-3xl font-bold tracking-tight text-primary sm:text-4xl">
				Áreas de atuação
			</h2>
			<p class="mt-6 text-lg leading-relaxed text-muted-foreground">
				O projeto se organiza em <span class="font-semibold text-primary">sete metas</span>
				concomitantes, distribuídas em quatro tipos de atividade: processos e boas práticas, plataforma
				computacional, projetos piloto e disseminação.
			</p>
		</div>

		<div class="flex flex-wrap justify-center gap-8">
			{#each metas as meta (meta.num)}
				<div
					class="relative flex w-full flex-col overflow-hidden rounded-2xl bg-white p-8 ring-1 ring-border sm:w-[calc(50%_-_1rem)] lg:w-[calc(33.333%_-_1.334rem)]"
				>
					<span class="absolute top-6 right-6 text-6xl font-bold text-muted-foreground/20">
						{meta.num}
					</span>
					<h3 class="text-xl font-bold text-primary">{meta.title}</h3>
					<p class="mt-4 leading-relaxed text-muted-foreground">{meta.description}</p>
					<p class="mt-auto pt-4 text-sm text-muted-foreground">
						<span class="font-semibold text-primary">Coordenação:</span>
						{meta.coordenacao}
					</p>
				</div>
			{/each}
		</div>
	</div>
</section>

<!-- Trajetória -->
<section class="py-20">
	<div class="mx-auto max-w-6xl px-6">
		<div class="mx-auto mb-16 max-w-3xl text-center">
			<p class="text-sm font-semibold tracking-widest text-secondary uppercase">Nossa trajetória</p>
			<h2 class="mt-2 text-3xl font-bold tracking-tight text-primary sm:text-4xl">
				História & Marcos
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
							class="absolute top-1.5 left-4 h-3 w-3 -translate-x-1/2 rounded-full bg-secondary ring-4 ring-background sm:left-1/2"
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
									{marco.data}
								</span>
							{/if}
							<h3 class="mt-2 text-lg font-bold text-primary">{marco.titulo}</h3>
						</div>
					</li>
				{/each}
			</ol>
		</div>
	</div>
</section>
