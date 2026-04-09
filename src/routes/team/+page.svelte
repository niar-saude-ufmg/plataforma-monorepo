<script lang="ts">
	import ChevronDown from 'lucide-svelte/icons/chevron-down';
</script>

<svelte:head>
	<title>Equipe - NIAR</title>
	<meta name="description" content="Conheça a equipe do NIAR-Saúde" />
</svelte:head>

<section class="py-16">
	<div class="mx-auto max-w-6xl px-6">
		<a href="/" class="inline-flex items-center gap-1 text-sm font-medium text-secondary hover:underline">
			<span aria-hidden="true">&larr;</span> Voltar à página inicial
		</a>

		<h1 class="mt-6 text-4xl font-bold tracking-tight text-primary sm:text-5xl">
			Nossa Equipe
		</h1>
		<p class="mt-4 max-w-2xl text-lg leading-relaxed text-muted-foreground">
			Conheça todos os pesquisadores, estudantes e colaboradores que fazem parte do NIAR-Saúde.
		</p>

		<!-- Coordenação -->
		<details class="group mt-16" open>
			<summary class="flex cursor-pointer list-none items-center gap-2">
				<h2 class="text-2xl font-bold text-primary">Coordenação</h2>
				<ChevronDown class="h-5 w-5 text-primary transition-transform group-open:rotate-180" />
			</summary>
			<div class="mt-6 grid gap-6 sm:grid-cols-2">
				{#each [
					{ initials: 'ZQ', name: 'Dra. Zoraide Queiroga', info: 'Coordenadora Geral · IA & Saúde Pública' },
					{ initials: 'TF', name: 'Dr. Tancredo Figueira', info: 'Vice-Coordenador · Aprendizado de Máquina' }
				] as member (member.initials)}
					<div class="flex items-center gap-5 rounded-2xl bg-white p-6 ring-1 ring-border">
						<div class="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary text-sm font-bold text-white">
							{member.initials}
						</div>
						<div>
							<p class="font-bold text-primary">{member.name}</p>
							<p class="text-sm text-muted-foreground">{member.info}</p>
						</div>
					</div>
				{/each}
			</div>
		</details>

		<!-- Pesquisadores -->
		<details class="group mt-16" open>
			<summary class="flex cursor-pointer list-none items-center gap-2">
				<h2 class="text-2xl font-bold text-primary">Pesquisadores</h2>
				<ChevronDown class="h-5 w-5 text-primary transition-transform group-open:rotate-180" />
			</summary>
			<div class="mt-6 grid gap-6 sm:grid-cols-2">
				{#each [
					{ initials: 'OP', name: 'Dra. Olívia Pitangueira', info: 'Ética em IA' },
					{ initials: 'BX', name: 'Dr. Belchior Xaxá', info: 'Epidemiologia Computacional' },
					{ initials: 'NV', name: 'Dra. Nereida Vasques', info: 'Visão Computacional Médica' },
					{ initials: 'EZ', name: 'Dr. Epaminondas Zimbra', info: 'NLP Clínico' },
					{ initials: 'CT', name: 'Dra. Camila Torres', info: 'Bioinformática' },
					{ initials: 'DE', name: 'Dr. Daniel Esteves', info: 'Sistemas de Apoio à Decisão' }
				] as member (member.initials)}
					<div class="flex items-center gap-5 rounded-2xl bg-white p-6 ring-1 ring-border">
						<div class="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary text-sm font-bold text-white">
							{member.initials}
						</div>
						<div>
							<p class="font-bold text-primary">{member.name}</p>
							<p class="text-sm text-muted-foreground">{member.info}</p>
						</div>
					</div>
				{/each}
			</div>
		</details>

		<!-- Doutorandos -->
		<details class="group mt-16" open>
			<summary class="flex cursor-pointer list-none items-center gap-2">
				<h2 class="text-2xl font-bold text-primary">Doutorandos</h2>
				<ChevronDown class="h-5 w-5 text-primary transition-transform group-open:rotate-180" />
			</summary>
			<div class="mt-6 grid gap-6 sm:grid-cols-2">
				{#each [
					{ initials: 'JO', name: 'Juliana Oliveira', info: 'Modelos Preditivos em Oncologia' },
					{ initials: 'MA', name: 'Marcos Almeida', info: 'IA para Diagnóstico por Imagem' },
					{ initials: 'FS', name: 'Fernanda Silva', info: 'Equidade Algorítmica em Saúde' },
					{ initials: 'TP', name: 'Thiago Pereira', info: 'Processamento de Dados Clínicos' }
				] as member (member.initials)}
					<div class="flex items-center gap-5 rounded-2xl bg-white p-6 ring-1 ring-border">
						<div class="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary text-sm font-bold text-white">
							{member.initials}
						</div>
						<div>
							<p class="font-bold text-primary">{member.name}</p>
							<p class="text-sm text-muted-foreground">{member.info}</p>
						</div>
					</div>
				{/each}
			</div>
		</details>

		<!-- Mestrandos -->
		<details class="group mt-16" open>
			<summary class="flex cursor-pointer list-none items-center gap-2">
				<h2 class="text-2xl font-bold text-primary">Mestrandos</h2>
				<ChevronDown class="h-5 w-5 text-primary transition-transform group-open:rotate-180" />
			</summary>
			<div class="mt-6 grid gap-6 sm:grid-cols-2">
				{#each [
					{ initials: 'BL', name: 'Beatriz Lima', info: 'Chatbots para Triagem Médica' },
					{ initials: 'RA', name: 'Rodrigo Araújo', info: 'Wearables e Monitoramento Remoto' },
					{ initials: 'IS', name: 'Isabela Santos', info: 'Análise de Sentimento em Prontuários' }
				] as member (member.initials)}
					<div class="flex items-center gap-5 rounded-2xl bg-white p-6 ring-1 ring-border">
						<div class="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary text-sm font-bold text-white">
							{member.initials}
						</div>
						<div>
							<p class="font-bold text-primary">{member.name}</p>
							<p class="text-sm text-muted-foreground">{member.info}</p>
						</div>
					</div>
				{/each}
			</div>
		</details>

		<!-- Colaboradores Externos -->
		<details class="group mt-16" open>
			<summary class="flex cursor-pointer list-none items-center gap-2">
				<h2 class="text-2xl font-bold text-primary">Colaboradores Externos</h2>
				<ChevronDown class="h-5 w-5 text-primary transition-transform group-open:rotate-180" />
			</summary>
			<div class="mt-6 grid gap-6 sm:grid-cols-2">
				{#each [
					{ initials: 'VN', name: 'Dra. Valéria Nascimento', info: 'Hospital Universitário · Cardiologia' },
					{ initials: 'EC', name: 'Dr. Eduardo Campos', info: 'Fiocruz · Vigilância Epidemiológica' }
				] as member (member.initials)}
					<div class="flex items-center gap-5 rounded-2xl bg-white p-6 ring-1 ring-border">
						<div class="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary text-sm font-bold text-white">
							{member.initials}
						</div>
						<div>
							<p class="font-bold text-primary">{member.name}</p>
							<p class="text-sm text-muted-foreground">{member.info}</p>
						</div>
					</div>
				{/each}
			</div>
		</details>
	</div>
</section>
