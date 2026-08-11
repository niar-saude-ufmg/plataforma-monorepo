<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import BrainCircuit from 'lucide-svelte/icons/brain-circuit';
	import HeartHandshake from 'lucide-svelte/icons/heart-handshake';
	import ShieldCheck from 'lucide-svelte/icons/shield-check';
	import Mail from 'lucide-svelte/icons/mail';
	import MapPin from 'lucide-svelte/icons/map-pin';
	import ExternalLink from 'lucide-svelte/icons/external-link';
	import homeImg from '$lib/assets/home-img.jpg';
	import wagnerImg from '$lib/assets/staff/wagner-meira.jpg';
	import micheleImg from '$lib/assets/staff/michele.jpeg';
	import dorgivalImg from '$lib/assets/staff/Dorgival-2.jpg';
	import anaPaulaImg from '$lib/assets/staff/ana-paula.jpeg';
	import virgilioImg from '$lib/assets/staff/virgilio.jpeg';
	import { publications } from '$lib/data/publications';
	import { news } from '$lib/data/news';
	import { currentTeam } from '$lib/data/team';
	import HomeNewsCarousel from '$lib/components/HomeNewsCarousel.svelte';
	import { resolve } from '$app/paths';
	import { m } from '$lib/paraglide/messages';
	import { localizeHref } from '$lib/paraglide/runtime';

	const recentPublications = publications.slice(0, 4);

	// Os três pilares têm a mesma estrutura, então viram dados em vez de markup repetido.
	const pillars = [
		{ icon: ShieldCheck, title: m.pillar_governance_title, desc: m.pillar_governance_desc },
		{ icon: BrainCircuit, title: m.pillar_data_title, desc: m.pillar_data_desc },
		{ icon: HeartHandshake, title: m.pillar_apps_title, desc: m.pillar_apps_desc }
	];

	// Avatares da faixa institucional — uma amostra; a lista completa vive em /team.
	const teamAvatars: Array<{ name: string; photo: string; photoPos?: string }> = [
		{ name: 'Wagner Meira', photo: wagnerImg },
		{ name: 'Michele Brandão', photo: micheleImg },
		{ name: 'Dorgival Guedes', photo: dorgivalImg, photoPos: '30% 20%' },
		{ name: 'Ana Paula Silva', photo: anaPaulaImg },
		{ name: 'Virgílio Almeida', photo: virgilioImg }
	];

	// Quantas pessoas ficam de fora da amostra. Derivado da lista real para o número não
	// mentir quando alguém entra ou sai — sem isso, os cinco retratos passariam a
	// impressão de serem a equipe inteira. Egressos ficam fora: eles têm seção própria
	// em /team, mas não são equipe atual.
	const remainingMembers = currentTeam.length - teamAvatars.length;
</script>

<svelte:head>
	<title>{m.home_title()}</title>
	<meta name="description" content={m.home_meta_desc()} />
	<link rel="preload" as="image" href={homeImg} />
</svelte:head>

<!-- Hero -->
<section
	class="relative flex min-h-[70vh] items-center bg-cover bg-fixed pb-16 text-primary-foreground"
	style="background-image: url({homeImg}); background-position: center 20%;"
