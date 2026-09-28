<script lang="ts">
	import ArrowRight from 'lucide-svelte/icons/arrow-right';
	import Users from 'lucide-svelte/icons/users';
	import { pageTitle, SITE_NAME } from '$lib/seo';
	import { resolve } from '$app/paths';
	import { m } from '$lib/paraglide/messages';
	import { localizeHref, getLocale } from '$lib/paraglide/runtime';

	const EMAIL = 'niar@dcc.ufmg.br';

	// Endereço do prédio, não "UFMG": no campus da Pampulha, um alfinete genérico cai a
	// centenas de metros do ICEx. A mesma busca serve para o mapa e para a rota.
	const PLACE =
		'Departamento de Ciência da Computação, UFMG, Av. Antônio Carlos 6627, Belo Horizonte';

	// Zoom de abertura. O embed sem chave não aceita estilo nem filtro de POIs, então o
	// zoom é o único controle de ruído que temos: em 16 o quadro pegava lanchonete, museu
	// e estacionamento do entorno; em 17 sobra o quarteirão do ICEx e as vias do campus,
	// que é o que responde "UFMG → Pampulha → DCC". Subir mais perderia a referência do
	// campus.
	const MAP_ZOOM = 17;

	// Embed do Google Maps sem chave de API: `output=embed` devolve o mesmo mapa
	// interativo da versão pública. `hl` acompanha o idioma da página, para os rótulos do
	// mapa não voltarem ao português numa página em inglês.
	//
	// O painel branco que o Google desenha sobre o mapa (nome, nota, avaliações, botões)
	// vem junto com a busca por lugar e não tem parâmetro que o desligue — decisão
	// consciente de conviver com ele. A alternativa dentro do Google seria trocar o `q`
	// por uma view em coordenadas (`?ll=<lat>,<lon>&z=...&output=embed`), que não desenha
	// painel nenhum, mas também não desenha o alfinete do DCC.
	let mapSrc = $derived(
		`https://www.google.com/maps?q=${encodeURIComponent(PLACE)}&z=${MAP_ZOOM}&hl=${
			getLocale() === 'pt' ? 'pt-BR' : 'en'
		}&output=embed`
	);

	const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(PLACE)}`;
</script>

<svelte:head>
	<title>{pageTitle(m.contact_title())}</title>
	<meta name="description" content={m.contact_meta_desc()} />
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
			{m.contact_heading()}
		</h1>
		<p class="mt-4 max-w-2xl text-lg leading-relaxed text-muted-foreground">
			{m.contact_subtitle()}
		</p>

		<!-- Cartão e mapa: o endereço escrito e o endereço no mapa são a mesma informação, e
		     separá-los em duas caixas lado a lado obrigaria a ler duas vezes.

		     Abaixo de `lg` os dois ficam empilhados, sem sobreposição nenhuma: dados, botões e
		     só então o mapa. Numa tela estreita o cartão sobre o mapa espremia os dois.

		     A partir de `lg` o cartão sai do fluxo e encosta no canto superior direito, com o
		     `lg:pt-14` abrindo o espaço que ele ocupa acima da borda do mapa. O `lg:top-6`
		     desce o cartão 24px dentro desse espaço: em `top-0` ele saltava para fora do mapa
		     e ficava com cara de etiqueta colada por cima; descendo, sobra respiro acima e a
		     maior parte dele fica assentada dentro do quadro.

		     O pino nunca fica atrás do cartão porque o Google centraliza o resultado no
		     quadro: com o conteúdo em `W` px, o pino cai em `W/2` e a borda esquerda do
		     cartão em `W - 400` (22,5rem de largura + 2,5rem de afastamento). A folga é
		     `W/2 - 400`, positiva para qualquer `W` acima de 800px — e em `lg` o conteúdo já
		     tem no mínimo 976px, o que dá ~88px de folga no pior caso. -->
		<div class="relative mt-12 lg:pt-14">
			<div
				class="rounded-2xl bg-primary p-7 text-primary-foreground shadow-xl lg:absolute lg:top-6 lg:right-10 lg:z-10 lg:w-[22.5rem]"
			>
				<!-- Marca em cima e nome por extenso embaixo, em corpo menor: dentro do cartão isso
				     é identificação do endereço, não manchete — com o nome inteiro em destaque ele
				     competia com o próprio h1 da página. -->
				<p class="text-lg leading-none font-bold">{SITE_NAME}</p>
				<p class="mt-1.5 text-sm leading-snug text-primary-foreground/70">{m.hero_title()}</p>

				<!-- Endereço em `text-sm`, o mesmo corpo do nome por extenso: em `text-base` a
				     linha do Departamento saía maior que a linha acima dela e disputava com a
				     marca. Assim o negrito fica reservado ao NIAR-Saúde e ao e-mail, que são o
				     que se procura no cartão. O `mt-3.5` encurta a distância para o nome do
				     núcleo — as duas informações são o mesmo bloco de identificação. -->
				<p class="mt-3.5 text-sm leading-relaxed whitespace-pre-line text-primary-foreground/80">
					{m.contact_address_value()}
				</p>

				<!-- Branco cheio, semibold e sublinhado permanente (discreto): destaca o e-mail do
				     bloco de endereço, onde ele se perdia, e avisa que a própria linha é clicável,
				     sem virar um segundo botão ao lado de "Enviar e-mail". -->
				<a
					href="mailto:{EMAIL}"
					class="mt-4 inline-block font-semibold break-words text-primary-foreground underline decoration-primary-foreground/30 underline-offset-4 transition-colors hover:decoration-primary-foreground"
				>
					{EMAIL}
				</a>

				<!-- Botões em pílula branca, como no resto do site: o primeiro é a ação principal
				     (escrever), o segundo fica em contorno para não disputar com ela.

				     Padding e altura são idênticos nos dois. A partir de `lg` o cartão estreita e
				     eles empilham; aí passam a dividir a largura cheia, porque empilhados a
				     diferença de largura entre "Enviar e-mail" e "Como chegar" salta à vista.
				     Abaixo de `lg` o cartão é largo, os dois cabem lado a lado e cada um fica com
				     a largura do próprio texto. -->
				<div class="mt-6 flex flex-wrap gap-3 lg:grid lg:grid-cols-1">
					<a
						href="mailto:{EMAIL}"
						class="inline-flex items-center justify-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-primary transition-opacity hover:opacity-90 lg:w-full"
					>
						{m.contact_cta_email()}
						<ArrowRight class="h-4 w-4" aria-hidden="true" />
					</a>
					<!-- eslint-disable svelte/no-navigation-without-resolve -->
					<a
						href={directionsUrl}
						target="_blank"
						rel="noopener noreferrer"
						class="inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-primary-foreground ring-1 ring-primary-foreground/40 transition-colors hover:bg-primary-foreground/10 lg:w-full"
					>
						{m.contact_cta_directions()}
						<ArrowRight class="h-4 w-4" aria-hidden="true" />
					</a>
					<!-- eslint-enable svelte/no-navigation-without-resolve -->
				</div>
			</div>

			<div class="mt-8 overflow-hidden rounded-2xl ring-1 ring-border lg:mt-0">
				<!-- `loading="lazy"`: o mapa é um documento inteiro do Google e só entra na conta
				     quando a pessoa chega perto dele. O título é o que a leitura de tela anuncia
				     no lugar do conteúdo do iframe, que ela não consegue percorrer. -->
				<iframe
					src={mapSrc}
					title={m.contact_map_title()}
					loading="lazy"
					referrerpolicy="no-referrer-when-downgrade"
					class="block h-[22rem] w-full border-0 sm:h-[26rem] lg:h-[34rem]"
				></iframe>
			</div>
		</div>

		<!-- Fecho: quem procura uma pessoa específica, e não o núcleo, tem para onde ir sem
		     precisar escrever para o endereço geral. -->
		<div
			class="mt-12 flex flex-wrap items-center gap-x-5 gap-y-3 rounded-xl bg-secondary/5 px-7 py-6 lg:mt-16"
		>
			<div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white">
				<Users class="h-6 w-6 text-secondary" />
			</div>
			<p class="min-w-0 flex-1 text-base leading-relaxed text-muted-foreground">
				{m.contact_team_hint()}
			</p>
			<!-- `basis-full sm:basis-auto`: abaixo de `sm` os três itens não cabem na mesma
			     linha, e como o link é `shrink-0` quem cedia era o parágrafo — sobravam ~170px
			     para ele e o texto virava uma coluninha de duas palavras. Mandando o link para
			     a linha de baixo, o parágrafo divide a primeira só com o ícone. -->
			<a
				href={localizeHref(resolve('/team'))}
				class="inline-flex shrink-0 basis-full items-center gap-1 text-base font-medium text-secondary hover:underline sm:basis-auto"
			>
				{m.contact_team_link()} <span aria-hidden="true">&rarr;</span>
			</a>
		</div>
	</div>
</section>
