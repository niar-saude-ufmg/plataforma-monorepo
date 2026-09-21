<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import BrainCircuit from 'lucide-svelte/icons/brain-circuit';
	import HeartHandshake from 'lucide-svelte/icons/heart-handshake';
	import ShieldCheck from 'lucide-svelte/icons/shield-check';
	import MessageCircle from 'lucide-svelte/icons/message-circle';
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

	// Onde o hero termina, em px desde o topo da página (header + hero). No celular a
	// foto fixa do hero tem exatamente essa altura — ver o comentário no markup.
	// `bind:clientHeight` remede a cada mudança de tamanho do hero.
	let hero = $state<HTMLElement>();
	let heroHeight = $state(0);
	let heroBottom = $derived(
		hero && heroHeight
			? Math.ceil(hero.getBoundingClientRect().top + window.scrollY + heroHeight)
			: 0
	);
</script>

<svelte:head>
	<title>{m.home_title()}</title>
	<meta name="description" content={m.home_meta_desc()} />
	<link rel="preload" as="image" href={homeImg} />
</svelte:head>

<!-- Hero -->
<!-- Foto fixa atrás do conteúdo, que rola por cima dela.

     Não é `bg-fixed`: o Safari do iOS não implementa background-attachment fixed e cai
     num fallback que dimensiona a foto pela altura do documento inteiro — no celular
     sobrava um recorte ampliado e imóvel da imagem. Por isso o efeito é montado à mão:
     a foto é um <img> em `position: fixed` do tamanho da tela, e o `clip-path` da
     section recorta o que dela aparece. Um ancestral com clip-path recorta até
     descendentes fixos (ao contrário de `overflow: hidden`), e sem criar para eles um
     novo bloco de referência — a foto continua presa à tela, só visível pela "janela"
     do hero. Funciona igual em todas as larguras e navegadores.

     Altura da foto:
     - A partir de `md`, `h-lvh` (a maior altura possível da tela), que dá o mesmo
       enquadramento do antigo `bg-fixed`. `lvh` e não `inset-0`: no celular a barra de
       endereço some e reaparece durante a rolagem, e com a altura acompanhando a barra
       a foto seria redimensionada — dava um salto a cada vez.
     - No celular, só até onde o hero termina. A foto é paisagem (3:2) e a tela é
       retrato: com a altura da tela inteira o `object-cover` ampliava a foto 43% em
       relação ao hero sem efeito fixo. Menos que isso não dá — ao longo da rolagem o
       hero passa por toda a faixa entre o topo da tela e o fim dele, e a foto tem de
       cobri-la inteira. Medida em JS porque depende da altura real do texto; até lá
       vale a estimativa do CSS (70vh do hero + 77px do header). -->
<section
	bind:this={hero}
	bind:clientHeight={heroHeight}
	class="relative flex min-h-[70vh] items-center pb-16 text-primary-foreground [clip-path:inset(0)]"
