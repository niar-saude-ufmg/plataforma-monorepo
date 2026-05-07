<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import BrainCircuit from 'lucide-svelte/icons/brain-circuit';
	import HeartHandshake from 'lucide-svelte/icons/heart-handshake';
	import ShieldCheck from 'lucide-svelte/icons/shield-check';
	import Mail from 'lucide-svelte/icons/mail';
	import MapPin from 'lucide-svelte/icons/map-pin';
	import homeImg from '$lib/assets/home-img.jpg';
	import wagnerImg from '$lib/assets/staff/wagner-meira.jpg';
	import micheleImg from '$lib/assets/staff/michele.jpeg';
	import dorgivalImg from '$lib/assets/staff/Dorgival-2.jpg';
	import virgilioImg from '$lib/assets/staff/virgilio.jpeg';
	import anaPaulaImg from '$lib/assets/staff/ana-paula.jpeg';
	import { publications } from '$lib/data/publications';
	import { resolve } from '$app/paths';

	const recentPublications = publications.slice(0, 4);
</script>

<svelte:head>
	<title>Página Inicial</title>
	<meta name="description" content="NIAR - Site institucional" />
	<link rel="preload" as="image" href={homeImg} />
</svelte:head>

<!-- Hero -->
<section
	class="relative flex min-h-[70vh] items-center bg-cover bg-fixed text-primary-foreground"
	style="background-image: url({homeImg}); background-position: center 20%;"
>
	<div class="absolute inset-0 bg-primary/70"></div>
	<div class="relative mx-auto w-full max-w-6xl px-6 py-16 text-center">
		<h1 class="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
			Bem-vindo ao NIAR-Saúde
		</h1>
		<p class="white mx-auto mt-6 max-w-2xl text-lg">
			Núcleo de Inteligência Artificial Responsável para a Saúde
		</p>
		<div class="mt-10 flex items-center justify-center gap-4">
			<Button
				size="lg"
				class="!bg-white !px-8 !py-3 !text-primary hover:!bg-white/90"
				href={resolve('/about')}
			>
				Conheça o projeto
			</Button>
			<a
				href={resolve('/publications')}
				class="inline-flex items-center gap-1 text-base font-medium text-white hover:underline"
			>
				Ver publicações <span aria-hidden="true">&rarr;</span>
			</a>
		</div>
	</div>
</section>

<!-- Pilares -->
<section class="relative z-10 bg-gradient-to-b from-white to-muted py-20">
	<div class="mx-auto max-w-6xl px-6">
		<div class="mx-auto mb-16 max-w-3xl text-center">
			<p class="text-sm font-semibold tracking-widest text-secondary uppercase">
				Sobre o NIAR Saúde
			</p>
			<h2 class="mt-2 text-3xl font-bold tracking-tight text-primary sm:text-4xl">
				Inovação em dados e inteligência artificial responsável para a saúde
			</h2>
			<p class="mt-4 text-lg leading-relaxed text-muted-foreground">
				O NIAR-Saúde é um núcleo interdisciplinar que reúne pesquisadores de computação e saúde para
				desenvolver soluções voltadas ao uso responsável de dados e inteligência artificial. Atuamos
				na criação e validação de tecnologias que promovem transparência, segurança e
				confiabilidade, além de fomentar a capacitação e a transferência de conhecimento.
			</p>
		</div>
		<div class="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
			<Card.Root class="rounded-lg border-0 bg-white px-6 py-8 shadow-sm ring-1 ring-border">
				<Card.Header class="gap-4">
					<div
						class="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary"
					>
						<ShieldCheck class="h-7 w-7 text-primary-foreground" />
					</div>
					<Card.Title class="text-xl font-bold text-foreground">Governança</Card.Title>
					<Card.Description class="text-base leading-relaxed">
						Estruturação de processos e práticas voltadas ao uso responsável da inteligência
						artificial, com foco em qualidade, gestão de riscos, transparência e governança
						contínua.
					</Card.Description>
				</Card.Header>
			</Card.Root>

			<Card.Root class="rounded-lg border-0 bg-white px-6 py-8 shadow-sm ring-1 ring-border">
				<Card.Header class="gap-4">
					<div
						class="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary"
					>
						<BrainCircuit class="h-7 w-7 text-primary-foreground" />
					</div>
					<Card.Title class="text-xl font-bold text-foreground">Dados e Modelos</Card.Title>
					<Card.Description class="text-base leading-relaxed">
						Desenvolvimento e operação de dados e modelos de inteligência artificial, abrangendo
						engenharia de dados, construção, avaliação e monitoramento contínuo de soluções.
					</Card.Description>
				</Card.Header>
			</Card.Root>

			<Card.Root class="rounded-lg border-0 bg-white px-6 py-8 shadow-sm ring-1 ring-border">
				<Card.Header class="gap-4">
					<div
						class="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary"
					>
						<HeartHandshake class="h-7 w-7 text-primary-foreground" />
					</div>
					<Card.Title class="text-xl font-bold text-foreground">Aplicações</Card.Title>
					<Card.Description class="text-base leading-relaxed">
						Aplicação de dados e modelos em contextos da saúde, com foco em impacto,
						custo-efetividade e suporte à tomada de decisão em diferentes cenários.
					</Card.Description>
				</Card.Header>
			</Card.Root>
		</div>
	</div>
