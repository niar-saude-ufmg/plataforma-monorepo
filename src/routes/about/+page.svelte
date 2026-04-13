<script lang="ts">
</script>

<svelte:head>
	<title>Sobre - NIAR</title>
	<meta name="description" content="Conheça a NIAR e nossa missão" />
</svelte:head>

<!-- Header da página -->
<section class="bg-primary text-primary-foreground">
	<div class="mx-auto max-w-6xl px-6 py-16 text-center">
		<h1 class="text-4xl font-bold tracking-tight sm:text-5xl">Sobre Nós</h1>
		<p class="mx-auto mt-4 max-w-2xl text-lg text-primary-foreground/80">
			Conheça nosso projeto.
		</p>
	</div>
</section>

<!-- Quem somos -->
<section class="py-20">
	<div class="mx-auto max-w-6xl px-6">
		<div class="mx-auto mb-12 max-w-3xl text-center">
			<p class="text-sm font-semibold uppercase tracking-widest text-secondary">Sobre o núcleo</p>
			<h2 class="mt-2 text-3xl font-bold tracking-tight text-primary sm:text-4xl">
				Quem somos
			</h2>
		</div>
		<div class="mx-auto max-w-4xl space-y-4 text-center text-lg leading-relaxed text-muted-foreground">
			<p>
				Conheça nosso projeto. Conheça nosso projeto. Conheça nosso projeto.
				Conheça nosso projeto. Conheça nosso projeto. Conheça nosso projeto.
				Conheça nosso projeto. Conheça nosso projeto. Conheça nosso projeto.
			</p>
			<p>
				Conheça nosso projeto. Conheça nosso projeto. Conheça nosso projeto.
				Conheça nosso projeto. Conheça nosso projeto. Conheça nosso projeto.
				Conheça nosso projeto. Conheça nosso projeto. Conheça nosso projeto.
			</p>
		</div>
	</div>
</section>

<!-- Linhas de Pesquisa -->
<section class="bg-muted py-16">
	<div class="mx-auto max-w-6xl px-6">
		<p class="text-sm font-semibold uppercase tracking-widest text-secondary">Linhas de Pesquisa</p>
		<h2 class="mt-2 text-3xl font-bold tracking-tight text-primary sm:text-4xl">
			Projetos Pilotos
		</h2>

		<div class="mt-12 grid gap-8 sm:grid-cols-2">
			{#each [
				{
					num: '01',
					title: 'Diagnóstico Assistido por IA',
					description: 'Desenvolvimento de algoritmos de visão computacional e processamento de linguagem natural para apoio diagnóstico em exames de imagem e laudos clínicos.'
				},
				{
					num: '02',
					title: 'Predição de Desfechos Clínicos',
					description: 'Modelos preditivos para antecipação de eventos adversos, readmissões hospitalares e evolução de doenças crônicas.'
				},
				{
					num: '03',
					title: 'Equidade Algorítmica em Saúde',
					description: 'Investigação de vieses em datasets e modelos de IA, com foco em garantir acesso justo e resultados equitativos para populações diversas.'
				},
				{
					num: '04',
					title: 'Governança e Regulação de IA',
					description: 'Pesquisa em frameworks regulatórios, explicabilidade de modelos e políticas públicas para uso seguro de IA no sistema de saúde.'
				}
			] as item (item.num)}
				<div class="relative overflow-hidden rounded-2xl bg-white p-8 ring-1 ring-border">
					<span class="absolute right-6 top-6 text-6xl font-bold text-muted/80">{item.num}</span>
					<h3 class="text-xl font-bold text-primary">{item.title}</h3>
					<p class="mt-4 leading-relaxed text-muted-foreground">{item.description}</p>
					<a href="#" class="mt-6 inline-flex items-center gap-1 text-sm font-medium text-secondary hover:underline">
						Saiba mais <span aria-hidden="true">&rarr;</span>
					</a>
				</div>
			{/each}
		</div>
	</div>
</section>