>
	<img
		src={homeImg}
		alt=""
		aria-hidden="true"
		fetchpriority="high"
		class="pointer-events-none fixed top-0 left-0 h-[var(--hero-bottom,calc(70lvh+77px))] w-full object-cover md:h-lvh"
		style="object-position: center 20%;{heroBottom ? ` --hero-bottom: ${heroBottom}px;` : ''}"
	/>
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
		<!-- Empilhados abaixo de `sm`: lado a lado numa tela de 390px o link secundário
		     quebrava em duas linhas e a seta ficava órfã na terceira. -->
		<div class="mt-10 flex flex-col items-center justify-center gap-5 sm:flex-row sm:gap-6">
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
<!-- Só as três mais recentes: a home é vitrine, a lista completa mora em /news. -->
<HomeNewsCarousel news={news.slice(0, 3)} />

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

     Quando a seção tem link de "ver todos", o cabeçalho vira uma grade de duas colunas
     (`sm:grid-cols-[1fr_auto] sm:items-end`): o link divide a segunda linha com o h2 e o
     subtítulo ocupa a terceira, de ponta a ponta. Não pode ser um flex com o subtítulo
     dentro — ali o link alinharia pela base do parágrafo e desceria demais.

     Na coluna única do mobile a grade se desfaz e o link, com `order-last`, cai depois do
     subtítulo: lado a lado numa tela estreita, título e link quebravam os dois em duas
     linhas. É por isso que cada elemento carrega `sm:col-start`/`sm:row-start` explícito —
     com posições automáticas o link não teria como andar sozinho. -->

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
		<!-- Abaixo de `sm` o link de "ver todos" sai da linha do título e vai para o fim do
		     bloco: lado a lado numa tela de 390px os dois quebravam em duas linhas cada, e o
		     link acabava encavalado no título. A grade é o que deixa reordenar só ele sem
		     separar o subtítulo do h2 — `order-last` age na coluna única do mobile, e as
		     posições explícitas de `sm` refazem a linha título | link de antes. -->
		<div class="mb-12 grid sm:grid-cols-[1fr_auto] sm:items-end sm:gap-x-6">
			<p
				class="text-sm font-semibold tracking-widest text-secondary uppercase sm:col-span-2 sm:col-start-1 sm:row-start-1"
			>
				{m.home_pub_eyebrow()}
			</p>
			<h2
				class="mt-2 text-[1.75rem] font-bold tracking-tight text-primary sm:col-start-1 sm:row-start-2 sm:text-[2rem]"
			>
				{m.home_pub_heading()}
			</h2>
			<p
				class="mt-2 max-w-2xl text-lg leading-normal text-muted-foreground sm:col-span-2 sm:col-start-1 sm:row-start-3"
			>
				{m.home_pub_text()}
			</p>
			<a
				href={localizeHref(resolve('/publications'))}
				class="order-last mt-4 inline-flex shrink-0 items-center gap-1 justify-self-start text-base font-medium text-secondary hover:underline sm:order-none sm:col-start-2 sm:row-start-2 sm:mt-0 sm:justify-self-end"
			>
				{m.home_pub_link()} <span aria-hidden="true">&rarr;</span>
			</a>
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
		<!-- Abaixo de `sm` o link de "ver todos" sai da linha do título e vai para o fim do
		     bloco: lado a lado numa tela de 390px os dois quebravam em duas linhas cada, e o
		     link acabava encavalado no título. A grade é o que deixa reordenar só ele sem
		     separar o subtítulo do h2 — `order-last` age na coluna única do mobile, e as
		     posições explícitas de `sm` refazem a linha título | link de antes. -->
		<div class="mb-12 grid sm:grid-cols-[1fr_auto] sm:items-end sm:gap-x-6">
			<p
				class="text-sm font-semibold tracking-widest text-secondary uppercase sm:col-span-2 sm:col-start-1 sm:row-start-1"
			>
				{m.home_team_eyebrow()}
			</p>
			<h2
				class="mt-2 text-[1.75rem] font-bold tracking-tight text-primary sm:col-start-1 sm:row-start-2 sm:text-[2rem]"
			>
				{m.home_team_heading()}
			</h2>
			<p
				class="mt-2 max-w-2xl text-lg leading-normal text-muted-foreground sm:col-span-2 sm:col-start-1 sm:row-start-3"
			>
				{m.home_team_text()}
			</p>
			<a
				href={localizeHref(resolve('/team'))}
				class="order-last mt-4 inline-flex shrink-0 items-center gap-1 justify-self-start text-base font-medium text-secondary hover:underline sm:order-none sm:col-start-2 sm:row-start-2 sm:mt-0 sm:justify-self-end"
			>
				{m.home_team_link()} <span aria-hidden="true">&rarr;</span>
			</a>
		</div>

		<!-- Faixa, não card: sem borda e com um véu de ciano a 5% no lugar do branco. Branco
		     sobre branco só se distinguia pelo anel cinza, e era esse anel que devolvia a
		     linguagem de componente depois de Pilares e Publicações terem perdido a moldura.
		     O tom vem da paleta em vez de um hex avulso, então acompanha o tema. -->
		<!-- Empilha abaixo de `sm`, e com menos padding: mesmo encolhidos, os seis retratos
		     ocupam quase toda a largura de um celular e não sobra coluna para o texto ao lado.
		     Era essa fileira que deixava a home rolando de lado. -->
		<div
			class="flex flex-col items-start gap-5 rounded-xl bg-secondary/5 px-5 py-5 sm:flex-row sm:items-center sm:gap-6 sm:px-7 sm:py-6"
		>
			<!-- Sobreposição de 10px em retratos de 80px, ou 12,5% do diâmetro. A sobreposição
			     forte de pilha de avatares ("+32 usuários") esconde parte de cada rosto; aqui
			     as pessoas são o conteúdo, então o encaixe só sugere o grupo.

			     No celular os retratos caem para 56px: seis de 80px pedem 430px de linha, e a
			     faixa tem ~300px por dentro. A sobreposição continua os mesmos 10px, então lá
			     ela pesa 18% do diâmetro — o encaixe fica um pouco mais fechado, que é o que
			     mantém a fileira lendo como grupo mesmo miúda. -->
			<div class="flex shrink-0">
				{#each teamAvatars as member, i (member.name)}
					<img
						src={member.photo}
						alt={member.name}
						class="h-14 w-14 shrink-0 rounded-full object-cover ring-[3px] ring-white sm:h-20 sm:w-20"
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
						class="relative z-10 -ml-[10px] flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-full bg-muted leading-none text-primary ring-[3px] ring-white sm:h-20 sm:w-20"
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

<!-- Fechamento: LEME.

     Faixa, e não seção. Não segue o PADRÃO DAS SEÇÕES acima de propósito: as cinco
     seções anteriores apresentam o núcleo (o que acontece, como atua, o que produz,
     quem faz) e esta encerra com uma ação — depois de "Nossa equipe", que é a parte
     humana, a home termina convidando a interagir com o projeto. Uma sexta seção no
     mesmo formato diluiria isso numa lista de seis assuntos equivalentes.

     Por isso também não tem cartão dentro, nem captura do chat, nem explicação de como
     a IA funciona: é uma chamada de ~290px de altura, não uma apresentação do produto.
     Quem quiser saber mais clica.

     Sangra de borda a borda em vez de virar um bloco arredondado dentro do container: é
     o que a faz ler como fecho da página. Fundo branco, igual ao das seções: o corte para
     o azul-marinho do footer logo abaixo é o próprio fim da página. -->
<section class="relative z-10 bg-background py-16">
	<div
		class="mx-auto flex max-w-6xl flex-col gap-8 px-6 sm:flex-row sm:items-center sm:justify-between sm:gap-12"
	>
		<!-- `max-w-2xl`, e não `xl`: o título e o parágrafo ficaram mais longos, e numa coluna
		     estreita passavam a ocupar cinco linhas — a faixa deixava de ser faixa. Ainda sobra
		     largura para o botão na mesma linha. -->
		<div class="max-w-2xl">
			<div class="flex items-center gap-2">
				<MessageCircle class="h-4 w-4 text-secondary" aria-hidden="true" />
				<p class="text-sm font-semibold tracking-widest text-secondary uppercase">
					{m.home_assistant_eyebrow()}
				</p>
			</div>
			<h2 class="mt-2 text-[1.75rem] font-bold tracking-tight text-primary sm:text-[2rem]">
				{m.home_assistant_heading()}
			</h2>
			<p class="mt-2 text-lg leading-normal text-muted-foreground">
				{m.home_assistant_text()}
			</p>
		</div>

		<!-- Pílula cheia, como o CTA primário do hero: é a única ação da faixa, então não
		     precisa dividir atenção com um secundário. -->
		<a
			href={localizeHref(resolve('/assistant'))}
			class="inline-flex shrink-0 items-center gap-2 self-start rounded-full bg-primary px-8 py-4 text-base font-semibold text-white transition-transform duration-200 hover:-translate-y-[3px] sm:self-auto"
		>
			{m.home_assistant_cta()}
			<span aria-hidden="true">&rarr;</span>
		</a>
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
