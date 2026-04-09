<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import BrainCircuit from 'lucide-svelte/icons/brain-circuit';
	import HeartHandshake from 'lucide-svelte/icons/heart-handshake';
	import ShieldCheck from 'lucide-svelte/icons/shield-check';
	import Mail from 'lucide-svelte/icons/mail';
	import MapPin from 'lucide-svelte/icons/map-pin';
	import homeImg from '$lib/assets/home-img.jpg';
</script>

<svelte:head>
	<title>NIAR - Página Inicial</title>
	<meta name="description" content="NIAR - Site institucional" />
</svelte:head>

<!-- Hero -->
<section class="relative text-primary-foreground">
	<img src={homeImg} alt="" class="absolute inset-0 h-full w-full object-cover object-[center_20%]" />
	<div class="absolute inset-0 bg-primary/70"></div>
	<div class="relative mx-auto max-w-6xl px-6 py-32 text-center">
		<h1 class="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
			Bem-vindo ao NIAR-Saúde
		</h1>
		<p class="mx-auto mt-6 max-w-2xl text-lg text-primary-foreground/80">
			Núcleo de Inteligência Artificial Responsável para a Saúde
		</p>
		<div class="mt-10 flex items-center justify-center gap-4">
			<Button size="lg" class="!bg-white !text-primary !px-8 !py-3 hover:!bg-white/90" href="/about">
				Saiba mais
			</Button>
			<Button size="lg" variant="outline" class="!border-white/40 !bg-transparent !px-8 !py-3 !text-white hover:!bg-white/10 hover:!text-white" href="#contato">
				Entre em contato
			</Button>
		</div>
	</div>
</section>

<!-- Pilares -->
<section class="py-20 bg-gradient-to-b from-white to-muted">
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
			<Card.Root class="rounded-2xl border-0 px-6 py-8 bg-white ring-1 ring-border shadow-sm">
				<Card.Header class="gap-4">
					<div class="flex h-14 w-14 items-center justify-center rounded-xl bg-primary">
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

			<Card.Root class="rounded-2xl border-0 px-6 py-8 bg-white ring-1 ring-border shadow-sm">
				<Card.Header class="gap-4">
					<div class="flex h-14 w-14 items-center justify-center rounded-xl bg-primary">
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

			<Card.Root class="rounded-2xl border-0 px-6 py-8 bg-white ring-1 ring-border shadow-sm">
				<Card.Header class="gap-4">
					<div class="flex h-14 w-14 items-center justify-center rounded-xl bg-primary">
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
<section id="equipe" class="py-20 bg-gradient-to-b from-white to-muted">
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

		<div class="grid gap-6 sm:grid-cols-2">
			{#each [
				{ initials: 'ZQ', name: 'Dra. Zoraide Queiroga', role: 'Coordenadora', area: 'IA & Saúde Pública' },
				{ initials: 'TF', name: 'Dr. Tancredo Figueira', role: 'Pesquisador', area: 'Aprendizado de Máquina' },
				{ initials: 'OP', name: 'Dra. Olívia Pitangueira', role: 'Pesquisadora', area: 'Ética em IA' },
				{ initials: 'BX', name: 'Dr. Belchior Xaxá', role: 'Pesquisador', area: 'Epidemiologia Computacional' },
				{ initials: 'NV', name: 'Dra. Nereida Vasques', role: 'Pesquisadora', area: 'Visão Computacional Médica' },
				{ initials: 'EZ', name: 'Dr. Epaminondas Zimbra', role: 'Pesquisador', area: 'NLP Clínico' }
			] as member (member.initials)}
				<div class="flex items-center gap-5 rounded-2xl bg-white p-6 ring-1 ring-border">
					<div class="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary text-sm font-bold text-white">
						{member.initials}
					</div>
					<div>
						<p class="font-bold text-primary">{member.name}</p>
						<p class="text-sm text-muted-foreground">{member.role} · {member.area}</p>
					</div>
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
<section id="contato" class="py-20 bg-gradient-to-b from-white to-muted">
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
			<div class="flex items-center gap-5 rounded-2xl bg-white p-6 ring-1 ring-border">
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

			<div class="flex items-center gap-5 rounded-2xl bg-white p-6 ring-1 ring-border">
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
