<script lang="ts">
	import Calendar from 'lucide-svelte/icons/calendar';
	import { resolve } from '$app/paths';
	import { m } from '$lib/paraglide/messages';
	import { localizeHref } from '$lib/paraglide/runtime';
	import { t } from '$lib/i18n';
	import { formatNewsDate } from '$lib/date';
	import type { NewsCategory } from '$lib/data/news';

	let { data } = $props();
	const item = $derived(data.item);

	function categoryLabel(c: NewsCategory): string {
		switch (c) {
			case 'event':
				return m.news_category_event();
			case 'award':
				return m.news_category_award();
			case 'media':
				return m.news_category_media();
			case 'post':
				return m.news_category_post();
			case 'publication':
				return m.news_category_publication();
			case 'partnership':
				return m.news_category_partnership();
		}
	}
</script>

<svelte:head>
	<title>{t(item.title)}</title>
	<meta name="description" content={t(item.excerpt)} />
</svelte:head>

<section class="flex-1 py-16" style="background-color: rgb(245, 245, 245);">
	<div class="mx-auto max-w-3xl px-6">
		<a
			href={localizeHref(resolve('/news'))}
			class="inline-flex items-center gap-1 text-sm font-medium text-secondary hover:underline"
		>
			<span aria-hidden="true">&larr;</span> {m.news_back_to_list()}
		</a>

		<div class="mt-6 flex items-center gap-3">
			<span
				class="rounded-full bg-primary px-4 py-1.5 text-xs font-semibold tracking-wide text-white uppercase"
			>
				{categoryLabel(item.category)}
			</span>
			<p class="flex items-center gap-2 text-sm text-muted-foreground">
				<Calendar class="h-4 w-4" aria-hidden="true" />
				{formatNewsDate(item.date)}
			</p>
		</div>

		<h1 class="mt-5 text-3xl font-bold tracking-tight text-primary sm:text-4xl">
			{t(item.title)}
		</h1>

		<figure class="mt-8">
			<div class="relative aspect-video overflow-hidden rounded-2xl ring-1 ring-border">
				<img
					src={item.image}
					alt={t(item.imageAlt)}
					class="absolute inset-0 h-full w-full object-cover"
					style:object-position={item.imagePosition}
					loading="eager"
					decoding="async"
					fetchpriority="high"
				/>
			</div>
			{#if item.caption}
				<figcaption class="mt-3 text-sm italic text-foreground/60">
					{t(item.caption)}
				</figcaption>
			{/if}
		</figure>

		<div class="mt-8 flex flex-col gap-6">
			{#each item.body ?? [] as paragraph, i (i)}
				<p class="text-lg leading-relaxed text-foreground/90">{t(paragraph)}</p>
			{/each}
		</div>
	</div>
</section>
