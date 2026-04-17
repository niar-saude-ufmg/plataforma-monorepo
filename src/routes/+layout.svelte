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
				<img src={logo} alt="NIAR" class="-my-13 h-36" />
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
		<div class="mx-auto max-w-6xl px-6 py-8">
			<div class="flex flex-col items-center justify-between gap-4 sm:flex-row">
				<div class="flex items-center gap-4">
					<img src={logo} alt="NIAR" class="-my-13 h-34" />
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
