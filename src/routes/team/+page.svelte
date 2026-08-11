<script lang="ts">
	import ChevronDown from 'lucide-svelte/icons/chevron-down';
	import { pageTitle } from '$lib/seo';
	import { resolve } from '$app/paths';
	import { m } from '$lib/paraglide/messages';
	import { localizeHref } from '$lib/paraglide/runtime';
	import { t, type Localized } from '$lib/i18n';
	import { team as members } from '$lib/data/team';

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

	// The keys above stay in PT (used for grouping/filtering); these are the
	// labels shown in the headings.
	const groupLabels: Record<string, Localized> = {
		Coordenação: { pt: 'Coordenação', en: 'Coordination' },
		Pesquisadores: { pt: 'Pesquisadores', en: 'Researchers' },
		Doutorandos: { pt: 'Doutorandos', en: 'PhD Students' },
		Mestrandos: { pt: 'Mestrandos', en: "Master's Students" },
		'Alunos de Iniciação Científica': {
			pt: 'Alunos de Iniciação Científica',
			en: 'Undergraduate Research Students'
		},
		'Colaboradores Externos': { pt: 'Colaboradores Externos', en: 'External Collaborators' },
		Alumni: { pt: 'Alumni', en: 'Alumni' }
	};

	let groups = $derived.by(() => {
		if (groupBy === 'titulo') {
			return groupOrder
				.map((key) => ({
					name: t(groupLabels[key]),
					members: members.filter((mem) => mem.group === key)
				}))
				.filter((g) => g.members.length > 0);
		} else {
			const metaSet = new Set<string>();
			members.forEach((mem) => mem.metas.forEach((meta) => metaSet.add(meta)));
			const sortedMetas = [...metaSet].sort((a, b) => parseFloat(a) - parseFloat(b));
			return sortedMetas.map((meta) => ({
				name: m.meta_label({ meta }),
				members: members.filter((mem) => mem.metas.includes(meta))
			}));
		}
	});
</script>

<svelte:head>
	<title>{pageTitle(m.team_title())}</title>
	<meta name="description" content={m.team_meta_desc()} />
</svelte:head>

<section class="py-16" style="background-color: rgb(245, 245, 245);">
	<div class="mx-auto max-w-6xl px-6">
		<a
			href={localizeHref(resolve('/'))}
			class="inline-flex items-center gap-1 text-sm font-medium text-secondary hover:underline"
		>
			<span aria-hidden="true">&larr;</span>
			{m.back_home()}
		</a>

		<h1 class="mt-6 text-4xl font-bold tracking-tight text-primary sm:text-5xl">
			{m.team_heading()}
		</h1>
		<p class="mt-4 max-w-2xl text-lg leading-relaxed text-muted-foreground">
			{m.team_subtitle()}
		</p>

		<div class="mt-8 inline-flex rounded-full bg-border/50 p-1">
			<button
				class="rounded-full px-5 py-2 text-sm font-medium transition-all {groupBy === 'titulo'
					? 'bg-primary text-white shadow-sm'
					: 'text-muted-foreground'}"
				onclick={() => (groupBy = 'titulo')}
			>
				{m.team_toggle_role()}
			</button>
			<button
				class="rounded-full px-5 py-2 text-sm font-medium transition-all {groupBy === 'meta'
					? 'bg-primary text-white shadow-sm'
					: 'text-muted-foreground'}"
				onclick={() => (groupBy = 'meta')}
			>
				{m.team_toggle_meta()}
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
								<p class="text-sm text-muted-foreground">{t(member.info)}</p>
								<div class="mt-1 flex flex-wrap gap-1">
									{#each member.metas as meta (meta)}
										<span
											class="rounded-full bg-secondary/10 px-2.5 py-0.5 text-xs font-semibold text-secondary"
											>{m.meta_label({ meta })}</span
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
