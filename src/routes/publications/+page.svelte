<script lang="ts">
	import Search from 'lucide-svelte/icons/search';
	import * as Select from '$lib/components/ui/select';
	import { publications } from '$lib/data/publications';
	import { resolve } from '$app/paths';
	import { m } from '$lib/paraglide/messages';
	import { localizeHref } from '$lib/paraglide/runtime';

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

	let metaLabel = $derived(
		selectedMeta === 'all' ? m.pub_filter_all_metas() : m.meta_label({ meta: selectedMeta })
	);
	let yearLabel = $derived(selectedYear === 'all' ? m.pub_filter_all_years() : selectedYear);
</script>

<svelte:head>
	<title>{m.pub_title()}</title>
	<meta name="description" content={m.pub_meta_desc()} />
</svelte:head>

<section class="flex-1 py-16" style="background-color: rgb(245, 245, 245);">
	<div class="mx-auto max-w-6xl px-6">
		<a
			href={localizeHref(resolve('/'))}
			class="inline-flex items-center gap-1 text-sm font-medium text-secondary hover:underline"
		>
			<span aria-hidden="true">&larr;</span> {m.back_home()}
		</a>

		<h1 class="mt-6 text-4xl font-bold tracking-tight text-primary sm:text-5xl">{m.pub_heading()}</h1>
		<p class="mt-4 max-w-2xl text-lg leading-relaxed text-muted-foreground">
			{m.pub_subtitle()}
		</p>

		<div class="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
			<div class="relative flex-1">
				<Search class="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
				<input
					type="text"
					placeholder={m.pub_search_placeholder()}
					bind:value={search}
					class="w-full rounded-full bg-white py-3 pr-4 pl-12 text-base ring-1 ring-border placeholder:text-muted-foreground/60 focus:ring-2 focus:ring-primary focus:outline-none"
				/>
			</div>
			<Select.Root type="single" bind:value={selectedMeta}>
				<Select.Trigger
					class="!h-auto rounded-full border-none bg-primary px-7 py-3 [&_svg]:text-white"
				>
					<span class="grid text-base font-normal text-white">
						<span class="invisible col-start-1 row-start-1" aria-hidden="true">{m.pub_filter_all_metas()}</span>
						<span class="col-start-1 row-start-1">{metaLabel}</span>
					</span>
				</Select.Trigger>
				<Select.Content class="[&_*]:text-base">
					<Select.Item value="all" label={m.pub_filter_all_metas()} />
					{#each allMetas as meta (meta)}
						<Select.Item value={meta} label={m.meta_label({ meta })} />
					{/each}
				</Select.Content>
			</Select.Root>
			<Select.Root type="single" bind:value={selectedYear}>
				<Select.Trigger
					class="!h-auto rounded-full border-none bg-primary px-7 py-3 [&_svg]:text-white"
				>
					<span class="grid text-base font-normal text-white">
						<span class="invisible col-start-1 row-start-1" aria-hidden="true">{m.pub_filter_all_years()}</span>
						<span class="col-start-1 row-start-1">{yearLabel}</span>
					</span>
				</Select.Trigger>
				<Select.Content class="[&_*]:text-base">
					<Select.Item value="all" label={m.pub_filter_all_years()} />
					{#each allYears as year (year)}
						<Select.Item value={year} label={year} />
					{/each}
				</Select.Content>
			</Select.Root>
		</div>

		<p class="mt-4 text-sm text-muted-foreground">{m.pub_results_count({ count: filtered.length })}</p>

		<div class="mt-6 flex flex-col gap-6">
			{#each filtered as pub (pub.title)}
				<div class="rounded-lg bg-white p-6 ring-1 ring-border">
					<div class="flex items-center gap-2">
						<span class="text-sm font-bold text-secondary">{pub.year}</span>
						{#each pub.metas as meta (meta)}
							<span
								class="rounded-full bg-secondary/10 px-2.5 py-0.5 text-xs font-semibold text-secondary"
								>{m.meta_label({ meta })}</span
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
						{m.pub_doi_link()} <span aria-hidden="true">&nearr;</span>
					</a>
					<!-- eslint-enable svelte/no-navigation-without-resolve -->
				</div>
			{/each}
		</div>
	</div>
</section>
