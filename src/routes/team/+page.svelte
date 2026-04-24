<script lang="ts">
	import ChevronDown from 'lucide-svelte/icons/chevron-down';
	import wagnerImg from '$lib/assets/staff/wagner-meira.jpg';
	import micheleImg from '$lib/assets/staff/michele.jpeg';
	import dorgivalImg from '$lib/assets/staff/Dorgival-2.jpg';
	import anaPaulaImg from '$lib/assets/staff/ana-paula.jpeg';
	import ramonImg from '$lib/assets/staff/ramon.jpeg';
	import guilhermeImg from '$lib/assets/staff/guilherme.jpg';
	import karolImg from '$lib/assets/staff/karol.png';
	import helenImg from '$lib/assets/staff/helen_pefil2.jpg';
	import italoImg from '$lib/assets/staff/Italo.jpg';
	import isadoraImg from '$lib/assets/staff/isadora.jpeg';
	import adrianoCesarImg from '$lib/assets/staff/adriano-cesar.jpeg'
	import camilaImg from '$lib/assets/staff/camila.jpeg'
	import { resolve } from '$app/paths';

	type Member = {
		initials: string;
		name: string;
		info: string;
		metas: string[];
		group: string;
		photo?: string;
		photoPos?: string;
	};

	const members: Member[] = [
		{
			initials: 'WM',
			name: 'Prof. Wagner Meira Júnior',
			info: 'Coordenador · Ciência da Computação',
			metas: ['3'],
			group: 'Coordenação',
			photo: wagnerImg
		},
		{
			initials: 'CC',
			name: 'Camila dos Reis Cunha',
			info: 'Gerente de Projetos · Administração e Gestão da Inovação',
			metas: ['1', '3', '7'],
			group: 'Coordenação',
			photo: camilaImg
		},
		{
			initials: 'MB',
			name: 'Profa. Michele Brandão',
			info: 'Ciência de Dados e Redes Complexas',
			metas: ['1', '2', '3'],
			group: 'Pesquisadores',
			photo: micheleImg
		},
		{
			initials: 'DG',
			name: 'Prof. Dorgival Guedes Neto',
			info: 'Sistemas Distribuídos',
			metas: ['3'],
			group: 'Pesquisadores',
			photo: dorgivalImg,
			photoPos: '30% 20%'
		},
		{
			initials: 'AP',
			name: 'Profa. Ana Paula Couto Silva',
			info: 'Computação Social',
			metas: ['2'],
			group: 'Pesquisadores',
			photo: anaPaulaImg
		},
		{
			initials: 'AC',
			name: 'Prof. Adriano César Machado Pereira',
			info: 'Pesquisador · Ciência da Computação',
			metas: ['3'],
			group: 'Pesquisadores',
			photo: adrianoCesarImg
		},
		{
			initials: 'MV',
			name: 'Dra. Marisa Vasconcelos',
			info: 'Pesquisadora Sênior · IA Responsável',
			metas: ['1', '2'],
			group: 'Pesquisadores'
		},
		{
			initials: 'HL',
			name: 'Dra. Helen de Cássia Sousa da Costa Lima',
			info: 'Pós-doutoranda · IA Responsável e IA em Saúde',
			metas: ['1'],
			group: 'Pesquisadores',
			photo: helenImg
		},
		{
			initials: 'RG',
			name: 'Ramon Gonçalves Pereira',
			info: 'Doutorando · IA em Saúde',
			metas: ['1', '3', '6'],
			group: 'Doutorandos',
			photo: ramonImg
		},
		{
			initials: 'KA',
			name: 'Karolina Ivete Azevedo',
			info: 'Mestranda · IA Responsável',
			metas: ['1', '2'],
			group: 'Mestrandos',
			photo: karolImg
		},
		{
			initials: 'IA',
			name: 'Italo Rodrigues de Matos Avelar',
			info: 'Graduando em Sistemas de Informação · IA Responsável',
			metas: ['1'],
			group: 'Alunos de Iniciação Científica',
			photo: italoImg
		},
		{
			initials: 'LR',
			name: 'Lucas Martins Rocha',
			info: 'Graduando em Engenharia de Controle e Automação · Sistemas Embarcados',
			metas: ['1', '2'],
			group: 'Alunos de Iniciação Científica'
		},
		{
			initials: 'LB',
			name: 'Luís Eduardo Limas Brito',
			info: 'Graduando em Ciência da Computação · Ciência de Dados',
			metas: ['2'],
			group: 'Alunos de Iniciação Científica'
		},
		{
			initials: 'MC',
			name: 'Matheus Araujo Pinto Carvalho',
			info: 'Graduando em Sistemas de Informação · IA Responsável',
			metas: ['1'],
			group: 'Alunos de Iniciação Científica'
		},
		{
			initials: 'GV',
			name: 'Guilherme Vezula Mateveli',
			info: 'Desenvolvedor Sênior · Aplicações Web',
			metas: ['3'],
			group: 'Colaboradores Externos',
			photo: guilhermeImg,
			photoPos: 'center 15%'
		},
		{
			initials: 'IR',
			name: 'Isadora Cristina de Matos Rodrigues',
			info: 'Desenvolvedora · Aplicações web e dados públicos',
			metas: ['3'],
			group: 'Colaboradores Externos',
			photo: isadoraImg
		},
		{
			initials: 'WC',
			name: 'Wesley Santos Costa',
			info: 'Mestre em Ciência da Computação · Sistemas de Informação',
			metas: ['6'],
			group: 'Alumni'
		}
	];

	let groupBy: 'titulo' | 'meta' = $state('titulo');

	const groupOrder = [
		'Coordenação',
		'Pesquisadores',
		'Doutorandos',
		'Mestrandos',
		'Alunos de Iniciação Científica',
		'Colaboradores Externos',
		'Alumni'
	];

	function formatMetas(member: Member): string {
		const metas = member.metas;
		if (metas.length === 1) return `Meta ${metas[0]}`;
		const last = metas[metas.length - 1];
		const rest = metas.slice(0, -1);
		return `Metas ${rest.join(', ')} e ${last}`;
	}

	let groups = $derived.by(() => {
		if (groupBy === 'titulo') {
			return groupOrder
				.map((name) => ({
					name,
					members: members.filter((m) => m.group === name)
				}))
				.filter((g) => g.members.length > 0);
		} else {
			const metaSet = new Set<string>();
			members.forEach((m) => m.metas.forEach((meta) => metaSet.add(meta)));
			const sortedMetas = [...metaSet].sort((a, b) => parseFloat(a) - parseFloat(b));
			return sortedMetas.map((meta) => ({
				name: `Meta ${meta}`,
				members: members.filter((m) => m.metas.includes(meta))
			}));
		}
	});
