<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import logo from '$lib/assets/logo-transparent.png';
	import financiadores from '$lib/assets/financiadores.jpeg';
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import { Separator } from '$lib/components/ui/separator';

	let { children } = $props();

	const navLinks = [
		{ href: '/' as const, label: 'Home' },
		{ href: '/about' as const, label: 'Sobre' },
		{ href: '/team' as const, label: 'Equipe' }
	];
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<div class="flex min-h-screen flex-col">
	<header class="sticky top-0 z-50 bg-background/80 backdrop-blur-sm text-foreground overflow-visible">
		<div class="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
			<a href={resolve('/')} class="relative z-10">
				<img src={logo} alt="NIAR" class="h-36 -my-13" />
			</a>
			<nav class="flex items-center gap-6">
				{#each navLinks as link (link.href)}
					<a
						href={resolve(link.href)}
						class="text-sm font-bold text-foreground/80 transition-colors hover:text-foreground"
						class:text-foreground={page.url.pathname === link.href}
					>
						{link.label}
					</a>
				{/each}
			</nav>
		</div>
		<Separator />
	</header>

	<main class="flex-1">
		{@render children()}
	</main>

	<footer class="bg-white text-foreground">
		<Separator />
		<div class="mx-auto max-w-6xl px-6 py-8">
			<div class="flex flex-col items-center justify-between gap-4 sm:flex-row">
				<div class="flex items-center gap-4">
					<img src={logo} alt="NIAR" class="h-34 -my-13" />
					<span class="text-border">|</span>
					<img src={financiadores} alt="Financiadores" class="max-h-12 object-contain" />
				</div>
				<p class="text-sm text-muted-foreground">
					&copy; {new Date().getFullYear()} NIAR. Todos os direitos reservados.
				</p>
			</div>
		</div>
	</footer>
</div>
