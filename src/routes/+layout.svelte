<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import logo from '$lib/assets/header/logo-transparent.png';
	import footerLogo from '$lib/assets/footer/logo-transparent.png';
	// Selos institucionais nas versões oficiais coloridas. As versões branqueadas por
	// script ficaram em sponsors/branco/ e não são usadas: no selo do Governo Federal o
	// "BRASIL" é feito de blocos coloridos encostados e virava mancha ilegível, e fabricar
	// negativo por filtro não é permitido pelo manual da marca federal.
	import ufmgLogo from '$lib/assets/footer/sponsors/ufmg.png';
	import susLogo from '$lib/assets/footer/sponsors/sus.png';
	import ministerioLogo from '$lib/assets/footer/sponsors/ministerio-saude.png';
	import governoLogo from '$lib/assets/footer/sponsors/governo-brasil.png';
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import { Separator } from '$lib/components/ui/separator';
	import { m } from '$lib/paraglide/messages';
	import { SITE_URL, SITE_NAME, ensureSlash } from '$lib/seo';
	import {
		locales,
		localizeHref,
		deLocalizeHref,
		getLocale,
		baseLocale
	} from '$lib/paraglide/runtime';

	let { children } = $props();

	// Header estilo Amazon: some ao rolar para baixo (como se fosse fixo saindo da
	// tela) e reaparece assim que o usuário rola para cima.
	let lastScrollY = $state(0);
	let headerHidden = $state(false);

	function handleScroll() {
		const currentY = window.scrollY;
		if (currentY <= 0) {
			// No topo da página o header sempre fica visível.
			headerHidden = false;
		} else if (currentY > lastScrollY && currentY > 80) {
			// Rolando para baixo (e já passou do próprio header): esconde.
			headerHidden = true;
		} else if (currentY < lastScrollY) {
			// Rolando para cima: mostra novamente.
			headerHidden = false;
		}
		lastScrollY = currentY;
	}

	const navLinks = [
		{ href: '/' as const, label: () => m.nav_home() },
		{ href: '/about' as const, label: () => m.nav_about() },
		{ href: '/news' as const, label: () => m.nav_news() },
		{ href: '/publications' as const, label: () => m.nav_publications() },
		{ href: '/team' as const, label: () => m.nav_team() },
		{ href: '/assistant' as const, label: () => m.nav_assistant() },
		{ href: '/contact' as const, label: () => m.nav_contact() }
	];

	// O footer repete o menu menos a Home — quem quer voltar ao início clica na logo,
	// que já está logo acima da lista. A ordem de navLinks já cai certa na grade de três
	// colunas: Sobre/Notícias/Publicações na primeira linha, Equipe/LEME/Contato
	// na segunda.
	const footerLinks = navLinks.slice(1);

	const currentYear = new Date().getFullYear();

	// Rótulo das seções do footer. São rótulos, não títulos: pequenos, com pouco tracking
	// e em contraste baixo, para não competirem com a marca. O /50 é o piso — abaixo disso
	// o texto de 10px não alcança os 4.5:1 da WCAG sobre o azul. Quem carrega o destaque
	// é o conteúdo (/90); a distância entre os dois é o que evita que rótulo e conteúdo
	// se confundam.
	const footerEyebrow =
		'text-[0.625rem] font-semibold tracking-wide text-primary-foreground/50 uppercase';

	const localeLabels: Record<string, string> = { pt: 'PT', en: 'EN' };

	// Dados estruturados: é o que diz ao Google qual é o nome oficial do site e a quem
	// ele pertence, em vez de deixar o buscador deduzir do HTML. `{@html}` é necessário
	// porque o Svelte não deixa declarar <script> solto no markup.
	const structuredData = {
		'@context': 'https://schema.org',
		'@type': 'Organization',
		name: SITE_NAME,
		alternateName: 'Núcleo de Inteligência Artificial Responsável para a Saúde',
		url: SITE_URL,
		logo: `${SITE_URL}${logo}`,
		description:
			'Núcleo da UFMG que une computação, medicina e bioética para promover o uso responsável da inteligência artificial na saúde.',
		parentOrganization: {
			'@type': 'CollegeOrUniversity',
			name: 'Universidade Federal de Minas Gerais',
			url: 'https://ufmg.br'
		}
	};

	// `<` escapado para que nenhum valor consiga fechar a tag <script> antes da hora.
	const structuredDataJson = JSON.stringify(structuredData).replace(/</g, '\\u003c');

	// Path with any locale prefix stripped — used for active-link checks and to
	// build the language-switcher targets for the page the user is currently on.
	let currentPath = $derived(deLocalizeHref(page.url.pathname));

	// Highlights the nav item for the current page. Home only matches exactly (every
	// path starts with '/'); the other items also match their subpages (e.g. an
	// article at /news/<slug> keeps "Notícias" active).
	function isActive(link: { href: string }): boolean {
		if (link.href === '/') return currentPath === '/';
		return currentPath === link.href || currentPath.startsWith(`${link.href}/`);
	}
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<link rel="canonical" href="{SITE_URL}{ensureSlash(page.url.pathname)}" />
	{#each locales as locale (locale)}
		<link
			rel="alternate"
			hreflang={locale}
			href="{SITE_URL}{ensureSlash(localizeHref(currentPath, { locale }))}"
		/>
	{/each}
	<link
		rel="alternate"
		hreflang="x-default"
		href="{SITE_URL}{ensureSlash(localizeHref(currentPath, { locale: baseLocale }))}"
	/>
	{@html `<script type="application/ld+json">${structuredDataJson}</scr` + `ipt>`}
</svelte:head>

<svelte:window onscroll={handleScroll} />

<div class="flex min-h-screen flex-col">
	<header
		class="sticky top-0 z-50 overflow-visible bg-background text-foreground transition-transform duration-300 {headerHidden
			? '-translate-y-full'
			: 'translate-y-0'}"
	>
		<!-- data-nosnippet: sem isso o Google monta o resumo do resultado de busca com o
		     texto do menu, já que é o primeiro conteúdo do HTML. -->
		<div data-nosnippet class="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
			<a href={resolve('/')} class="relative z-10">
				<img src={logo} alt="NIAR" class="h-11" />
			</a>
			<nav class="flex items-center gap-6">
				{#each navLinks as link (link.href)}
					{@const active = isActive(link)}
					<!-- O item ativo é o único em semibold e na cor cheia; os demais ficam em
					     medium e mais claros, para o menu não competir com a logo. O peso não
					     muda no hover — só a cor —, senão o texto mudaria de largura e
					     empurraria os vizinhos a cada passagem do mouse. -->
					<a
						href={localizeHref(resolve(link.href))}
						aria-current={active ? 'page' : undefined}
						class="relative text-base transition-colors after:absolute after:inset-x-0 after:-bottom-1.5 after:h-0.5 after:origin-left after:rounded-full after:bg-gradient-to-r after:from-primary after:to-secondary after:transition-transform after:duration-200 {active
							? 'font-semibold text-primary after:scale-x-100'
							: 'font-medium text-primary/70 after:scale-x-0 hover:text-primary'}"
					>
						{link.label()}
					</a>
				{/each}
				<div class="ml-8 flex items-center gap-2 text-sm font-semibold">
					{#each locales as locale, i (locale)}
						{#if i > 0}<span class="text-primary/30">|</span>{/if}
						<a
							href={localizeHref(currentPath, { locale })}
							data-sveltekit-reload
							aria-current={getLocale() === locale ? 'true' : undefined}
							class="transition-colors hover:text-primary {getLocale() === locale
								? 'text-primary'
								: 'text-primary/40'}"
						>
							{localeLabels[locale]}
						</a>
					{/each}
				</div>
			</nav>
		</div>
		<Separator />
	</header>

	<main class="relative z-10 flex flex-1 flex-col">
		{@render children()}
	</main>

	<!-- Sem Separator no topo: a virada para o azul profundo já separa o footer do
	     conteúdo, e uma régua clara ali só somaria uma linha a mais.

	     A peça é uma só, toda azul: conteúdo → régua → assinaturas institucionais → régua →
	     copyright. O sanduíche azul → branco → azul de antes fazia o footer ler como três
	     footers empilhados.

	     Os quatro selos institucionais são RGB sem canal alfa (fundo branco opaco) e de tinta
	     escura, então ainda precisam de um chip branco cada um. Testado: em versão
	     monocromática branca, UFMG e Ministério sobrevivem, o SUS perde identidade e o
	     "BRASIL" do Governo Federal vira mancha ilegível, porque as letras são blocos
	     coloridos encostados — e fabricar versão negativa por filtro não é permitido pelo
	     manual da marca federal. Com os arquivos negativos oficiais em mãos, basta remover o
	     `bg-white` dos chips. -->
	<footer class="relative z-10 bg-primary text-primary-foreground">
		<!-- `pb-6` em vez de `pb-10`: somado ao `pt-4` das parcerias, o intervalo entre as duas
		     regiões caiu de 60px para 40px. Continua sendo 2,5× o `mt-4` que separa cada rótulo
		     do próprio conteúdo, que é o que mantém a leitura de "duas regiões" — só sem o vão
		     que fazia a faixa de marcas parecer solta do resto. -->
		<div class="mx-auto max-w-6xl px-6 pt-10 pb-6">
			<!-- 45 / 30 / 25: a identidade é a maior porque carrega a descrição, e o contato a
			     menor porque são duas linhas. As três colunas alinham o texto à esquerda, cada
			     uma no próprio eixo — são essas três verticais que o resto do footer repete,
			     inclusive o bloco de marcas lá embaixo. -->
			<div class="grid gap-10 md:grid-cols-[45fr_30fr_25fr]">
				<!-- Marca do site. Fica na própria coluna, separada das logos das instituições
				     lá embaixo: uma é a identidade do projeto, as outras são vínculo/apoio, e
				     misturá-las numa fileira só apaga essa diferença.

				     `brightness-0 invert` achata o PNG em branco puro — o arquivo é o mesmo do
				     header, com o degradê azul-profundo → ciano, e sobre o azul do footer a
				     metade escura desapareceria. Não é gambiarra: o resultado é idêntico à
				     versão negativa oficial da marca, documentada em assets/logos-vers.png
				     (assinatura e subtítulo em branco chapado). Partir daqui dá 3419px de
				     largura, contra os ~750px da marca dentro daquela folha de versões. -->
				<div>
					<img src={footerLogo} alt={SITE_NAME} class="h-9 brightness-0 invert" />
					<!-- 16px, e não os 18px de antes: no footer o resto do texto vive entre 10px
					     (rótulos) e 14px (links), e a descrição em `text-lg` puxava atenção demais
					     para uma linha que é contexto, não chamada. Em 16px ela continua sendo o
					     maior texto do bloco — mantém a hierarquia — sem competir com a marca. -->
					<p class="mt-4 max-w-sm leading-relaxed text-primary-foreground/90">
						{m.footer_tagline()}
					</p>
				</div>

				<div>
					<!-- Sem caixa de altura: o rótulo começa no topo da coluna, na mesma linha em
					     que a logo começa na coluna ao lado. Antes ele vinha dentro de um `h-9`
					     igual à altura da logo, o que alinhava o *conteúdo* das três colunas mas
					     empurrava os rótulos para baixo e somava ~21px de altura morta — e era a
					     coluna da navegação, a mais alta das três, que ditava a altura do footer.
					     O preço é a descrição da marca não começar mais na mesma linha dos links;
					     em troca, os quatro blocos usam o mesmo `rótulo → mt-4 → conteúdo`. -->
					<p id="footer-nav-label" class={footerEyebrow}>
						{m.footer_nav_label()}
					</p>
					<!-- `w-fit`: as duas colunas encolhem para a largura da palavra mais longa de
					     cada uma. Sem isso a grade reparte a coluna em metades iguais e os links
					     ficam soltos, longe do próprio rótulo. -->
					<nav
						aria-labelledby="footer-nav-label"
						class="mt-4 grid w-fit grid-cols-2 gap-x-8 gap-y-2 text-sm"
					>
						{#each footerLinks as link (link.href)}
							<a
								href={localizeHref(resolve(link.href))}
								class="font-medium text-primary-foreground/90 transition-colors hover:text-primary-foreground hover:underline"
							>
								{link.label()}
							</a>
						{/each}
					</nav>
				</div>

				<!-- Alinhada à esquerda como as outras duas. Encostada à direita, ela era a única
				     coluna do footer com o texto em outra direção: o olho vinha lendo três
				     rótulos na mesma altura e o terceiro fugia para o canto. Quem segura a
				     margem direita agora é a fileira de marcas e o `PT | EN`. -->
				<div>
					<p class={footerEyebrow}>{m.footer_info_label()}</p>
					<div class="mt-4 space-y-1.5 text-sm text-primary-foreground/90">
						<a
							href="mailto:niar@dcc.ufmg.br"
							class="block transition-colors hover:text-primary-foreground"
						>
							niar@dcc.ufmg.br
						</a>
						<p>{m.footer_address()}</p>
					</div>
				</div>
			</div>
		</div>

		<!-- Assinaturas institucionais dentro do mesmo bloco azul: é o que faz o footer ser uma
		     peça só em vez de azul → branco → azul. Sem régua acima — o espaço entre elas e as
		     colunas já separa as duas regiões, e a única que sobra passa a marcar só o fecho.

		     Rótulo e marcas empilhados, e não lado a lado: antes o rótulo ficava colado na
		     borda esquerda e as marcas eram jogadas para a direita por um `ml-auto`, com um
		     vão enorme no meio. Lidos assim, viravam duas coisas sem relação — o olho procura
		     as marcas logo abaixo do rótulo e não acha.

		     Mesma grade das colunas acima (`45fr_30fr_25fr` com `gap-10`), com o bloco
		     começando na segunda coluna: o rótulo cai exatamente no eixo de "Navegação", e as
		     marcas no mesmo eixo dos links. É a mesma linha vertical invisível já usada pelo
		     resto do footer, agora também embaixo. -->
		<!-- `pb-8`: as assinaturas precisam de mais ar antes da régua do copyright do que
		     tinham (20px), senão a faixa branca encosta no fecho e as duas viram uma coisa só.
		     O `pt-4` continua sendo o mesmo intervalo rótulo → conteúdo dos outros blocos. -->
		<div class="mx-auto max-w-6xl px-6 pt-4 pb-8">
			<div class="grid gap-10 md:grid-cols-[45fr_30fr_25fr]">
				<div class="md:col-span-2 md:col-start-2">
					<p class={footerEyebrow}>{m.footer_partners()}</p>
					<!-- Uma régua branca única, e não quatro placas: as instituições são um conjunto
					     vinculado ao projeto, e uma placa por marca as apresentava como quatro
					     conteúdos independentes. Sem divisórias verticais pelo mesmo motivo. O
					     branco é obrigatório, não escolha: os quatro arquivos são RGB sem canal
					     alfa e com fundo branco chapado, então qualquer outro tom deixaria
					     aparecer o retângulo do arquivo por dentro da régua.

					     Baixa de propósito — 10px de respiro sobre a marca mais alta — e com raio
					     de 10px, o mesmo `--radius` do resto do site: arredondada demais, a régua
					     viraria uma pílula e chamaria mais atenção que as marcas que carrega.

					     O conjunto está ~20% menor que a primeira versão da régua. As marcas são
					     assinatura institucional: precisam ser legíveis, não protagonistas. A
					     ordem de leitura pretendida no footer é marca → navegação/informações →
					     assinaturas, e com as marcas grandes a mancha branca invertia isso.
					     Parei em 20% (e não nos 30%) porque o Ministério tem duas linhas de texto
					     e o Governo três: abaixo disso as linhas de apoio deixam de ser legíveis,
					     que é o piso que a redução não pode cruzar.

					     As alturas são ópticas, não matemáticas: cada arquivo tem uma proporção e
					     uma densidade diferentes, então igualar a altura em CSS faz a UFMG (letras
					     largas, uma linha) pesar muito mais que o Ministério (duas linhas de texto
					     miúdo) e o Governo (três). Os valores abaixo buscam o mesmo peso visual, e
					     é normal precisarem de um ajuste fino na tela.

					     `md:justify-between` distribui as quatro no vão inteiro da régua; o
					     `gap-x-8` é só o piso para quando a linha apertar e elas quebrarem. -->
					<div
						class="mt-4 flex flex-wrap items-center justify-center gap-x-8 gap-y-4 rounded-lg bg-white px-8 py-2.5 md:justify-between"
					>
						{#each [{ src: ufmgLogo, alt: 'UFMG', h: 'max-h-4' }, { src: susLogo, alt: 'SUS 35 Anos', h: 'max-h-6' }, { src: ministerioLogo, alt: 'Ministério da Saúde', h: 'max-h-5' }, { src: governoLogo, alt: 'Governo do Brasil', h: 'max-h-6' }] as seal (seal.alt)}
							<img src={seal.src} alt={seal.alt} class="{seal.h} object-contain" />
						{/each}
					</div>
				</div>
			</div>
		</div>

		<!-- Régua fora do container: atravessa a tela de borda a borda, enquanto o conteúdo de
		     cada região continua alinhado ao mesmo `max-w-6xl px-6` do resto do site. -->
		<div class="h-px bg-primary-foreground/15"></div>

		<!-- Copyright fecha o mesmo bloco azul. Discreto de propósito — o seletor de idioma
		     precisa estar aqui (o header não é fixo, e quem chegou ao fim não deve ter que
		     voltar ao topo), mas não precisa chamar atenção. -->
		<div
			class="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-6 py-5 text-xs text-primary-foreground/60 sm:flex-row"
		>
			<p>© {currentYear} {SITE_NAME}</p>
			<div class="flex items-center gap-2 font-medium">
				{#each locales as locale, i (locale)}
					{#if i > 0}<span class="text-primary-foreground/25">|</span>{/if}
					<a
						href={localizeHref(currentPath, { locale })}
						data-sveltekit-reload
						aria-current={getLocale() === locale ? 'true' : undefined}
						class="transition-colors hover:text-primary-foreground {getLocale() === locale
							? 'text-primary-foreground/90'
							: 'text-primary-foreground/50'}"
					>
						{localeLabels[locale]}
					</a>
				{/each}
			</div>
		</div>
	</footer>
</div>
