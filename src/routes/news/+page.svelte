<script lang="ts">
	import Newspaper from 'lucide-svelte/icons/newspaper';
	import { pageTitle } from '$lib/seo';
	import Calendar from 'lucide-svelte/icons/calendar';
	import ExternalLink from 'lucide-svelte/icons/external-link';
	import { resolve } from '$app/paths';
	import { m } from '$lib/paraglide/messages';
	import { localizeHref } from '$lib/paraglide/runtime';
	import { t } from '$lib/i18n';
	import { formatNewsDate } from '$lib/date';
	import { news, isInternalArticle, cardPhoto, type NewsCategory } from '$lib/data/news';

	// Canonical order; only categories actually present in the data become chips.
	const CATEGORY_ORDER: NewsCategory[] = [
		'event',
		'award',
		'media',
		'post',
		'publication',
		'partnership'
	];

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

	const categories = CATEGORY_ORDER.filter((c) => news.some((n) => n.category === c));

	let selected = $state<'all' | NewsCategory>('all');

	// `news` is pre-sorted most-recent-first, so filtered[0] is always the latest.
	const filtered = $derived(
		selected === 'all' ? news : news.filter((n) => n.category === selected)
	);
	const featured = $derived(filtered[0]);
	const rest = $derived(filtered.slice(1));
</script>

<svelte:head>
	<title>{pageTitle(m.news_title())}</title>
	<meta name="description" content={m.news_meta_desc()} />
</svelte:head>

