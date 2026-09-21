<script lang="ts">
	import EmblaCarousel, { type EmblaCarouselType, type EmblaOptionsType } from 'embla-carousel';
	import Autoplay from 'embla-carousel-autoplay';
	import ChevronLeft from 'lucide-svelte/icons/chevron-left';
	import ChevronRight from 'lucide-svelte/icons/chevron-right';
	import ExternalLink from 'lucide-svelte/icons/external-link';
	import { m } from '$lib/paraglide/messages';
	import { resolve } from '$app/paths';
	import { localizeHref } from '$lib/paraglide/runtime';
	import { t } from '$lib/i18n';
	import { formatNewsDate } from '$lib/date';
	import { isInternalArticle, cardPhoto, type NewsItem, type NewsCategory } from '$lib/data/news';

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
	<!-- pt-14 / pb-20: mesmo ritmo das demais seções da home (ver +page.svelte). Topo
	     mais curto aproxima o título do conteúdo anterior; base maior separa da próxima
	     seção. -->
	<section
		class="relative z-10 bg-gradient-to-b from-white to-muted pt-14 pb-20"
		aria-roledescription="carousel"
		aria-label={m.home_news_eyebrow()}
	>
		<div class="mx-auto max-w-6xl px-6">
			<!-- Empilha abaixo de `sm`: lado a lado numa tela de 390px o título e o link
			     quebravam os dois em duas linhas e encostavam um no outro. -->
			<div class="mb-12 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
				<div>
					<p class="text-sm font-semibold tracking-widest text-secondary uppercase">
						{m.home_news_eyebrow()}
					</p>
					<h2 class="mt-2 text-[1.75rem] font-bold tracking-tight text-primary sm:text-[2rem]">
						{m.home_news_heading()}
					</h2>
				</div>
				<a
					href={localizeHref(resolve('/news'))}
					class="inline-flex items-center gap-1 text-base font-medium text-secondary hover:underline"
				>
					{m.home_news_link()} <span aria-hidden="true">&rarr;</span>
				</a>
			</div>

			<div class="relative">
				<!-- O hover vive aqui, e não no <article>: sombra e anel pertencem a esta caixa,
				     e o card visível preenche exatamente ela. Só a sombra e o contraste da
				     borda mudam — colorir o card inteiro seria pesado demais para a identidade. -->
				<div
					class="overflow-hidden rounded-2xl bg-white shadow-md ring-1 ring-border transition duration-200 hover:-translate-y-[3px] hover:shadow-xl hover:ring-primary/20"
					bind:this={viewportRef}
				>
					<div class="flex">
						{#each news as item, i (item.id)}
							<article
								class="group/card relative grid min-w-0 shrink-0 grow-0 basis-full md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]"
								role="group"
								aria-roledescription="slide"
								aria-label={m.news_slide_status({ current: i + 1, total: news.length })}
							>
								<!-- No mobile a coluna usa a proporção 16:9. No desktop precisa de altura
								     explícita: a <img> é absoluta, então a coluna não tem conteúdo em fluxo
								     para medir, e num item de grid esticado o aspect-ratio não vale como
								     piso — sem o min-h a imagem sai do lugar. O valor é menor que os 420px
								     originais para o card não ficar monumental. -->
								<div class="relative aspect-video md:aspect-auto md:min-h-[340px]">
									<img
										src={cardPhoto(item).src}
										alt={t(cardPhoto(item).alt)}
										class="absolute inset-0 h-full w-full object-cover"
										style:object-position={cardPhoto(item).position}
										loading={i === 0 ? 'eager' : 'lazy'}
										decoding="async"
										fetchpriority={i === 0 ? 'high' : 'auto'}
									/>
									<span
										class="absolute top-4 left-4 rounded-full bg-foreground/55 px-3 py-1 text-xs font-semibold tracking-wide text-white uppercase backdrop-blur-sm"
									>
										{categoryLabel(item.category)}
									</span>
								</div>
								<div class="flex flex-col justify-center gap-4 p-7 md:p-10">
									<p class="text-sm text-muted-foreground">
										{formatNewsDate(item.date)}
									</p>
									<h3
										class="text-2xl leading-tight font-bold text-balance text-primary sm:text-3xl"
									>
										{t(item.title)}
									</h3>
									<p class="text-base leading-relaxed text-muted-foreground">
										{t(item.excerpt)}
									</p>
									<!-- Card inteiro clicável sem aninhar âncoras: o `after:inset-0` estica a
									     área de clique deste único link sobre todo o <article>, que é o
									     `relative` de referência. O rótulo continua visível como pista de que
									     o bloco é interativo.

									     O aria-label começa pelo texto visível e acrescenta o título — sem
									     ele, todos os slides teriam o mesmo nome acessível ("Ler notícia") e
									     ficariam indistinguíveis numa lista de links. -->
									{#if isInternalArticle(item)}
										<a
											href={localizeHref(resolve('/news/[slug]', { slug: item.id }))}
											aria-label="{m.news_read_more()}: {t(item.title)}"
											class="mt-1 inline-flex items-center gap-1.5 text-base font-medium text-secondary after:absolute after:inset-0 after:content-[''] hover:underline"
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
						{/each}
					</div>
				</div>

				{#if snapCount > 1}
					<!-- Setas a cavalo na borda do card: metade dentro, metade fora. Antes uma
					     caía sobre a foto e a outra sobre o texto, e pareciam pertencer a
					     sistemas diferentes; na borda, as duas ficam sobre o mesmo fundo e leem
					     como controle do card inteiro.

					     Elas vivem fora da div com overflow-hidden, então a metade externa não
					     é recortada. Os 20px que sobram de cada lado cabem no px-6 do
					     contêiner da seção, sem gerar rolagem horizontal. -->
					<button
						type="button"
						onclick={handlePrev}
						aria-label={m.news_prev()}
						aria-disabled={!canScrollPrev && !canLoop}
						class="absolute top-1/2 left-0 hidden h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white text-primary shadow-md ring-1 ring-border transition hover:bg-muted sm:flex"
					>
						<ChevronLeft class="h-5 w-5" />
					</button>
					<button
						type="button"
						onclick={handleNext}
						aria-label={m.news_next()}
						aria-disabled={!canScrollNext && !canLoop}
						class="absolute top-1/2 right-0 hidden h-10 w-10 translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white text-primary shadow-md ring-1 ring-border transition hover:bg-muted sm:flex"
					>
						<ChevronRight class="h-5 w-5" />
					</button>
				{/if}
			</div>

			{#if snapCount > 1}
				<div class="mt-6 flex justify-center gap-2">
					{#each Array(snapCount) as _, i (i)}
						<button
							type="button"
							onclick={() => handleDot(i)}
							aria-label={m.news_go_to_slide({ index: i + 1 })}
							aria-current={selectedIndex === i ? 'true' : undefined}
							class="h-2 rounded-full transition {selectedIndex === i
								? 'w-5 bg-secondary'
								: 'w-2 bg-border hover:bg-muted-foreground/40'}"
						></button>
					{/each}
				</div>
			{/if}
		</div>

		<div aria-live="polite" class="sr-only">{liveAnnouncement}</div>
	</section>
{/if}
