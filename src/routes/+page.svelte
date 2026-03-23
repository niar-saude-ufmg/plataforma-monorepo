<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import BrainCircuit from 'lucide-svelte/icons/brain-circuit';
	import HeartHandshake from 'lucide-svelte/icons/heart-handshake';
	import ShieldCheck from 'lucide-svelte/icons/shield-check';
</script>

<svelte:head>
	<title>NIAR - Página Inicial</title>
	<meta name="description" content="NIAR - Site institucional" />
</svelte:head>

<!-- Hero -->
<section class="bg-primary text-primary-foreground">
	<div class="mx-auto max-w-6xl px-6 py-24 text-center">
		<h1 class="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
			Bem-vindo ao NIAR-Saúde
		</h1>
		<p class="mx-auto mt-6 max-w-2xl text-lg text-primary-foreground/80">
			Núcleo de Inteligência Artificial Responsável para a Saúde
		</p>
		<div class="mt-10 flex items-center justify-center gap-4">
			<Button size="lg" class="!bg-white !text-primary hover:!bg-white/90" href="/about">
				Saiba mais
			</Button>
			<Button size="lg" variant="outline" class="!border-white/40 !bg-transparent !text-white hover:!bg-white/10 hover:!text-white" href="/about#contato">
				Entre em contato
			</Button>
		</div>
	</div>
</section>

<!-- Pilares -->
<section class="bg-muted py-20">
	<div class="mx-auto max-w-6xl px-6">
		<div class="mx-auto mb-16 max-w-3xl text-center">
			<h2 class="text-3xl font-bold tracking-tight text-primary sm:text-4xl">
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
