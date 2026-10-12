<script lang="ts">
	import ArrowRight from 'lucide-svelte/icons/arrow-right';
	import { pageTitle } from '$lib/seo';
	import { platformHref } from '$lib/platform';
	import { resolve } from '$app/paths';
	import { m } from '$lib/paraglide/messages';
	import { localizeHref } from '$lib/paraglide/runtime';

	// As três garantias do ambiente, na ordem de dentro para fora: o acesso é
	// controlado, o uso é monitorado e tudo fica auditável.
	const traits = [
		m.secure_room_layer_controlled,
		m.secure_room_layer_monitored,
		m.secure_room_layer_audited
	];

	// Os quatro passos do fluxo têm a mesma estrutura, então viram dados em vez de
	// markup repetido — mesmo padrão dos pilares da home.
	const steps = [
		{ title: m.secure_room_step_signup_title, desc: m.secure_room_step_signup_desc },
		{ title: m.secure_room_step_project_title, desc: m.secure_room_step_project_desc },
		{ title: m.secure_room_step_review_title, desc: m.secure_room_step_review_desc },
		{ title: m.secure_room_step_status_title, desc: m.secure_room_step_status_desc }
	];
</script>

<svelte:head>
	<title>{pageTitle(m.secure_room_title())}</title>
	<meta name="description" content={m.secure_room_meta_desc()} />
</svelte:head>

<!-- Página inteira em azul: é a única do site que é porta de entrada para um sistema, e
     não conteúdo. As duas seções se separam só pelo tom — o topo no azul-profundo da
     marca, as etapas num azul mais fechado —, sem régua nem fundo claro no meio. -->
<section class="bg-primary text-primary-foreground">
	<div class="mx-auto max-w-6xl px-6 pt-14 pb-20">
		<a
			href={localizeHref(resolve('/'))}
			class="inline-flex items-center gap-1 text-sm font-medium text-secondary hover:underline"
		>
			<span aria-hidden="true">&larr;</span>
			{m.back_home()}
		</a>

		<!-- Texto à esquerda e acesso à direita, alinhados pelo topo: quem chega para entrar
		     acha os botões na primeira dobra, sem precisar ler a apresentação. Abaixo de `lg`
		     o cartão desce para depois do texto. -->
		<div class="mt-12 grid gap-12 lg:grid-cols-[1fr_28rem] lg:gap-16">
			<div>
				<h1 class="text-5xl font-extrabold tracking-tight sm:text-7xl">
					{m.secure_room_title()}
				</h1>
				<p class="mt-6 max-w-xl text-xl leading-relaxed text-primary-foreground/80">
					{m.secure_room_subtitle()}
				</p>
				<ul class="mt-8 flex flex-wrap gap-2.5">
					{#each traits as trait (trait)}
						<li class="rounded-full bg-primary-foreground/10 px-4 py-2 text-sm font-semibold">
							{trait()}
						</li>
					{/each}
				</ul>
			</div>

			<!-- Cartão de acesso. O assistente vem primeiro e cheio porque é a ação de quem
			     volta, a mais frequente; o cadastro fica em contorno, com a dica de primeiro
			     acesso logo embaixo.

			     Os dois levam para fora do site: o formulário é do admin-web e o assistente
			     exige login, ambos servidos pela shell. Por isso `rel="external"`: em produção
			     os links são relativos (mesma origem), e sem ele o prerender tentaria gerar
			     /cadastro/pesquisador e /assistente como páginas do site — o build quebra com
			     404. Ele também faz o roteador do SvelteKit trocar a página inteira em vez de
			     tentar uma navegação interna. -->
			<div class="secure-card self-start rounded-2xl p-7">
				<h2 class="text-sm font-medium text-secondary">{m.secure_room_access_panel()}</h2>
				<div class="mt-4 grid gap-3">
					<!-- eslint-disable svelte/no-navigation-without-resolve -->
					<a
						href={platformHref('/assistente')}
						rel="external"
						class="flex items-center justify-between gap-4 rounded-xl bg-white px-6 py-4 text-base font-bold text-primary transition-transform duration-200 hover:-translate-y-0.5"
					>
						{m.secure_room_access_cta()}
						<ArrowRight class="h-4 w-4 shrink-0" aria-hidden="true" />
					</a>
					<a
						href={platformHref('/cadastro/pesquisador')}
						rel="external"
						class="flex items-center justify-between gap-4 rounded-xl px-6 py-4 text-base font-bold ring-1 ring-primary-foreground/30 transition-colors hover:bg-primary-foreground/5"
					>
						{m.secure_room_signup_cta()}
						<ArrowRight class="h-4 w-4 shrink-0" aria-hidden="true" />
					</a>
					<!-- eslint-enable svelte/no-navigation-without-resolve -->
				</div>
				<p class="mt-5 text-sm leading-relaxed text-primary-foreground/60">
					{m.secure_room_signup_hint()}
				</p>
			</div>
		</div>
	</div>
</section>

<section class="secure-steps flex-1 pt-20 pb-24 text-primary-foreground">
	<div class="mx-auto max-w-6xl px-6">
		<!-- Título e resumo na mesma linha, alinhados pela base: o resumo é uma nota, não
		     subtítulo, então vai para a ponta direita em vez de empilhar sob o h2. -->
		<div class="mb-12 flex flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between">
			<h2 class="text-3xl font-extrabold tracking-tight sm:text-[2.5rem]">
				{m.secure_room_steps_heading()}
			</h2>
			<p class="text-base text-primary-foreground/70">{m.secure_room_steps_text()}</p>
		</div>

		<!-- Uma faixa só, dividida em quatro: os vãos de 2px deixam aparecer o fundo da seção
		     e fazem as vezes de filete, e o `overflow-hidden` arredonda só os cantos de fora.
		     É uma lista ordenada de verdade (<ol>), porque a ordem é a informação; o número
		     grande é decorativo e fica fora da leitura de tela. -->
		<ol class="grid gap-0.5 overflow-hidden rounded-2xl sm:grid-cols-2 lg:grid-cols-4">
			{#each steps as step, i (step.title)}
				<li class="secure-card p-7">
					<span
						class="block text-5xl leading-none font-extrabold tracking-tight text-secondary"
						aria-hidden="true"
					>
						{String(i + 1).padStart(2, '0')}
					</span>
					<h3 class="mt-7 text-lg leading-snug font-bold">{step.title()}</h3>
					<p class="mt-3 text-[0.9375rem] leading-relaxed text-primary-foreground/70">
						{step.desc()}
					</p>
				</li>
			{/each}
		</ol>
	</div>
</section>

<style>
	/* Tons derivados da paleta em vez de hex avulsos, para acompanharem a marca:
	   - as etapas num azul-profundo mais fechado, que separa as seções sem régua;
	   - cartões num azul-profundo levemente puxado para o ciano, que os destaca do fundo
	     sem virar outra cor. `color-mix` porque as variáveis da paleta são hex. */
	.secure-steps {
		background-color: color-mix(in srgb, var(--azul-profundo) 80%, black);
	}

	.secure-card {
		background-color: color-mix(in srgb, var(--azul-profundo) 88%, var(--azul-ciano));
	}
</style>