>
	<div class="hero-veil absolute inset-0" aria-hidden="true"></div>
	<!-- O pb-16 da section encolhe a área de centralização por baixo, então o bloco
	     assenta ~32px acima do centro geométrico da foto: centro óptico, e o CTA para
	     de encostar na borda inferior. -->
	<div class="relative mx-auto w-full max-w-6xl px-6 py-16 text-center">
		<p class="text-sm font-semibold tracking-widest text-white uppercase">
			{m.hero_eyebrow()}
		</p>
		<!-- max-w-3xl + text-balance: sem largura máxima o título ocupava os 1152px do
		     contêiner e ficava quase o dobro da largura do subtítulo, dominando a
		     composição. Limitado, ele quebra em duas linhas equilibradas. -->
		<h1
			class="mx-auto mt-4 max-w-3xl text-3xl leading-[1.15] font-bold tracking-tight text-balance sm:text-4xl md:text-[2.75rem]"
		>
			{m.hero_title()}
		</h1>
		<p class="mx-auto mt-6 max-w-2xl text-lg text-white/90">
			{m.hero_about()}
		</p>
		<div class="mt-10 flex items-center justify-center gap-6">
			<!-- A variante base do Button é text-sm, e size="lg" trava a altura em h-9: o
			     CTA primário acabava com rótulo menor que o link secundário ao lado. Daí a
			     altura e a tipografia explícitas aqui.

			     No hover o fundo vai para o cinza claro da paleta e o botão sobe 2px. -->
			<Button
				size="lg"
				class="!h-[3.25rem] !bg-white !px-10 !text-base !font-semibold !text-primary duration-200 hover:-translate-y-[3px] hover:!bg-muted"
				href={localizeHref(resolve('/about'))}
			>
				{m.hero_cta_project()}
			</Button>
			<!-- Secundário rebaixado de propósito: a hierarquia se constrói tanto elevando
			     o primário quanto recuando este. -->
			<a
				href={localizeHref(resolve('/publications'))}
				class="inline-flex items-center gap-1 text-base font-medium text-white/80 transition-colors hover:text-white hover:underline"
			>
				{m.hero_cta_publications()} <span aria-hidden="true">&rarr;</span>
			</a>
		</div>
	</div>
</section>

<!-- Notícias -->
<HomeNewsCarousel {news} />

<!-- PADRÃO DAS SEÇÕES DA HOME — repetir ao criar uma seção nova, aqui ou em componente.

     Espaçamento externo: pt-14 / pb-20. O topo mais curto que a base aproxima cada
     título do conteúdo anterior; a base maior é o que separa uma seção da seguinte.
     Simétrico (py-20) as seções pareciam soltas umas das outras.

     Cabeçalho: mb-12 no bloco inteiro, e dentro dele
       eyebrow    text-sm font-semibold tracking-widest text-secondary uppercase
       título     h2, text-[1.75rem] font-bold tracking-tight text-primary sm:text-[2rem]
       subtítulo  mt-2, max-w-2xl, text-lg leading-normal text-muted-foreground

     Os mt-2 são propositalmente menores que o mb-12 do bloco: os três elementos leem
     como uma unidade, separada do conteúdo abaixo. O subtítulo usa leading-normal, e não
     relaxed, porque a entrelinha maior soma quase 6px acima da primeira linha e afasta
     opticamente o parágrafo do título mesmo com a margem pequena.

     Quando a seção tem link de "ver todos", ele divide uma linha `mt-2 flex items-end
     justify-between` só com o h2, e o subtítulo vem abaixo dessa linha. Se o link ficar
     no mesmo flex que o subtítulo, ele alinha pela base do parágrafo e desce demais. -->

