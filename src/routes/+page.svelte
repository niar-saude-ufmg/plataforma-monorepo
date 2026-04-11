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
	import micheleImg from '$lib/assets/staff/Michele-1.jpg';
	import dorgivalImg from '$lib/assets/staff/Dorgival-2.jpg';
	import ramonImg from '$lib/assets/staff/ramon.jpeg';
	import anaPaulaImg from '$lib/assets/staff/ana-paula.jpeg';
</script>

<svelte:head>
	<title>NIAR - Página Inicial</title>
	<meta name="description" content="NIAR - Site institucional" />
	<link rel="preload" as="image" href={homeImg} />
</svelte:head>

<!-- Hero -->
<section class="relative text-primary-foreground">
	<img src={homeImg} alt="" class="absolute inset-0 h-full w-full object-cover object-[center_20%]" fetchpriority="high" loading="eager" />
	<div class="absolute inset-0 bg-primary/70"></div>
	<div class="relative mx-auto max-w-6xl px-6 py-32 text-center">
		<h1 class="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
			Bem-vindo ao NIAR-Saúde
		</h1>
		<p class="mx-auto mt-6 max-w-2xl text-lg white">
			Núcleo de Inteligência Artificial Responsável para a Saúde
		</p>
		<div class="mt-10 flex items-center justify-center gap-4">
			<Button size="lg" class="!bg-white !text-primary !px-8 !py-3 hover:!bg-white/90" href="#contato">
				Entre em contato
			</Button>
			<a href="/about" class="inline-flex items-center gap-1 text-base font-medium text-white hover:underline">
				Saiba mais <span aria-hidden="true">&rarr;</span>
			</a>
		</div>
	</div>
</section>

<!-- Pilares -->
<section class="relative z-10 py-20 bg-gradient-to-b from-white to-muted">
	<div class="mx-auto max-w-6xl px-6">
		<div class="mx-auto mb-16 max-w-3xl text-center">
			<p class="text-sm font-semibold uppercase tracking-widest text-secondary">Sobre o NIAR Saúde</p>
			<h2 class="mt-2 text-3xl font-bold tracking-tight text-primary sm:text-4xl">
				Pesquisa que transforma o futuro da saúde
			</h2>
			<p class="mt-4 text-lg leading-relaxed text-muted-foreground">
				O NIAR-Saúde é um núcleo interdisciplinar que une pesquisadores da computação e da saúde
				para desenvolver soluções de IA confiáveis, seguras e centradas no paciente.
			</p>
		</div>
		<div class="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
			<Card.Root class="rounded-lg border-0 px-6 py-8 bg-white ring-1 ring-border shadow-sm">
				<Card.Header class="gap-4">
					<div class="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary">
						<BrainCircuit class="h-7 w-7 text-primary-foreground" />
					</div>
					<Card.Title class="text-xl font-bold text-foreground">
						Inteligência Artificial
					</Card.Title>
					<Card.Description class="text-base leading-relaxed">
						Modelos avançados de aprendizado de máquina aplicados a diagnóstico, prognóstico
						e suporte à decisão clínica.
					</Card.Description>
				</Card.Header>
			</Card.Root>

			<Card.Root class="rounded-lg border-0 px-6 py-8 bg-white ring-1 ring-border shadow-sm">
				<Card.Header class="gap-4">
					<div class="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary">
						<HeartHandshake class="h-7 w-7 text-primary-foreground" />
					</div>
					<Card.Title class="text-xl font-bold text-foreground">
						Saúde Baseada em Evidências
					</Card.Title>
					<Card.Description class="text-base leading-relaxed">
						Integração de dados clínicos e epidemiológicos para soluções que impactam o
						cuidado ao paciente.
					</Card.Description>
				</Card.Header>
			</Card.Root>

			<Card.Root class="rounded-lg border-0 px-6 py-8 bg-white ring-1 ring-border shadow-sm">
				<Card.Header class="gap-4">
					<div class="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary">
						<ShieldCheck class="h-7 w-7 text-primary-foreground" />
					</div>
					<Card.Title class="text-xl font-bold text-foreground">
						Ética & Responsabilidade
					</Card.Title>
					<Card.Description class="text-base leading-relaxed">
						Transparência, equidade e governança como pilares indissociáveis de cada projeto
						de pesquisa.
					</Card.Description>
				</Card.Header>
			</Card.Root>
		</div>
	</div>
