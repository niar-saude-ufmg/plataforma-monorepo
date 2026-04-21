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

	let { children } = $props();

	const navLinks = [
		{ href: '/' as const, label: 'Home' },
		{ href: '/about' as const, label: 'Sobre' },
		{ href: '/publications' as const, label: 'Publicações' },
		{ href: '/team' as const, label: 'Equipe' }
	];
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
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
				{#each navLinks as link (link.href)}
					<a
						href={resolve(link.href)}
						class="text-base font-bold text-primary/80 transition-colors hover:text-primary"
						class:text-primary={page.url.pathname === link.href}
					>
						{link.label}
					</a>
				{/each}
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
			<div class="flex flex-col items-center justify-between gap-4 sm:flex-row">
				<div class="flex flex-wrap items-center gap-x-6 gap-y-4">
					<img src={footerLogo} alt="NIAR" class="h-8" />
					<span class="text-border">|</span>
					<img src={ufmgLogo} alt="UFMG" class="max-h-6 object-contain" />
					<img src={susLogo} alt="SUS 35 Anos" class="max-h-6 object-contain" />
					<img src={ministerioLogo} alt="Ministério da Saúde" class="max-h-6 object-contain" />
					<img src={governoLogo} alt="Governo do Brasil" class="max-h-6 object-contain" />
				</div>
				<p class="text-sm text-muted-foreground">
					&copy; {new Date().getFullYear()} NIAR. Todos os direitos reservados.
				</p>
			</div>
		</div>
	</footer>
</div>
