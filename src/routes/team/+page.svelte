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
	import adrianoCesarImg from '$lib/assets/staff/adriano-cesar.jpeg';
	import camilaImg from '$lib/assets/staff/camila.jpeg';
	import alineSantosImg from '$lib/assets/staff/aline-santos.jpeg';
	import anaLuizaImg from '$lib/assets/staff/ana-luiza.jpeg';
	import antonioImg from '$lib/assets/staff/antonio.jpeg';
	import deborahImg from '$lib/assets/staff/deborah.jpeg';
	import eduardoImg from '$lib/assets/staff/eduardo.jpeg';
	import ernestoImg from '$lib/assets/staff/ernesto.jpeg';
	import flaviaImg from '$lib/assets/staff/flavia.jpeg';
	import gabrielaImg from '$lib/assets/staff/gabriela.jpeg';
	import hugoImg from '$lib/assets/staff/hugo.jpeg';
	import ilkaImg from '$lib/assets/staff/ilka.jpeg';
	import jorgeImg from '$lib/assets/staff/jorge.jpeg';
	import julioImg from '$lib/assets/staff/julio.jpeg';
	import jussaraImg from '$lib/assets/staff/jussara.jpeg';
	import marcoImg from '$lib/assets/staff/marco.jpeg';
	import marcosAndreImg from '$lib/assets/staff/Marcos-Andre-4.jpg';
	import marcosPratesImg from '$lib/assets/staff/marcos.jpeg';
	import marianaAlmeidaImg from '$lib/assets/staff/mariana-almeida.jpeg';
	import marianaOliveiraImg from '$lib/assets/staff/mariana-de-oliveira.jpeg';
	import marianaMiskImg from '$lib/assets/staff/mariana-misk.jpeg';
	import marisaImg from '$lib/assets/staff/marisa.jpeg';
	import petrusImg from '$lib/assets/staff/petrus.jpeg';
	import reginaImg from '$lib/assets/staff/regina.jpeg';
	import saraImg from '$lib/assets/staff/sara.jpeg';
	import sofiaImg from '$lib/assets/staff/sofia.jpeg';
	import virgilioImg from '$lib/assets/staff/virgilio.jpeg';
	import wesleyImg from '$lib/assets/staff/wesley.jpeg';
	import zilmaImg from '$lib/assets/staff/zilma.jpeg';
	import elieteImg from '$lib/assets/staff/eliete.png';
	import barbaraImg from '$lib/assets/staff/barbara.jpeg';
	import bernardoImg from '$lib/assets/staff/bernardo.jpeg';
	import eduardoLuizImg from '$lib/assets/staff/eduardo-luiz.jpeg';
	import eloyImg from '$lib/assets/staff/eloy.jpeg';
	import erikaImg from '$lib/assets/staff/erika.jpeg';
	import fabianaImg from '$lib/assets/staff/fabiana.jpeg';
	import gregorioImg from '$lib/assets/staff/gregorio.jpeg';
	import isadoraHortaImg from '$lib/assets/staff/isadora-horta.jpeg';
	import joaoMarcosImg from '$lib/assets/staff/joao-marcos.jpeg';
	import leonardoImg from '$lib/assets/staff/leonardo.jpeg';
	import leticiaImg from '$lib/assets/staff/leticia.jpg';
	import mariaCarvalhidoImg from '$lib/assets/staff/maria-carvalhido.jpeg';
	import yasminImg from '$lib/assets/staff/yasmin.jpeg';
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
			info: 'Coordenador Metas 3 e 7 · Ciência da Computação',
			metas: ['3', '7'],
			group: 'Coordenação',
			photo: wagnerImg
		},
		{
			initials: 'MB',
			name: 'Profa. Michele Amaral Brandão',
			info: 'Coordenadora Meta 1 · Ciência da Computação e IA Responsável',
			metas: ['1', '2', '3'],
			group: 'Coordenação',
			photo: micheleImg
		},
		{
			initials: 'DG',
			name: 'Prof. Dorgival Guedes Neto',
			info: 'Coordenador Meta 3 · Sistemas Distribuídos',
			metas: ['3'],
			group: 'Coordenação',
			photo: dorgivalImg,
			photoPos: '30% 20%'
		},
		{
			initials: 'AP',
			name: 'Profa. Ana Paula Couto Silva',
			info: 'Coordenadora Meta 2 · Computação Social',
			metas: ['2'],
			group: 'Coordenação',
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
			initials: 'AR',
			name: 'Prof. Antonio Luiz Pinho Ribeiro',
			info: 'Coordenador Meta 4 · Infectologia e Medicina Tropical',
			metas: ['4'],
			group: 'Coordenação',
			photo: antonioImg
		},
		{
			initials: 'CO',
			name: 'Profa. Clara Rodrigues Alves de Oliveira',
			info: 'Pesquisadora · Infectologia e Medicina Tropical',
			metas: ['4'],
			group: 'Pesquisadores'
		},
		{
			initials: 'DM',
			name: 'Profa. Deborah Carvalho Malta',
			info: 'Coordenadora Meta 5 · Saúde Coletiva e Saúde Pública',
			metas: ['5'],
			group: 'Coordenação',
			photo: deborahImg
		},
		{
			initials: 'EP',
			name: 'Prof. Ernesto Perini Frizzera da Mota Santos',
			info: 'Pesquisador · Filosofia',
			metas: ['2'],
			group: 'Pesquisadores',
			photo: ernestoImg
		},
		{
			initials: 'FP',
			name: 'Profa. Flávia Bulegon Pilecco',
			info: 'Pesquisadora · Epidemiologia',
			metas: ['6'],
			group: 'Pesquisadores',
			photo: flaviaImg
		},
		{
			initials: 'GA',
			name: 'Prof. Gabriel Oliveira Assunção',
			info: 'Pesquisador · Estatística',
			metas: ['3'],
			group: 'Pesquisadores'
		},
		{
			initials: 'GP',
			name: 'Profa. Gabriela Miana de Mattos Paixão',
			info: 'Pesquisadora · Infectologia e Medicina Tropical',
			metas: ['4'],
			group: 'Pesquisadores',
			photo: gabrielaImg
		},
		{
			initials: 'HL',
			name: 'Profa. Helen de Cássia Sousa da Costa Lima',
			info: 'Pós-doutoranda · IA Responsável e IA em Saúde',
			metas: ['1'],
			group: 'Pesquisadores',
			photo: helenImg
		},
		{
			initials: 'HR',
			name: 'Prof. Hugo André da Rocha',
			info: 'Pesquisador · Saúde Pública',
			metas: ['6'],
			group: 'Pesquisadores',
			photo: hugoImg
		},
		{
			initials: 'IR',
			name: 'Profa. Ilka Afonso Reis',
			info: 'Pesquisadora · Estatística',
			metas: ['6'],
			group: 'Pesquisadores',
			photo: ilkaImg
		},
		{
			initials: 'JM',
			name: 'Prof. Jorge Gustavo Velasquez Melendez',
			info: 'Pesquisador · Epidemiologia Nutricional',
			metas: ['5'],
			group: 'Pesquisadores',
			photo: jorgeImg
		},
		{
			initials: 'JR',
			name: 'Prof. Júlio Soares dos Reis',
			info: 'Pesquisador · Sistemas de Informação e Ciência da Computação',
			metas: ['1'],
			group: 'Pesquisadores',
			photo: julioImg
		},
		{
			initials: 'JG',
			name: 'Profa. Jussara Marques de Almeida Gonçalves',
			info: 'Pesquisadora · Ciência da Computação',
			metas: ['5'],
			group: 'Pesquisadores',
			photo: jussaraImg
		},
		{
			initials: 'LA',
			name: 'Profa. Larissa Fortunato Araújo',
			info: 'Pesquisadora · Saúde Pública',
			metas: ['5'],
			group: 'Pesquisadores'
		},
		{
			initials: 'MA',
			name: 'Prof. Marco Antônio Sousa Alves',
			info: 'Pesquisador · Filosofia',
			metas: ['2'],
			group: 'Pesquisadores',
			photo: marcoImg
		},
		{
			initials: 'MG',
			name: 'Prof. Marcos André Gonçalves',
			info: 'Pesquisador · Ciência da Computação',
			metas: ['5'],
			group: 'Pesquisadores',
			photo: marcosAndreImg
		},
		{
			initials: 'MP',
			name: 'Prof. Marcos Oliveira Prates',
			info: 'Pesquisador · Estatística',
			metas: ['3'],
			group: 'Pesquisadores',
			photo: marcosPratesImg
		},
		{
			initials: 'ML',
			name: 'Profa. Mariangela Leal Cherchiglia',
			info: 'Coordenadora Meta 6 · Saúde Pública',
			metas: ['6'],
			group: 'Coordenação'
		},
		{
			initials: 'RS',
			name: 'Profa. Regina Helena Alves da Silva',
			info: 'Pesquisadora · História Social e Ciências Sociais',
			metas: ['2'],
			group: 'Pesquisadores'
		},
		{
			initials: 'VA',
			name: 'Prof. Virgílio Augusto Fernandes Almeida',
			info: 'Pesquisador · Ciência da Computação e IA Responsável',
			metas: ['3', '7'],
			group: 'Pesquisadores',
			photo: virgilioImg
		},
		{
			initials: 'ZR',
			name: 'Profa. Zilma Silveira Nogueira Reis',
			info: 'Coordenadora Meta 2 · Ginecologia e Obstetrícia',
			metas: ['2'],
			group: 'Coordenação',
			photo: zilmaImg
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
			initials: 'FP',
			name: 'Fabiana Costa Pereira Peixoto',
			info: 'Gerente de Projetos · Ciência da Computação',
			metas: ['1', '2', '3', '4', '5', '6', '7'],
			group: 'Coordenação',
			photo: fabianaImg
		},
		{
			initials: 'LN',
			name: 'Letícia Santos Neto',
			info: 'Gerente de Projetos · Ciência da Computação',
			metas: ['1', '2', '3', '4', '5', '6', '7'],
			group: 'Coordenação',
			photo: leticiaImg
		},
		{
			initials: 'MV',
			name: 'Dra. Marisa Affonso Vasconcelos',
			info: 'Pesquisadora · IA Responsável',
			metas: ['1', '2'],
			group: 'Pesquisadores',
			photo: marisaImg
		},
		{
			initials: 'AS',
			name: 'Dra. Aline Cristina dos Santos',
			info: 'Analista Finalística · Saúde pública',
			metas: ['6'],
			group: 'Pesquisadores',
			photo: alineSantosImg
		},
		{
			initials: 'CG',
			name: 'Dra. Crizian Saar Gomes',
			info: 'Desenvolvedora Plena · Saúde Pública',
			metas: ['5'],
			group: 'Pesquisadores'
		},
		{
			initials: 'ES',
			name: 'Dr. Eduardo Campos dos Santos',
			info: 'Analista Finalístico · Mineração de Dados',
			metas: ['3'],
			group: 'Pesquisadores',
			photo: eduardoImg
		},
		{
			initials: 'JS',
			name: 'Joabe Dias Salgueiro',
			info: 'Pesquisador · Sistemas de Informação',
			metas: ['2'],
			group: 'Pesquisadores'
		},
		{
			initials: 'MC',
			name: 'Mariana Almeida Carneiro',
			info: 'Analista Finalística · Engenharia',
			metas: ['6'],
			group: 'Pesquisadores',
			photo: marianaAlmeidaImg
		},
		{
			initials: 'MS',
			name: 'Dra. Mariana de Oliveira Santos Silva',
			info: 'Analista Finalística · Ciência da Computação',
			metas: ['2'],
			group: 'Pesquisadores',
			photo: marianaOliveiraImg
		},
		{
			initials: 'PA',
			name: 'Dr. Petrus Emmanuel Oliveira Gomes Brant Abreu',
			info: 'Analista de Modelos de IA · Engenharia Elétrica',
			metas: ['4'],
			group: 'Pesquisadores',
			photo: petrusImg
		},
		{
			initials: 'RB',
			name: 'Dra. Regina Tomie Ivata Bernal',
			info: 'Pós-doutoranda · Estatística e Saúde Pública',
			metas: ['5'],
			group: 'Pesquisadores',
			photo: reginaImg
		},
		{
			initials: 'MM',
			name: 'Mariana Misk Moysés',
			info: 'Pesquisadora · Design Industrial',
			metas: ['2'],
			group: 'Pesquisadores',
			photo: marianaMiskImg
		},
		{
			initials: 'ER',
			name: 'Prof. Eduardo Luiz Gonçalves Rios Neto',
			info: 'Pesquisador · Economia',
			metas: ['3'],
			group: 'Pesquisadores',
			photo: eduardoLuizImg
		},
		{
			initials: 'EA',
			name: 'Dra. Érika Carvalho de Aquino',
			info: 'Pesquisadora · Medicina Tropical e Saúde Pública',
			metas: ['5'],
			group: 'Pesquisadores',
			photo: erikaImg
		},
		{
			initials: 'IB',
			name: 'Profa. Isabela Nascimento Borges',
			info: 'Pesquisadora · Infectologia e Medicina Tropical',
			metas: ['4'],
			group: 'Pesquisadores'
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
			initials: 'SR',
			name: 'Sofia Maria Amorim Falco Rodrigues',
			info: 'Doutoranda · Engenharia Elétrica',
			metas: ['4'],
			group: 'Doutorandos',
			photo: sofiaImg
		},
		{
			initials: 'GR',
			name: 'Gregório Victor Rodrigues',
			info: 'Doutorando · Medicina e Ciência de Dados',
			metas: ['5'],
			group: 'Doutorandos',
			photo: gregorioImg
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
			initials: 'BC',
			name: 'Barbara Aguiar Carrato',
			info: 'Mestranda · Enfermagem e Epidemiologia',
			metas: ['5'],
			group: 'Mestrandos',
			photo: barbaraImg
		},
		{
			initials: 'LP',
			name: 'Leonardo Lemos Pena',
			info: 'Mestrando · Enfermagem',
			metas: ['5'],
			group: 'Mestrandos',
			photo: leonardoImg
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
			name: 'Matheus Araújo Pinto Carvalho',
			info: 'Graduando em Sistemas de Informação · IA Responsável',
			metas: ['1'],
			group: 'Alunos de Iniciação Científica'
		},
		{
			initials: 'AL',
			name: 'Ana Luiza Coimbra Carvalho Gallo',
			info: 'Graduanda em Design Gráfico · Desenho de Produto',
			metas: ['2'],
			group: 'Alunos de Iniciação Científica',
			photo: anaLuizaImg
		},
		{
			initials: 'FC',
			name: 'Fabíola Siomara Liboreiro Chicata',
			info: 'Graduanda em Medicina',
			metas: ['6'],
			group: 'Alunos de Iniciação Científica'
		},
		{
			initials: 'SG',
			name: 'Sara Ribeiro Guimarães',
			info: 'Graduanda em Design Gráfico',
			metas: ['2'],
			group: 'Alunos de Iniciação Científica',
			photo: saraImg
		},
		{
			initials: 'BA',
			name: 'Bernardo Loeser Amaral',
			info: 'Graduando em Engenharia de Controle e Automação',
			metas: ['3'],
			group: 'Alunos de Iniciação Científica',
			photo: bernardoImg
		},
		{
			initials: 'EM',
			name: 'Eloy Ribeiro Pereira Maciel',
			info: 'Graduando em Ciência da Computação',
			metas: ['3'],
			group: 'Alunos de Iniciação Científica',
			photo: eloyImg
		},
		{
			initials: 'IH',
			name: 'Isadora Horta Rates',
			info: 'Graduanda em Sistemas de Informação',
			metas: ['3'],
			group: 'Alunos de Iniciação Científica',
			photo: isadoraHortaImg
		},
		{
			initials: 'JC',
			name: 'João Marcos Tomáz Silva Campos',
			info: 'Graduando em Ciência da Computação',
			metas: ['3'],
			group: 'Alunos de Iniciação Científica',
			photo: joaoMarcosImg
		},
		{
			initials: 'MB',
			name: 'Maria Carvalhido Izabel Barreto',
			info: 'Graduanda em Ciência da Computação',
			metas: ['2'],
			group: 'Alunos de Iniciação Científica',
			photo: mariaCarvalhidoImg
		},
		{
			initials: 'YS',
			name: 'Yasmin Lourdes e Silva',
			info: 'Graduanda em Ciência da Computação · Computação Quântica',
			metas: ['3'],
			group: 'Alunos de Iniciação Científica',
			photo: yasminImg
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
			info: 'Desenvolvedora · Aplicações Web e Dados Públicos',
			metas: ['3'],
			group: 'Colaboradores Externos',
			photo: isadoraImg
		},
		{
			initials: 'EC',
			name: 'Eliete Guizilini Moreira de Carvalho',
			info: 'Desenvolvedora Júnior · Ciência da Informação',
			metas: ['6'],
			group: 'Colaboradores Externos',
			photo: elieteImg
		},
		{
			initials: 'WC',
			name: 'Wesley Santos Costa',
			info: 'Analista Finalístico · Sistema de Informação e Ciência da Computação',
			metas: ['6'],
			group: 'Alumni',
			photo: wesleyImg
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
					{#each group.members as member (member.name)}
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
									{#each member.metas as meta (meta)}
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
