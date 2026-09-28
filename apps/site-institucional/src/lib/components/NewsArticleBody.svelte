<script lang="ts">
	import { t } from '$lib/i18n';
	import type { Localized } from '$lib/i18n';
	import type { NewsGallery, NewsPhoto } from '$lib/data/news';

	let {
		photos,
		gallery = 'wide',
		body = []
	}: { photos: NewsPhoto[]; gallery?: NewsGallery; body?: Localized[] } = $props();

	/* Os templates 'duo-float-*' são os únicos em que as fotos entram no meio do texto,
	   e não num bloco antes dele. Por isso este componente recebe o corpo da matéria:
	   nos demais ele só imprime a galeria e depois os parágrafos, mas aqui precisa
	   intercalar os dois. */
	const flutuante = $derived(gallery === 'duo-float-right' || gallery === 'duo-float-left');
	const ladoDaPrimeira = $derived(gallery === 'duo-float-left' ? 'left' : 'right');

	/* A segunda foto entra no miolo do texto, não logo abaixo da primeira: é o
	   escalonamento que dá o ritmo do formato. */
	const posicaoDaSegunda = $derived(
		Math.min(Math.ceil(body.length / 2), Math.max(body.length - 1, 0))
	);

	/* Proporção de cada moldura, por template. 'tall' é o único sem recorte: a foto
	   entra inteira, em coluna estreita, que é o jeito de publicar uma vertical sem
	   descartar metade dela. Os demais recortam, porque fotos lado a lado só leem
	   como conjunto se tiverem a mesma altura. */
	const proporcao: Record<NewsGallery, string> = {
		wide: 'aspect-video',
		tall: '',
		duo: 'aspect-[4/5]',
		'duo-stacked': 'aspect-video',
		'duo-float-right': '',
		'duo-float-left': '',
		trio: 'aspect-[4/5]',
		'trio-lead': 'aspect-[4/5]'
	};

	/* Grade do conjunto. No celular tudo vira uma coluna: duas ou três fotos lado a
	   lado numa tela de 390px ficariam pequenas demais para significar alguma coisa. */
	const grade: Record<NewsGallery, string> = {
		wide: '',
		tall: '',
		duo: 'grid gap-4 sm:grid-cols-2',
		'duo-stacked': 'grid gap-4',
		'duo-float-right': '',
		'duo-float-left': '',
		trio: 'grid gap-4 sm:grid-cols-3',
		'trio-lead': 'grid gap-4 sm:grid-cols-2'
	};

	const semRecorte = $derived(gallery === 'tall' || flutuante);
	/* No 'trio-lead' a primeira foto ocupa a linha inteira, em 16:9, e as outras duas
	   dividem a linha de baixo. */
	const destaque = $derived(gallery === 'trio-lead');

	/* Largura da foto flutuante: 45% da coluna, deixando cerca de 365px para o texto —
	   o piso para uma linha não virar duas ou três palavras soltas. Abaixo de `sm` não
	   há float — a foto ocupa a largura toda e o texto segue depois dela.

	   A segunda limpa as duas margens para começar sempre abaixo da primeira: sem
	   isso, duas verticais em lados opostos se sobrepõem na vertical e espremem o
	   texto entre elas. */
	function classesFlutuante(lado: 'left' | 'right', primeira: boolean): string {
		const base = 'mb-6 w-full sm:w-[45%]';
		const flutua = lado === 'right' ? 'sm:float-right sm:ml-8' : 'sm:float-left sm:mr-8';
		return `${base} ${flutua} ${primeira ? '' : 'sm:clear-both'}`;
	}
</script>

{#snippet foto(item: NewsPhoto, indice: number, molduraExtra: string, legendaExtra: string)}
	<figure class={molduraExtra}>
		{#if semRecorte}
			<img
				src={item.src}
				alt={t(item.alt)}
				class="block w-full rounded-2xl ring-1 ring-border {gallery === 'tall'
					? 'mx-auto max-w-md'
					: ''}"
				loading={indice === 0 ? 'eager' : 'lazy'}
				decoding="async"
				fetchpriority={indice === 0 ? 'high' : 'auto'}
			/>
		{:else}
			<div
				class="relative overflow-hidden rounded-2xl ring-1 ring-border {destaque && indice === 0
					? 'aspect-video'
					: proporcao[gallery]}"
			>
				<img
					src={item.src}
					alt={t(item.alt)}
					class="absolute inset-0 h-full w-full object-cover"
					style:object-position={item.position}
					loading={indice === 0 ? 'eager' : 'lazy'}
					decoding="async"
					fetchpriority={indice === 0 ? 'high' : 'auto'}
				/>
			</div>
		{/if}
		{#if item.caption}
			<!-- A legenda acompanha a largura da foto: no 'tall' a moldura é estreita e
			     centralizada, então a legenda segue o mesmo limite para não ficar solta. -->
			<figcaption
				class="mt-3 text-sm text-foreground/60 italic {gallery === 'tall'
					? 'mx-auto max-w-md'
					: ''} {legendaExtra}"
			>
				{t(item.caption)}
			</figcaption>
		{/if}
	</figure>
{/snippet}

{#if flutuante}
	<!-- Bloco, e não flex: num container flex o float de um item não afeta os irmãos,
	     e o texto passaria por baixo da foto em vez de contorná-la. O `after:clear-both`
	     garante que o container englobe as fotos, para a seção seguinte não subir. -->
	<div class="mt-8 space-y-6 after:clear-both after:block after:content-['']">
		{#each body as paragrafo, i (i)}
			{#if i === 0 && photos[0]}
				{@render foto(photos[0], 0, classesFlutuante(ladoDaPrimeira, true), '')}
			{/if}
			{#if i === posicaoDaSegunda && photos[1]}
				{@render foto(
					photos[1],
					1,
					classesFlutuante(ladoDaPrimeira === 'right' ? 'left' : 'right', false),
					''
				)}
			{/if}
			<p class="text-lg leading-relaxed text-foreground/90">{t(paragrafo)}</p>
		{/each}
	</div>
{:else}
	<div class="mt-8 {grade[gallery]}">
		{#each photos as item, i (item.src)}
			{@render foto(item, i, destaque && i === 0 ? 'sm:col-span-2' : '', '')}
		{/each}
	</div>

	<div class="mt-8 flex flex-col gap-6">
		{#each body as paragrafo, i (i)}
			<p class="text-lg leading-relaxed text-foreground/90">{t(paragrafo)}</p>
		{/each}
	</div>
{/if}
