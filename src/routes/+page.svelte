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
	import { m } from '$lib/paraglide/messages';
	import { localizeHref } from '$lib/paraglide/runtime';
	import { t } from '$lib/i18n';

	const recentPublications = publications.slice(0, 4);

	const featuredMembers = [
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
			area: { pt: 'Ciência da Computação e IA Responsável', en: 'Computer Science and Responsible AI' },
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
			area: { pt: 'Ciência da Computação e IA Responsável', en: 'Computer Science and Responsible AI' },
			photo: virgilioImg
		},
		{
			initials: 'ML',
			name: 'Mariangela Cherchiglia',
			role: { pt: 'Coordenadora Meta 6', en: 'Goal 6 Coordinator' },
			area: { pt: 'Saúde Pública', en: 'Public Health' }
		}
	];
</script>

<svelte:head>
	<title>{m.home_title()}</title>
	<meta name="description" content={m.home_meta_desc()} />
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
			{m.hero_title()}
		</h1>
		<p class="white mx-auto mt-6 max-w-2xl text-lg">
			{m.hero_subtitle()}
		</p>
		<div class="mt-10 flex items-center justify-center gap-4">
			<Button
				size="lg"
				class="!bg-white !px-8 !py-3 !text-primary hover:!bg-white/90"
				href={localizeHref(resolve('/about'))}
			>
				{m.hero_cta_project()}
			</Button>
			<a
				href={localizeHref(resolve('/publications'))}
				class="inline-flex items-center gap-1 text-base font-medium text-white hover:underline"
			>
				{m.hero_cta_publications()} <span aria-hidden="true">&rarr;</span>
			</a>
		</div>
	</div>
</section>

<!-- Pilares -->
<section class="relative z-10 bg-gradient-to-b from-white to-muted py-20">
	<div class="mx-auto max-w-6xl px-6">
		<div class="mx-auto mb-16 max-w-3xl text-center">
			<p class="text-sm font-semibold tracking-widest text-secondary uppercase">
				{m.home_about_eyebrow()}
			</p>
			<h2 class="mt-2 text-3xl font-bold tracking-tight text-primary sm:text-4xl">
				{m.home_about_heading()}
			</h2>
			<p class="mt-4 text-lg leading-relaxed text-muted-foreground">
				{m.home_about_text()}
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
					<Card.Title class="text-xl font-bold text-foreground">{m.pillar_governance_title()}</Card.Title>
					<Card.Description class="text-base leading-relaxed">
						{m.pillar_governance_desc()}
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
					<Card.Title class="text-xl font-bold text-foreground">{m.pillar_data_title()}</Card.Title>
					<Card.Description class="text-base leading-relaxed">
						{m.pillar_data_desc()}
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
					<Card.Title class="text-xl font-bold text-foreground">{m.pillar_apps_title()}</Card.Title>
					<Card.Description class="text-base leading-relaxed">
						{m.pillar_apps_desc()}
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
				<p class="text-sm font-semibold tracking-widest text-secondary uppercase">{m.home_pub_eyebrow()}</p>
				<h2 class="mt-2 text-3xl font-bold tracking-tight text-primary sm:text-4xl">
					{m.home_pub_heading()}
				</h2>
				<p class="mt-4 text-lg leading-relaxed text-muted-foreground">
					{m.home_pub_text()}
				</p>
			</div>
			<a
				href={localizeHref(resolve('/publications'))}
				class="inline-flex items-center gap-1 text-base font-medium text-secondary hover:underline"
			>
				{m.home_pub_link()} <span aria-hidden="true">&rarr;</span>
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
								>{m.meta_label({ meta })}</span
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
						{m.pub_doi_short()} <span aria-hidden="true">&nearr;</span>
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
				<p class="text-sm font-semibold tracking-widest text-secondary uppercase">{m.home_team_eyebrow()}</p>
				<h2 class="mt-2 text-3xl font-bold tracking-tight text-primary sm:text-4xl">
					{m.home_team_heading()}
				</h2>
				<p class="mt-4 text-lg leading-relaxed text-muted-foreground">
					{m.home_team_text()}
				</p>
			</div>
			<a
				href={localizeHref(resolve('/team'))}
				class="inline-flex items-center gap-1 text-base font-medium text-secondary hover:underline"
			>
				{m.home_team_link()} <span aria-hidden="true">&rarr;</span>
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

<!-- Contato -->
<section id="contato" class="relative z-10 bg-gradient-to-b from-white to-muted py-20">
	<div class="mx-auto max-w-6xl px-6">
		<div class="mb-12">
			<p class="text-sm font-semibold tracking-widest text-secondary uppercase">{m.home_contact_eyebrow()}</p>
			<h2 class="mt-2 text-3xl font-bold tracking-tight text-primary sm:text-4xl">{m.home_contact_heading()}</h2>
			<p class="mt-4 text-lg leading-relaxed text-muted-foreground">
				{m.home_contact_text()}
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
					<p class="font-bold text-primary">{m.contact_email_label()}</p>
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
					<p class="font-bold text-primary">{m.contact_location_label()}</p>
					<a
						href="https://www.google.com/maps/place/Universidade+Federal+de+Minas+Gerais/@-19.8669704,-43.9620077,17z/data=!3m1!4b1!4m6!3m5!1s0xa690ee806be67d:0xbb1391cea62811dd!8m2!3d-19.8669704!4d-43.9620077!16zL20vMDIxejJr"
						target="_blank"
						rel="noopener noreferrer"
						class="text-sm text-secondary hover:underline"
					>
						{m.contact_location_value()}
					</a>
				</div>
			</div>
		</div>
	</div>
</section>