</script>

<svelte:head>
	<title>Equipe</title>
	<meta name="description" content="Conheça a equipe do NIAR-Saúde" />
</svelte:head>

<section class="py-16" style="background-color: rgb(245, 245, 245);">
	<div class="mx-auto max-w-6xl px-6">
		<a
			href={resolve('/')}
			class="inline-flex items-center gap-1 text-sm font-medium text-secondary hover:underline"
		>
			<span aria-hidden="true">&larr;</span> Voltar à página inicial
		</a>

		<h1 class="mt-6 text-4xl font-bold tracking-tight text-primary sm:text-5xl">Nossa Equipe</h1>
		<p class="mt-4 max-w-2xl text-lg leading-relaxed text-muted-foreground">
			Conheça todos os pesquisadores, estudantes e colaboradores que fazem parte do NIAR-Saúde.
		</p>

		<div class="mt-8 inline-flex rounded-full bg-border/50 p-1">
			<button
				class="rounded-full px-5 py-2 text-sm font-medium transition-all {groupBy === 'titulo'
					? 'bg-primary text-white shadow-sm'
					: 'text-muted-foreground'}"
				onclick={() => (groupBy = 'titulo')}
			>
				Por Função
			</button>
			<button
				class="rounded-full px-5 py-2 text-sm font-medium transition-all {groupBy === 'meta'
					? 'bg-primary text-white shadow-sm'
					: 'text-muted-foreground'}"
				onclick={() => (groupBy = 'meta')}
			>
				Por Meta
			</button>
		</div>

		{#each groups as group (group.name)}
			<details class="group mt-16" open>
				<summary
					class="flex cursor-pointer list-none items-center gap-2 rounded-lg px-4 py-3 transition-colors hover:bg-[rgba(74,74,74,0.1)]"
				>
					<ChevronDown
						class="h-5 w-5 text-primary transition-transform group-open:rotate-180"
						stroke-width="4"
					/>
					<h2 class="text-2xl font-bold text-primary">{group.name}</h2>
				</summary>
				<div class="mt-6 grid gap-6 sm:grid-cols-2">
					{#each group.members as member (member.initials)}
						<div class="flex items-center gap-5 rounded-lg bg-white p-6 ring-1 ring-border">
							{#if member.photo}
								<img
									src={member.photo}
									alt={member.name}
									class="h-14 w-14 shrink-0 rounded-full object-cover"
									style="object-position: {member.photoPos ?? 'center 20%'}"
								/>
							{:else}
								<div
									class="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary text-sm font-bold text-white"
								>
									{member.initials}
								</div>
							{/if}
							<div>
								<p class="font-bold text-primary">{member.name}</p>
								<p class="text-sm text-muted-foreground">{member.info}</p>
								<div class="mt-1 flex flex-wrap gap-1">
									{#each member.metas as meta}
										<span
											class="rounded-full bg-secondary/10 px-2.5 py-0.5 text-xs font-semibold text-secondary"
											>Meta {meta}</span
										>
									{/each}
								</div>
							</div>
						</div>
					{/each}
				</div>
			</details>
		{/each}
	</div>
</section>