</section>

<!-- Publicações -->
<section class="relative z-10 bg-gradient-to-b from-white to-muted py-20">
	<div class="mx-auto max-w-6xl px-6">
		<div class="mb-12 flex items-end justify-between">
			<div>
				<p class="text-sm font-semibold tracking-widest text-secondary uppercase">Publicações</p>
				<h2 class="mt-2 text-3xl font-bold tracking-tight text-primary sm:text-4xl">
					Trabalhos recentes
				</h2>
				<p class="mt-4 text-lg leading-relaxed text-muted-foreground">
					Artigos e produções científicas recentes do grupo.
				</p>
			</div>
			<a
				href={resolve('/publications')}
				class="inline-flex items-center gap-1 text-base font-medium text-secondary hover:underline"
			>
				Ver todas as publicações <span aria-hidden="true">&rarr;</span>
			</a>
		</div>

		<div class="grid gap-6 sm:grid-cols-2">
			{#each recentPublications as pub (pub.title)}
				<div class="flex flex-col rounded-lg bg-white p-6 shadow-sm ring-1 ring-border">
					<div class="flex items-center gap-2">
						<span class="text-sm font-bold text-secondary">{pub.year}</span>
						{#each pub.metas as meta (meta)}
							<span
								class="rounded-full bg-secondary/10 px-2.5 py-0.5 text-xs font-semibold text-secondary"
								>Meta {meta}</span
							>
						{/each}
					</div>
					<p class="mt-3 text-base leading-snug font-bold text-primary">{pub.title}</p>
					<p class="mt-2 text-sm text-muted-foreground">{pub.authors}</p>
					<p class="mt-1 text-sm text-muted-foreground italic">{pub.journal}</p>
					<!-- eslint-disable svelte/no-navigation-without-resolve -->
					<a
						href={pub.doi}
						target="_blank"
						rel="noopener noreferrer"
						class="mt-3 inline-flex items-center gap-1 text-sm font-medium text-secondary hover:underline"
					>
						DOI <span aria-hidden="true">&nearr;</span>
					</a>
					<!-- eslint-enable svelte/no-navigation-without-resolve -->
				</div>
			{/each}
		</div>
	</div>
</section>

<!-- Equipe -->
<section id="equipe" class="relative z-10 bg-gradient-to-b from-white to-muted py-20">
	<div class="mx-auto max-w-6xl px-6">
		<div class="mb-12 flex items-end justify-between">
			<div>
				<p class="text-sm font-semibold tracking-widest text-secondary uppercase">Equipe</p>
				<h2 class="mt-2 text-3xl font-bold tracking-tight text-primary sm:text-4xl">
					Pesquisadores
				</h2>
				<p class="mt-4 text-lg leading-relaxed text-muted-foreground">
					Um time multidisciplinar unindo computação, medicina, bioética e saúde pública.
				</p>
			</div>
			<a
				href={resolve('/team')}
				class="inline-flex items-center gap-1 text-base font-medium text-secondary hover:underline"
			>
				Ver equipe completa <span aria-hidden="true">&rarr;</span>
			</a>
		</div>

		<div class="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
			{#each [{ initials: 'WM', name: 'Wagner Meira', role: 'Coordenador Metas 3 e 7', area: 'Ciência da Computação', photo: wagnerImg }, { initials: 'MB', name: 'Michele Brandão', role: 'Coordenadora Meta 1', area: 'Ciência da Computação e IA Responsável', photo: micheleImg }, { initials: 'DG', name: 'Dorgival Guedes', role: 'Coordenador Meta 3', area: 'Sistemas Distribuídos', photo: dorgivalImg, photoPos: '30% 20%' }, { initials: 'AP', name: 'Ana Paula Silva', role: 'Coordenadora Meta 2', area: 'Computação Social', photo: anaPaulaImg }, { initials: 'VA', name: 'Virgílio Almeida', role: 'Pesquisador', area: 'Ciência da Computação e IA Responsável', photo: virgilioImg }, { initials: 'ML', name: 'Mariangela Cherchiglia', role: 'Coordenadora Meta 6', area: 'Saúde Pública' }] as member (member.initials)}
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
					<p class="mt-1 text-sm font-semibold text-secondary">{member.role}</p>
					<p class="mt-1 text-sm text-muted-foreground">{member.area}</p>
				</div>
			{/each}
		</div>
	</div>
</section>

<!-- Contato -->
<section id="contato" class="relative z-10 bg-gradient-to-b from-white to-muted py-20">
	<div class="mx-auto max-w-6xl px-6">
		<div class="mb-12">
			<p class="text-sm font-semibold tracking-widest text-secondary uppercase">Contato</p>
			<h2 class="mt-2 text-3xl font-bold tracking-tight text-primary sm:text-4xl">Fale conosco</h2>
			<p class="mt-4 text-lg leading-relaxed text-muted-foreground">
				Interessado em colaborar ou saber mais sobre nossas pesquisas?
			</p>
		</div>

		<div class="grid gap-6 sm:grid-cols-2">
			<div class="flex items-center gap-5 rounded-lg bg-white p-6 ring-1 ring-border">
				<div
					class="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary"
				>
					<Mail class="h-7 w-7 text-primary-foreground" />
				</div>
				<div>
					<p class="font-bold text-primary">E-mail</p>
					<a href="mailto:niar@dcc.ufmg.br" class="text-sm text-secondary hover:underline">
						niar@dcc.ufmg.br
					</a>
				</div>
			</div>

			<div class="flex items-center gap-5 rounded-lg bg-white p-6 ring-1 ring-border">
				<div
					class="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary"
				>
					<MapPin class="h-7 w-7 text-primary-foreground" />
				</div>
				<div>
					<p class="font-bold text-primary">Localização</p>
					<a
						href="https://www.google.com/maps/place/Universidade+Federal+de+Minas+Gerais/@-19.8669704,-43.9620077,17z/data=!3m1!4b1!4m6!3m5!1s0xa690ee806be67d:0xbb1391cea62811dd!8m2!3d-19.8669704!4d-43.9620077!16zL20vMDIxejJr"
						target="_blank"
						rel="noopener noreferrer"
						class="text-sm text-secondary hover:underline"
					>
						Universidade Federal de Minas Gerais
					</a>
				</div>
			</div>
		</div>
	</div>
</section>