</section>

<!-- Equipe -->
<section id="equipe" class="relative z-10 py-20 bg-gradient-to-b from-white to-muted">
	<div class="mx-auto max-w-6xl px-6">
		<div class="mx-auto mb-12 max-w-3xl text-center">
			<p class="text-sm font-semibold uppercase tracking-widest text-secondary">Equipe</p>
			<h2 class="mt-2 text-3xl font-bold tracking-tight text-primary sm:text-4xl">
				Pesquisadores
			</h2>
			<p class="mt-4 text-lg leading-relaxed text-muted-foreground">
				Um time multidisciplinar unindo computação, medicina, bioética e saúde pública.
			</p>
		</div>

		<div class="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
			{#each [
				{ initials: 'WM', name: 'Prof. Wagner Meira Júnior', role: 'Coordenador', area: 'Ciência da Computação', photo: wagnerImg },
				{ initials: 'MB', name: 'Profa. Michele Brandão', role: 'Pesquisadora', area: 'Ciência da Computação', photo: micheleImg },
				{ initials: 'DG', name: 'Prof. Dorgival Guedes Neto', role: 'Pesquisador', area: 'Ciência da Computação', photo: dorgivalImg, photoPos: '30% 20%' },
				{ initials: 'AP', name: 'Profa. Ana Paula Couto Silva', role: 'Pesquisadora', area: 'Computação Social', photo: anaPaulaImg },
				{ initials: 'MV', name: 'Dra. Marisa Vasconcelos', role: 'Pesquisadora Sênior', area: 'IA Responsável' },
				{ initials: 'RG', name: 'Ramon Gonçalves Pereira', role: 'Doutorando', area: 'IA em Saúde', photo: ramonImg }
			] as member (member.initials)}
				<div class="flex flex-col items-center rounded-lg bg-white p-8 text-center ring-1 ring-border shadow-sm transition-shadow hover:shadow-md">
					{#if member.photo}
						<img src={member.photo} alt={member.name} class="h-20 w-20 rounded-full object-cover" style="object-position: {member.photoPos ?? 'center 20%'}" />
					{:else}
						<div class="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary text-lg font-bold text-white">
							{member.initials}
						</div>
					{/if}
					<p class="mt-4 text-lg font-bold text-primary">{member.name}</p>
					<p class="mt-1 text-sm font-semibold text-secondary">{member.role}</p>
					<p class="mt-1 text-sm text-muted-foreground">{member.area}</p>
				</div>
			{/each}
		</div>

		<div class="mt-10 text-center">
			<a href="/team" class="inline-flex items-center gap-1 text-base font-medium text-secondary hover:underline">
				Ver equipe completa <span aria-hidden="true">&rarr;</span>
			</a>
		</div>
	</div>
</section>

<!-- Contato -->
<section id="contato" class="relative z-10 py-20 bg-gradient-to-b from-white to-muted">
	<div class="mx-auto max-w-6xl px-6">
		<div class="mx-auto mb-12 max-w-3xl text-center">
			<p class="text-sm font-semibold uppercase tracking-widest text-secondary">Contato</p>
			<h2 class="mt-2 text-3xl font-bold tracking-tight text-primary sm:text-4xl">
				Fale conosco
			</h2>
			<p class="mt-4 text-lg leading-relaxed text-muted-foreground">
				Interessado em colaborar ou saber mais sobre nossas pesquisas?
			</p>
		</div>

		<div class="grid gap-6 sm:grid-cols-2">
			<div class="flex items-center gap-5 rounded-lg bg-white p-6 ring-1 ring-border">
				<div class="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary">
					<Mail class="h-7 w-7 text-primary-foreground" />
				</div>
				<div>
					<p class="font-bold text-primary">E-mail</p>
					<a href="mailto:contato@niarsaude.org" class="text-sm text-secondary hover:underline">
						contato@niarsaude.org
					</a>
				</div>
			</div>

			<div class="flex items-center gap-5 rounded-lg bg-white p-6 ring-1 ring-border">
				<div class="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary">
					<MapPin class="h-7 w-7 text-primary-foreground" />
				</div>
				<div>
					<p class="font-bold text-primary">Localização</p>
					<p class="text-sm text-muted-foreground">Universidade Federal — Campus Saúde</p>
				</div>
			</div>
		</div>
	</div>
</section>
