<script lang="ts">
	import EmblaCarousel, {
		type EmblaCarouselType,
		type EmblaOptionsType
	} from 'embla-carousel';
	import Autoplay from 'embla-carousel-autoplay';
	import ChevronLeft from 'lucide-svelte/icons/chevron-left';
	import ChevronRight from 'lucide-svelte/icons/chevron-right';
	import Calendar from 'lucide-svelte/icons/calendar';
	import { m } from '$lib/paraglide/messages';
	import { t } from '$lib/i18n';
	import { formatNewsDate } from '$lib/date';
	import type { NewsItem, NewsCategory } from '$lib/data/news';

	let { news }: { news: NewsItem[] } = $props();

	let viewportRef = $state<HTMLDivElement | null>(null);
	let embla = $state<EmblaCarouselType | null>(null);
	let selectedIndex = $state(0);
	let snapCount = $state(0);
	let canScrollPrev = $state(false);
	let canScrollNext = $state(false);
	let liveAnnouncement = $state('');

	const canLoop = $derived(news.length >= 2);

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

	function announceCurrent(instance: EmblaCarouselType) {
		const current = instance.selectedScrollSnap() + 1;
		liveAnnouncement = m.news_slide_status({ current, total: snapCount });
	}

	function handlePrev() {
		if (!embla) return;
		embla.scrollPrev();
		announceCurrent(embla);
	}

	function handleNext() {
		if (!embla) return;
		embla.scrollNext();
		announceCurrent(embla);
	}

	function handleDot(index: number) {
		if (!embla) return;
		embla.scrollTo(index);
		announceCurrent(embla);
	}

	$effect(() => {
		if (!viewportRef || news.length === 0) return;

		const reduceMotion =
			typeof window !== 'undefined' &&
			window.matchMedia('(prefers-reduced-motion: reduce)').matches;

		const options: EmblaOptionsType = { loop: canLoop, align: 'start' };
		const plugins = reduceMotion
			? []
			: [Autoplay({ delay: 7000, stopOnMouseEnter: true, stopOnInteraction: false })];

		const instance = EmblaCarousel(viewportRef, options, plugins);
		embla = instance;

		const sync = () => {
			selectedIndex = instance.selectedScrollSnap();
			canScrollPrev = instance.canScrollPrev();
			canScrollNext = instance.canScrollNext();
		};
		const syncSnaps = () => {
			snapCount = instance.scrollSnapList().length;
			sync();
		};

		syncSnaps();
		instance.on('select', sync);
		instance.on('reInit', syncSnaps);

		return () => {
			instance.destroy();
			embla = null;
		};
	});
</script>

{#if news.length > 0}
	<section
		class="relative z-10 bg-gradient-to-b from-white to-muted py-20"
		aria-roledescription="carousel"
		aria-label={m.home_news_eyebrow()}
	>
		<div class="mx-auto max-w-6xl px-6">
			<div class="mb-10">
				<p class="text-sm font-semibold tracking-widest text-secondary uppercase">
					{m.home_news_eyebrow()}
				</p>
				<h2 class="mt-2 text-3xl font-bold tracking-tight text-primary sm:text-4xl">
					{m.home_news_heading()}
				</h2>
			</div>

			<div class="relative">
				<div
					class="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-border"
					bind:this={viewportRef}
				>
					<div class="flex">
						{#each news as item, i (item.id)}
							<article
								class="grid min-w-0 shrink-0 grow-0 basis-full md:grid-cols-2"
								role="group"
								aria-roledescription="slide"
								aria-label={m.news_slide_status({ current: i + 1, total: news.length })}
							>
								<div class="relative aspect-video md:aspect-auto md:min-h-[420px]">
									<img
										src={item.image}
										alt={t(item.imageAlt)}
										class="absolute inset-0 h-full w-full object-cover"
										loading={i === 0 ? 'eager' : 'lazy'}
										decoding="async"
										fetchpriority={i === 0 ? 'high' : 'auto'}
									/>
									<span
										class="absolute top-5 left-5 rounded-full bg-foreground/55 px-4 py-1.5 text-xs font-semibold tracking-wide text-white uppercase backdrop-blur-sm"
									>
										{categoryLabel(item.category)}
									</span>
								</div>
								<div class="flex flex-col justify-center gap-5 p-8 md:p-12">
									<p class="flex items-center gap-2 text-sm text-muted-foreground">
										<Calendar class="h-4 w-4" aria-hidden="true" />
										{formatNewsDate(item.date)}
									</p>
									<h3 class="text-2xl leading-tight font-bold text-primary sm:text-3xl">
										{t(item.title)}
									</h3>
									<p class="text-base leading-relaxed text-muted-foreground">
										{t(item.excerpt)}
									</p>
									{#if item.link}
										<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
										<a
											href={item.link}
											target="_blank"
											rel="noopener noreferrer"
											class="mt-1 inline-flex items-center gap-1.5 text-base font-medium text-secondary hover:underline"
										>
											{m.news_read_more()} <span aria-hidden="true">&rarr;</span>
										</a>
									{/if}
								</div>
							</article>
						{/each}
					</div>
				</div>

				{#if snapCount > 1}
					<button
						type="button"
						onclick={handlePrev}
						aria-label={m.news_prev()}
						aria-disabled={!canScrollPrev && !canLoop}
						class="absolute top-1/2 left-4 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white text-primary shadow-md ring-1 ring-border transition hover:bg-muted sm:flex"
					>
						<ChevronLeft class="h-5 w-5" />
					</button>
					<button
						type="button"
						onclick={handleNext}
						aria-label={m.news_next()}
						aria-disabled={!canScrollNext && !canLoop}
						class="absolute top-1/2 right-4 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white text-primary shadow-md ring-1 ring-border transition hover:bg-muted sm:flex"
					>
						<ChevronRight class="h-5 w-5" />
					</button>
				{/if}
			</div>

			{#if snapCount > 1}
				<div class="mt-8 flex justify-center gap-2">
					{#each Array(snapCount) as _, i (i)}
						<button
							type="button"
							onclick={() => handleDot(i)}
							aria-label={m.news_go_to_slide({ index: i + 1 })}
							aria-current={selectedIndex === i ? 'true' : undefined}
							class="h-2 rounded-full transition {selectedIndex === i
								? 'w-8 bg-secondary'
								: 'w-2 bg-border hover:bg-muted-foreground/40'}"
						></button>
					{/each}
				</div>
			{/if}
		</div>

		<div aria-live="polite" class="sr-only">{liveAnnouncement}</div>
	</section>
{/if}
