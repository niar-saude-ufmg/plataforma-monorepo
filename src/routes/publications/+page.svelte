<script lang="ts">
	import Search from 'lucide-svelte/icons/search';
	import * as Select from '$lib/components/ui/select';
	import { publications } from '$lib/data/publications';
	import { resolve } from '$app/paths';

	let search = $state('');
	let selectedMeta = $state('all');
	let selectedYear = $state('all');

	const allMetas = $derived(
		[...new Set(publications.flatMap((p) => p.metas))].sort((a, b) => parseFloat(a) - parseFloat(b))
	);
	const allYears = $derived(
		[...new Set(publications.map((p) => p.year))].sort((a, b) => b.localeCompare(a))
	);

	let filtered = $derived(
		publications.filter((p) => {
			const q = search.toLowerCase();
			const matchesSearch =
				p.title.toLowerCase().includes(q) || p.authors.toLowerCase().includes(q);
			const matchesMeta = selectedMeta === 'all' || p.metas.includes(selectedMeta);
			const matchesYear = selectedYear === 'all' || p.year === selectedYear;
			return matchesSearch && matchesMeta && matchesYear;
		})
	);

	let metaLabel = $derived(selectedMeta === 'all' ? 'Todas as metas' : `Meta ${selectedMeta}`);
	let yearLabel = $derived(selectedYear === 'all' ? 'Todos os anos' : selectedYear);
</script>

<svelte:head>
	<title>Publicações</title>
	<meta name="description" content="Publicações e produções científicas do NIAR-Saúde" />
</svelte:head>

<section class="flex-1 py-16" style="background-color: rgb(245, 245, 245);">
	<div class="mx-auto max-w-6xl px-6">
		<a
			href={resolve('/')}
			class="inline-flex items-center gap-1 text-sm font-medium text-secondary hover:underline"
		>
			<span aria-hidden="true">&larr;</span> Voltar à página inicial
		</a>

		<h1 class="mt-6 text-4xl font-bold tracking-tight text-primary sm:text-5xl">Publicações</h1>
		<p class="mt-4 max-w-2xl text-lg leading-relaxed text-muted-foreground">
			Artigos e produções científicas do NIAR-Saúde.
		</p>

		<div class="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
			<div class="relative flex-1">
				<Search class="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
				<input
					type="text"
					placeholder="Buscar por título ou autor..."
					bind:value={search}
					class="w-full rounded-full bg-white py-3 pr-4 pl-12 text-base ring-1 ring-border placeholder:text-muted-foreground/60 focus:ring-2 focus:ring-primary focus:outline-none"
				/>
			</div>
			<Select.Root type="single" bind:value={selectedMeta}>
				<Select.Trigger
					class="!h-auto rounded-full border-none bg-primary px-7 py-3 [&_svg]:text-white"
				>
					<span class="grid text-base font-normal text-white">
						<span class="invisible col-start-1 row-start-1" aria-hidden="true">Todas as metas</span>
						<span class="col-start-1 row-start-1">{metaLabel}</span>
					</span>
				</Select.Trigger>
				<Select.Content class="[&_*]:text-base">
					<Select.Item value="all" label="Todas as metas" />
					{#each allMetas as meta (meta)}
						<Select.Item value={meta} label="Meta {meta}" />
					{/each}
				</Select.Content>
			</Select.Root>
			<Select.Root type="single" bind:value={selectedYear}>
				<Select.Trigger
					class="!h-auto rounded-full border-none bg-primary px-7 py-3 [&_svg]:text-white"
				>
					<span class="grid text-base font-normal text-white">
						<span class="invisible col-start-1 row-start-1" aria-hidden="true">Todos os anos</span>
						<span class="col-start-1 row-start-1">{yearLabel}</span>
					</span>
				</Select.Trigger>
				<Select.Content class="[&_*]:text-base">
					<Select.Item value="all" label="Todos os anos" />
					{#each allYears as year (year)}
						<Select.Item value={year} label={year} />
					{/each}
				</Select.Content>
			</Select.Root>
		</div>

		<p class="mt-4 text-sm text-muted-foreground">{filtered.length} artigos encontrados</p>

		<div class="mt-6 flex flex-col gap-6">
			{#each filtered as pub (pub.title)}
				<div class="rounded-lg bg-white p-6 ring-1 ring-border">
					<div class="flex items-center gap-2">
						<span class="text-sm font-bold text-secondary">{pub.year}</span>
						{#each pub.metas as meta (meta)}
							<span
								class="rounded-full bg-secondary/10 px-2.5 py-0.5 text-xs font-semibold text-secondary"
								>Meta {meta}</span
							>
						{/each}
					</div>
					<p class="mt-3 text-lg leading-snug font-bold text-primary">{pub.title}</p>
					<p class="mt-2 text-sm text-muted-foreground">{pub.authors}</p>
					<p class="mt-1 text-sm text-muted-foreground italic">{pub.journal}</p>
					<!-- eslint-disable svelte/no-navigation-without-resolve -->
					<a
						href={pub.doi}
						target="_blank"
						rel="noopener noreferrer"
						class="mt-3 inline-flex items-center gap-1 text-sm font-medium text-secondary hover:underline"
					>
						Acessar via DOI <span aria-hidden="true">&nearr;</span>
					</a>
					<!-- eslint-enable svelte/no-navigation-without-resolve -->
				</div>
			{/each}
		</div>
	</div>
</section>