<!-- Pilares -->
<section class="relative z-10 bg-gradient-to-b from-white to-muted pt-14 pb-20">
	<div class="mx-auto max-w-6xl px-6">
		<div class="mx-auto mb-12 max-w-3xl text-center">
			<p class="text-sm font-semibold tracking-widest text-secondary uppercase">
				{m.home_about_eyebrow()}
			</p>
			<h2 class="mt-2 text-[1.75rem] font-bold tracking-tight text-primary sm:text-[2rem]">
				{m.home_about_heading()}
			</h2>
			<!-- Mais estreito que o título de propósito: a escada de larguras (título 768,
			     parágrafo 672) é o que dá hierarquia ao bloco centralizado. Na largura do
			     contêiner o parágrafo competia horizontalmente com as três colunas. -->
			<p class="mx-auto mt-2 max-w-2xl text-lg leading-normal text-muted-foreground">
				{@html m.home_about_text()}
			</p>
		</div>
		<!-- Três colunas divididas por filete, sem moldura de card.

		     O `divide-x` só entra no lg, onde as três ficam lado a lado: no sm são duas
		     colunas e o terceiro pilar cai sozinho na segunda linha, onde um filete à
		     esquerda não separaria nada. Nessa faixa a separação continua sendo o gap.

		     No lg o gap zera e o afastamento passa a ser padding interno — assim o filete
		     fica no meio do vão, e não colado num dos lados. O primeiro e o último perdem
		     o padding externo para alinhar com as bordas do contêiner. -->
		<div class="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 lg:gap-0 lg:divide-x lg:divide-border">
			{#each pillars as pillar (pillar.title)}
				<div class="lg:px-8 lg:first:pl-0 lg:last:pr-0">
					<div
						class="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary"
					>
						<pillar.icon class="h-7 w-7 text-primary-foreground" />
					</div>
					<h3 class="mt-3 text-xl font-bold text-foreground">{pillar.title()}</h3>
					<!-- leading-normal em vez de relaxed: em textos de 6-7 linhas, os 0,125 de
					     entrelinha a menos economizam mais altura que qualquer ajuste de margem. -->
					<p class="mt-3 text-base leading-normal text-muted-foreground">{pillar.desc()}</p>
				</div>
			{/each}
		</div>
	</div>
</section>

<!-- Publicações -->
<section class="relative z-10 bg-gradient-to-b from-white to-muted pt-14 pb-20">
	<div class="mx-auto max-w-6xl px-6">
		<div class="mb-12">
			<p class="text-sm font-semibold tracking-widest text-secondary uppercase">
				{m.home_pub_eyebrow()}
			</p>
			<div class="mt-2 flex items-end justify-between gap-6">
				<h2 class="text-[1.75rem] font-bold tracking-tight text-primary sm:text-[2rem]">
					{m.home_pub_heading()}
				</h2>
				<a
					href={localizeHref(resolve('/publications'))}
					class="inline-flex shrink-0 items-center gap-1 text-base font-medium text-secondary hover:underline"
				>
					{m.home_pub_link()} <span aria-hidden="true">&rarr;</span>
				</a>
			</div>
			<p class="mt-2 max-w-2xl text-lg leading-normal text-muted-foreground">
				{m.home_pub_text()}
			</p>
		</div>

		<!-- Lista editorial, não cards: sem fundo, moldura ou sombra. A separação é um
		     filete horizontal por trabalho, e o vão entre colunas (gap-x-12) é o que
		     mantém as duas leituras independentes sem precisar de caixa.

		     Virou <ul>/<li> com <h3>: é uma lista de publicações, e o título de cada uma
		     era um <p> em negrito — parecia cabeçalho sem ser um, então não dava para
		     navegar por ele nem contava como estrutura para leitor de tela e busca. -->
		<ul class="grid gap-x-12 gap-y-8 sm:grid-cols-2">
			{#each recentPublications as pub, i (pub.title)}
				{@const isLast = i === recentPublications.length - 1}
				{@const isLastRow = i >= recentPublications.length - 2}
				<!-- O filete some na última linha: em uma coluna isso é só o último item; em
				     duas, são os dois últimos. -->
				<li
					class="border-b border-border pb-6 {isLastRow ? 'sm:border-0 sm:pb-0' : ''} {isLast
						? 'border-0 pb-0'
						: ''}"
				>
					<!-- Ordem: título, metadados, autores, periódico, acesso. O título vem
					     primeiro porque é o que identifica o trabalho; ano e meta são referência.

					     Além da posição, os metadados recuam em tamanho e peso; a cor continua no
					     ciano da paleta. A pílula permanece porque a numeração das metas tem
					     significado institucional. -->
					<!-- NOTA DE ACESSIBILIDADE: o ciano sobre fundo claro rende 2,6:1 de
					     contraste, abaixo do mínimo de 4,5:1 da WCAG para texto deste tamanho.
					     Vale para todo `text-secondary` pequeno do site, não só aqui. -->
					<!-- Escada de respiros: mt-3 do título aos metadados, mt-4 dos metadados aos
					     autores, mt-1 entre autores e periódico (são um par, leem juntos) e mt-4
					     até o acesso. Os intervalos desiguais é que agrupam a informação. -->
					<h3 class="text-lg leading-snug font-bold text-primary">{pub.title}</h3>
					<div class="mt-3 flex items-center gap-2">
						<span class="text-xs font-semibold text-secondary">{pub.year}</span>
						{#each pub.metas as meta (meta)}
							<span
								class="rounded-full bg-secondary/5 px-1.5 py-0.5 text-[11px] font-medium text-secondary"
								>{m.meta_label({ meta })}</span
							>
						{/each}
					</div>
					<p class="mt-4 text-[0.9375rem] text-muted-foreground">{pub.authors}</p>
					<p class="mt-1 text-[0.9375rem] font-semibold text-muted-foreground italic">
						{pub.journal}
					</p>
					{#if pub.doi}
						<!-- eslint-disable svelte/no-navigation-without-resolve -->
						<a
							href={pub.doi}
							target="_blank"
							rel="noopener noreferrer"
							class="mt-4 inline-flex items-center gap-1 text-[0.9375rem] font-medium text-secondary hover:underline"
						>
							{m.pub_doi_short()}
							<ExternalLink class="h-4 w-4" aria-hidden="true" />
						</a>
						<!-- eslint-enable svelte/no-navigation-without-resolve -->
					{/if}
				</li>
			{/each}
		</ul>
	</div>
</section>

<!-- Faixa institucional / equipe -->
<section id="equipe" class="relative z-10 bg-gradient-to-b from-white to-muted pt-14 pb-20">
	<div class="mx-auto max-w-6xl px-6">
		<!-- Mesmo cabeçalho das seções de Publicações e Contato. -->
		<div class="mb-12">
			<p class="text-sm font-semibold tracking-widest text-secondary uppercase">
				{m.home_team_eyebrow()}
			</p>
			<div class="mt-2 flex items-end justify-between gap-6">
				<h2 class="text-[1.75rem] font-bold tracking-tight text-primary sm:text-[2rem]">
					{m.home_team_heading()}
				</h2>
				<a
					href={localizeHref(resolve('/team'))}
					class="inline-flex shrink-0 items-center gap-1 text-base font-medium text-secondary hover:underline"
				>
					{m.home_team_link()} <span aria-hidden="true">&rarr;</span>
				</a>
			</div>
			<p class="mt-2 max-w-2xl text-lg leading-normal text-muted-foreground">
				{m.home_team_text()}
			</p>
		</div>

		<!-- Faixa, não card: sem borda e com um véu de ciano a 5% no lugar do branco. Branco
		     sobre branco só se distinguia pelo anel cinza, e era esse anel que devolvia a
		     linguagem de componente depois de Pilares e Publicações terem perdido a moldura.
		     O tom vem da paleta em vez de um hex avulso, então acompanha o tema. -->
		<div class="flex items-center gap-6 rounded-xl bg-secondary/5 px-7 py-6">
			<!-- Sobreposição de 10px em retratos de 80px, ou 12,5% do diâmetro. A sobreposição
			     forte de pilha de avatares ("+32 usuários") esconde parte de cada rosto; aqui
			     as pessoas são o conteúdo, então o encaixe só sugere o grupo. -->
			<div class="flex shrink-0">
				{#each teamAvatars as member, i (member.name)}
					<img
						src={member.photo}
						alt={member.name}
						class="h-20 w-20 shrink-0 rounded-full object-cover ring-[3px] ring-white"
						style="object-position: {member.photoPos ?? 'center 20%'}; margin-left: {i > 0
							? '-10px'
							: '0'}"
					/>
				{/each}
				<!-- Sexto círculo: diz que os cinco retratos são amostra, não a equipe toda.
				     Leva a legenda junto porque "+59" sozinho lê como contador de seguidores;
				     com a palavra embaixo fica claro que são pessoas. Sem aria-hidden — agora
				     que o número tem unidade, ele é informação útil também na leitura de tela.

				     Fundo OPACO, não um tom com alfa: com preenchimento translúcido a última
				     foto aparecia através da faixa de sobreposição e parecia estar por cima. O
				     z-10 garante a ordem de pintura mesmo se a estrutura mudar. -->
				{#if remainingMembers > 0}
					<div
						class="relative z-10 -ml-[10px] flex h-20 w-20 shrink-0 flex-col items-center justify-center rounded-full bg-muted leading-none text-primary ring-[3px] ring-white"
					>
						<span class="text-sm font-semibold">+{remainingMembers}</span>
						<span class="mt-1 text-[10px] font-medium">{m.home_team_more_label()}</span>
					</div>
				{/if}
			</div>
			<!-- As áreas viram informação gráfica, e não parte da frase: em caixa alta e com
			     separadores, a interdisciplinaridade é escaneada de imediato, antes da leitura
			     da explicação. É a característica mais distintiva do núcleo, e diluída no meio
			     do parágrafo ela passava batida. -->
			<div class="min-w-0">
				<p class="text-[0.8125rem] font-medium tracking-wide text-primary uppercase">
					{m.home_team_fields()}
				</p>
				<p class="mt-2 max-w-xl text-base leading-normal text-muted-foreground">
					{m.home_team_areas()}
				</p>
			</div>
		</div>
	</div>
</section>

<!-- Contato -->
<section id="contato" class="relative z-10 bg-gradient-to-b from-white to-muted pt-14 pb-20">
	<div class="mx-auto max-w-6xl px-6">
		<div class="mb-12">
			<p class="text-sm font-semibold tracking-widest text-secondary uppercase">
				{m.home_contact_eyebrow()}
			</p>
			<!-- Mesmo cabeçalho com link à direita das seções de Notícias, Publicações e Equipe:
			     os cartões abaixo dão o essencial, e quem quer escrever de fato vai à página. -->
			<div class="mt-2 flex items-end justify-between gap-6">
				<h2 class="text-[1.75rem] font-bold tracking-tight text-primary sm:text-[2rem]">
					{m.home_contact_heading()}
				</h2>
				<a
					href={localizeHref(resolve('/contact'))}
					class="inline-flex shrink-0 items-center gap-1 text-base font-medium text-secondary hover:underline"
				>
					{m.home_contact_link()} <span aria-hidden="true">&rarr;</span>
				</a>
			</div>
			<p class="mt-2 max-w-2xl text-lg leading-normal text-muted-foreground">
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

<style>
	/* Véu azul do hero. Era uma camada chapada (bg-primary/60) sobre a foto inteira, o
	   que garantia contraste mas achatava tudo num tom só. Agora a densidade varia: um
	   núcleo forte deslocado para a esquerda cobre o texto, e a queda é rápida o
	   bastante para a médica à direita voltar a mostrar a cor original da foto.

	   Radial, e não linear: uma faixa linear cortaria a composição com uma borda reta.

	   O `color-mix` é necessário porque as variáveis da paleta são hex, e hex não aceita
	   alfa por interpolação direta. */
	.hero-veil {
		background:
			radial-gradient(
				75% 90% at 40% 48%,
				color-mix(in srgb, var(--azul-profundo) 76%, transparent) 0%,
				color-mix(in srgb, var(--azul-profundo) 60%, transparent) 40%,
				color-mix(in srgb, var(--azul-profundo) 28%, transparent) 70%,
				transparent 100%
			),
			/* Piso uniforme: segura a unidade cromática nas bordas sem chapar a direita. */
			color-mix(in srgb, var(--azul-profundo) 22%, transparent);
	}
</style>
