<script lang="ts">
	import Search from 'lucide-svelte/icons/search';
	import * as Select from '$lib/components/ui/select';
	import { publications } from '$lib/data/publications';

	let search = $state('');
	let selectedMeta = $state('all');
	let selectedYear = $state('all');

	const allMetas = $derived([...new Set(publications.flatMap((p) => p.metas))].sort((a, b) => parseFloat(a) - parseFloat(b)));
	const allYears = $derived([...new Set(publications.map((p) => p.year))].sort((a, b) => b.localeCompare(a)));

	let filtered = $derived(publications.filter((p) => {
		const q = search.toLowerCase();
		const matchesSearch = p.title.toLowerCase().includes(q) || p.authors.toLowerCase().includes(q);
		const matchesMeta = selectedMeta === 'all' || p.metas.includes(selectedMeta);
		const matchesYear = selectedYear === 'all' || p.year === selectedYear;
		return matchesSearch && matchesMeta && matchesYear;
	}));

	let metaLabel = $derived(selectedMeta === 'all' ? 'Todas as metas' : `Meta ${selectedMeta}`);
	let yearLabel = $derived(selectedYear === 'all' ? 'Todos os anos' : selectedYear);
</script>

<svelte:head>
	<title>Publicações - NIAR</title>
	<meta name="description" content="Publicações e produções científicas do NIAR-Saúde" />
</svelte:head>

<section class="flex-1 py-16" style="background-color: rgb(245, 245, 245);">
	<div class="mx-auto max-w-6xl px-6">
		<a href="/" class="inline-flex items-center gap-1 text-sm font-medium text-secondary hover:underline">
			<span aria-hidden="true">&larr;</span> Voltar à página inicial
		</a>

		<h1 class="mt-6 text-4xl font-bold tracking-tight text-primary sm:text-5xl">
			Publicações
		</h1>
		<p class="mt-4 max-w-2xl text-lg leading-relaxed text-muted-foreground">
			Artigos e produções científicas do NIAR-Saúde.
		</p>

		<div class="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
			<div class="relative flex-1">
				<Search class="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
				<input
					type="text"
					placeholder="Buscar por título ou autor..."
					bind:value={search}
					class="w-full rounded-full bg-white py-3 pl-12 pr-4 text-base ring-1 ring-border placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary"
				/>
			</div>
			<Select.Root type="single" bind:value={selectedMeta}>
				<Select.Trigger class="min-w-[160px] !h-auto py-3 rounded-full bg-primary px-7 border-none [&_svg]:text-white">
					<span class="text-base font-normal text-white">{metaLabel}</span>
				</Select.Trigger>
				<Select.Content class="[&_*]:text-base">
					<Select.Item value="all" label="Todas as metas" />
					{#each allMetas as meta}
						<Select.Item value={meta} label="Meta {meta}" />
					{/each}
				</Select.Content>
			</Select.Root>
			<Select.Root type="single" bind:value={selectedYear}>
				<Select.Trigger class="min-w-[160px] !h-auto py-3 rounded-full bg-primary px-7 border-none [&_svg]:text-white">
					<span class="text-base font-normal text-white">{yearLabel}</span>
				</Select.Trigger>
				<Select.Content class="[&_*]:text-base">
					<Select.Item value="all" label="Todos os anos" />
					{#each allYears as year}
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
						{#each pub.metas as meta}
							<span class="rounded-full bg-secondary/10 px-2.5 py-0.5 text-xs font-semibold text-secondary">Meta {meta}</span>
						{/each}
					</div>
					<p class="mt-3 text-lg font-bold text-primary leading-snug">{pub.title}</p>
					<p class="mt-2 text-sm text-muted-foreground">{pub.authors}</p>
					<p class="mt-1 text-sm italic text-muted-foreground">{pub.journal}</p>
					<a href={pub.doi} class="mt-3 inline-flex items-center gap-1 text-sm font-medium text-secondary hover:underline">
						Acessar via DOI <span aria-hidden="true">&nearr;</span>
					</a>
				</div>
			{/each}
		</div>

	</div>
</section>
