<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import logo from '$lib/assets/header/logo-transparent.png';
	import footerLogo from '$lib/assets/footer/logo-transparent.png';
	import ufmgLogo from '$lib/assets/footer/sponsors/ufmg.png';
	import susLogo from '$lib/assets/footer/sponsors/sus.png';
	import ministerioLogo from '$lib/assets/footer/sponsors/ministerio-saude.png';
	import governoLogo from '$lib/assets/footer/sponsors/governo-brasil.png';
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import { Separator } from '$lib/components/ui/separator';
	import { m } from '$lib/paraglide/messages';
	import { locales, localizeHref, deLocalizeHref, getLocale, baseLocale } from '$lib/paraglide/runtime';

	let { children } = $props();

	const navLinks = [
		{ href: '/' as const, hash: '', label: () => m.nav_home() },
		{ href: '/about' as const, hash: '', label: () => m.nav_about() },
		{ href: '/publications' as const, hash: '', label: () => m.nav_publications() },
		{ href: '/team' as const, hash: '', label: () => m.nav_team() },
		{ href: '/' as const, hash: '#contato', label: () => m.nav_contact() }
	];

	const localeLabels: Record<string, string> = { pt: 'PT', en: 'EN' };

	// Production origin — used to build absolute canonical/hreflang URLs, which
	// Google requires to be fully qualified. Update here if the domain changes.
	const SITE_URL = 'https://www.niar.dcc.ufmg.br';

	// trailingSlash is 'always', so every canonical/hreflang URL must end with a slash.
	const ensureSlash = (path: string) => (path.endsWith('/') ? path : `${path}/`);

	// Path with any locale prefix stripped — used for active-link checks and to
	// build the language-switcher targets for the page the user is currently on.
	let currentPath = $derived(deLocalizeHref(page.url.pathname));
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
</svelte:head>

<div class="flex min-h-screen flex-col">
	<header
		class="sticky top-0 z-50 overflow-visible bg-background/80 text-foreground backdrop-blur-sm"
	>
		<div class="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
			<a href={resolve('/')} class="relative z-10">
				<img src={logo} alt="NIAR" class="h-10" />
			</a>
			<nav class="flex items-center gap-6">
				{#each navLinks as link (link.href + link.hash)}
					<a
						href="{localizeHref(resolve(link.href))}{link.hash}"
						class="text-base font-semibold text-primary/80 transition-colors hover:text-primary"
						class:text-primary={currentPath === link.href &&
							(link.hash ? page.url.hash === link.hash : !page.url.hash)}
					>
						{link.label()}
					</a>
				{/each}
				<div class="ml-8 flex items-center gap-2 text-sm font-semibold">
					{#each locales as locale, i (locale)}
						{#if i > 0}<span class="text-border">|</span>{/if}
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

	<footer class="relative z-10 bg-white text-foreground">
		<Separator />
		<div class="mx-auto max-w-6xl px-6 py-7">
			<div
				class="flex flex-col items-center justify-between gap-6 sm:flex-row sm:items-start"
			>
				<div class="flex flex-wrap items-center justify-center gap-x-6 gap-y-4 sm:justify-start">
					<img src={footerLogo} alt="NIAR" class="h-8" />
					<span class="text-border">|</span>
					<img src={ufmgLogo} alt="UFMG" class="max-h-6 object-contain" />
					<img src={susLogo} alt="SUS 35 Anos" class="max-h-6 object-contain" />
					<img src={ministerioLogo} alt="Ministério da Saúde" class="max-h-6 object-contain" />
					<img src={governoLogo} alt="Governo do Brasil" class="max-h-6 object-contain" />
				</div>
				<div class="flex flex-col items-center gap-1 text-sm sm:items-end sm:text-right">
					<a
						href="mailto:niar@dcc.ufmg.br"
						class="font-medium text-secondary hover:underline"
					>
						niar@dcc.ufmg.br
					</a>
					<a
						href="https://www.google.com/maps/place/Universidade+Federal+de+Minas+Gerais/@-19.8669704,-43.9620077,17z/data=!3m1!4b1!4m6!3m5!1s0xa690ee806be67d:0xbb1391cea62811dd!8m2!3d-19.8669704!4d-43.9620077!16zL20vMDIxejJr"
						target="_blank"
						rel="noopener noreferrer"
						class="text-muted-foreground hover:underline"
					>
						{m.footer_address()}
					</a>
				</div>
			</div>
		</div>
	</footer>
</div>