<section class="flex-1 py-16" style="background-color: rgb(245, 245, 245);">
	<div class="mx-auto max-w-6xl px-6">
		<a
			href={localizeHref(resolve('/'))}
			class="inline-flex items-center gap-1 text-sm font-medium text-secondary hover:underline"
		>
			<span aria-hidden="true">&larr;</span>
			{m.back_home()}
		</a>

		<h1 class="mt-6 text-4xl font-bold tracking-tight text-primary sm:text-5xl">
			{m.news_heading()}
		</h1>
		<p class="mt-4 max-w-2xl text-lg leading-relaxed text-muted-foreground">
			{m.news_subtitle()}
		</p>

		{#if news.length === 0}
			<div
				class="mt-12 flex flex-col items-center justify-center rounded-lg bg-white px-6 py-20 text-center ring-1 ring-border"
			>
				<div
					class="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary"
				>
					<Newspaper class="h-7 w-7 text-primary-foreground" />
				</div>
				<p class="mt-5 text-lg font-semibold text-primary">{m.news_empty()}</p>
			</div>
		{:else}
			<!-- Filtros por categoria -->
			{#if categories.length > 0}
				<div class="mt-8 flex flex-wrap gap-3">
					<button
						type="button"
						onclick={() => (selected = 'all')}
						aria-pressed={selected === 'all'}
						class="rounded-full px-6 py-2.5 text-base font-medium transition {selected === 'all'
							? 'bg-primary text-white'
							: 'bg-white text-primary ring-1 ring-border hover:bg-muted'}"
					>
						{m.news_filter_all()}
					</button>
					{#each categories as cat (cat)}
						<button
							type="button"
							onclick={() => (selected = cat)}
							aria-pressed={selected === cat}
							class="rounded-full px-6 py-2.5 text-base font-medium transition {selected === cat
								? 'bg-primary text-white'
								: 'bg-white text-primary ring-1 ring-border hover:bg-muted'}"
						>
							{categoryLabel(cat)}
						</button>
					{/each}
				</div>
			{/if}

			<!-- Destaque: notícia mais recente -->
			{#if featured}
				<!-- Card inteiro clicável, como no carrossel da home: o `after:inset-0` do link
				     estica a área de clique sobre todo o <article>, que é o `relative` de
				     referência. Não aninha âncoras, e o rótulo segue visível como pista. -->
				<article
					class="group/card relative mt-10 grid overflow-hidden rounded-2xl bg-white shadow-md ring-1 ring-border transition duration-200 hover:-translate-y-[3px] hover:shadow-xl hover:ring-primary/20 md:grid-cols-2"
				>
					<div class="relative aspect-video md:aspect-auto md:min-h-[420px]">
						<img
							src={cardPhoto(featured).src}
							alt={t(cardPhoto(featured).alt)}
							class="absolute inset-0 h-full w-full object-cover"
							style:object-position={cardPhoto(featured).position}
							loading="eager"
							decoding="async"
							fetchpriority="high"
						/>
						<span
							class="absolute top-5 left-5 rounded-full bg-foreground/55 px-4 py-1.5 text-xs font-semibold tracking-wide text-white uppercase backdrop-blur-sm"
						>
							{categoryLabel(featured.category)}
						</span>
					</div>
					<div class="flex flex-col justify-center gap-5 p-8 md:p-12">
						<p class="flex items-center gap-2 text-sm text-muted-foreground">
							<Calendar class="h-4 w-4" aria-hidden="true" />
							{formatNewsDate(featured.date)}
						</p>
						<h2 class="text-2xl leading-tight font-bold text-primary sm:text-3xl">
							{t(featured.title)}
						</h2>
						<p class="text-base leading-relaxed text-muted-foreground">
							{t(featured.excerpt)}
						</p>
						{#if isInternalArticle(featured)}
							<a
								href={localizeHref(resolve('/news/[slug]', { slug: featured.id }))}
								aria-label="{m.news_read_more()}: {t(featured.title)}"
								class="mt-1 inline-flex items-center gap-1.5 text-base font-medium text-secondary after:absolute after:inset-0 after:content-[''] hover:underline"
							>
								{m.news_read_more()}
								<span
									aria-hidden="true"
									class="transition-transform duration-200 group-hover/card:translate-x-1"
									>&rarr;</span
								>
							</a>
						{:else if featured.link}
							<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
							<a
								href={featured.link}
								target="_blank"
								rel="noopener noreferrer"
								aria-label="{m.news_read_more()}: {t(featured.title)}"
								class="mt-1 inline-flex items-center gap-1.5 text-base font-medium text-secondary after:absolute after:inset-0 after:content-[''] hover:underline"
							>
								{m.news_read_more()}
								<ExternalLink
									class="h-4 w-4 transition-transform duration-200 group-hover/card:translate-x-1"
									aria-hidden="true"
								/>
							</a>
						{/if}
					</div>
				</article>
			{/if}

			<!-- Demais notícias -->
			{#if rest.length > 0}
				<div class="mt-8 grid gap-8 sm:grid-cols-2">
					{#each rest as item (item.id)}
						<article
							class="group/card relative flex flex-col overflow-hidden rounded-2xl bg-white shadow-md ring-1 ring-border transition duration-200 hover:-translate-y-[3px] hover:shadow-xl hover:ring-primary/20"
						>
							<div class="relative aspect-video">
								<img
									src={cardPhoto(item).src}
									alt={t(cardPhoto(item).alt)}
									class="absolute inset-0 h-full w-full object-cover"
									style:object-position={cardPhoto(item).position}
									loading="lazy"
									decoding="async"
								/>
								<span
									class="absolute top-5 left-5 rounded-full bg-foreground/55 px-4 py-1.5 text-xs font-semibold tracking-wide text-white uppercase backdrop-blur-sm"
								>
									{categoryLabel(item.category)}
								</span>
							</div>
							<div class="flex flex-1 flex-col gap-4 p-6">
								<p class="flex items-center gap-2 text-sm text-muted-foreground">
									<Calendar class="h-4 w-4" aria-hidden="true" />
									{formatNewsDate(item.date)}
								</p>
								<h3 class="text-xl leading-tight font-bold text-primary">
									{t(item.title)}
								</h3>
								<p class="text-base leading-relaxed text-muted-foreground">
									{t(item.excerpt)}
								</p>
								{#if isInternalArticle(item)}
									<a
										href={localizeHref(resolve('/news/[slug]', { slug: item.id }))}
										aria-label="{m.news_read_more()}: {t(item.title)}"
										class="mt-auto inline-flex items-center gap-1.5 text-base font-medium text-secondary after:absolute after:inset-0 after:content-[''] hover:underline"
									>
										{m.news_read_more()}
										<span
											aria-hidden="true"
											class="transition-transform duration-200 group-hover/card:translate-x-1"
											>&rarr;</span
										>
									</a>
								{:else if item.link}
									<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
									<a
										href={item.link}
										target="_blank"
										rel="noopener noreferrer"
										aria-label="{m.news_read_more()}: {t(item.title)}"
										class="mt-auto inline-flex items-center gap-1.5 text-base font-medium text-secondary after:absolute after:inset-0 after:content-[''] hover:underline"
									>
										{m.news_read_more()}
										<ExternalLink
											class="h-4 w-4 transition-transform duration-200 group-hover/card:translate-x-1"
											aria-hidden="true"
										/>
									</a>
								{/if}
							</div>
						</article>
					{/each}
				</div>
			{/if}
		{/if}
	</div>
</section>
