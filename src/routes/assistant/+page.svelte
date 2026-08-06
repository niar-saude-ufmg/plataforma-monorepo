<script lang="ts">
	import { resolve } from '$app/paths';
	import { localizeHref } from '$lib/paraglide/runtime';
	import { m } from '$lib/paraglide/messages';
	import { env } from '$env/dynamic/public';
	import Send from 'lucide-svelte/icons/send';
	import Loader from 'lucide-svelte/icons/loader-circle';
	import FileText from 'lucide-svelte/icons/file-text';
	import ExternalLink from 'lucide-svelte/icons/external-link';
	import Sparkles from 'lucide-svelte/icons/sparkles';
	import Info from 'lucide-svelte/icons/info';

	// Base URL da API Python (rag-api). Em dev cai no default local; em produção
	// defina PUBLIC_RAG_API_URL no ambiente de build.
	const API_BASE = env.PUBLIC_RAG_API_URL ?? 'http://localhost:8000';

	type Fonte = {
		titulo: string;
		tipo: string;
		ano: string;
		tema: string;
		link: string;
	};

	type ChatMessage = {
		role: 'user' | 'assistant';
		text: string;
		fontes?: Fonte[];
	};

	let messages = $state<ChatMessage[]>([]);
	let input = $state('');
	let loading = $state(false);
	let errored = $state(false);

	// Dois estados para o cartão: inicial (compacto, só apresenta o assistente) e
	// de conversa (mais alto/expansível para comportar mensagens, resposta e fontes).
	const hasConversation = $derived(messages.length > 0 || loading);

	// Aviso compacto com accordion: fechado mostra só o essencial; "Saiba mais"
	// expande os detalhes (origem, documentos, verificação) no próprio bloco.
	let showNotice = $state(false);

	// Perguntas de exemplo mostradas no estado vazio (chips clicáveis).
	const suggestions = [
		m.assistant_suggestion_1,
		m.assistant_suggestion_2,
		m.assistant_suggestion_3
	];

	let conversationEl = $state<HTMLDivElement>();
	let textareaEl = $state<HTMLTextAreaElement>();

	// Mantém a conversa rolada para a mensagem mais recente e foca o campo ao abrir.
	$effect(() => {
		messages.length;
		loading;
		conversationEl?.scrollTo({ top: conversationEl.scrollHeight, behavior: 'smooth' });
	});
	$effect(() => {
		textareaEl?.focus();
	});

	// Campo expansível: começa compacto (uma linha) e cresce conforme o texto,
	// até um teto a partir do qual passa a rolar internamente.
	$effect(() => {
		input;
		if (!textareaEl) return;
		textareaEl.style.height = 'auto';
		textareaEl.style.height = `${Math.min(textareaEl.scrollHeight, 200)}px`;
	});

	// Remove a seção "## Fontes utilizadas" do markdown da resposta, já que as
	// fontes são exibidas separadamente como cards estruturados. Também tira o
	// cabeçalho "## Resposta" para o texto ficar limpo.
	function cleanAnswer(markdown: string): string {
		const withoutSources = markdown.split(/##\s*Fontes utilizadas/i)[0];
		return withoutSources
			.replace(/##\s*Resposta\s*/i, '')
			.replace(/\*\*/g, '')
			.trim();
	}

	async function send(overrideText?: string) {
		const pergunta = (overrideText ?? input).trim();
		if (!pergunta || loading) return;

		errored = false;
		messages.push({ role: 'user', text: pergunta });
		input = '';
		loading = true;

		try {
			const res = await fetch(`${API_BASE}/chat`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ pergunta })
			});

			if (!res.ok) throw new Error(`HTTP ${res.status}`);

			const data: { resposta: string; fontes: Fonte[] } = await res.json();
			messages.push({
				role: 'assistant',
				text: cleanAnswer(data.resposta),
				fontes: data.fontes ?? []
			});
		} catch (e) {
			errored = true;
		} finally {
			loading = false;
		}
	}

	function onKeydown(event: KeyboardEvent) {
		if (event.key === 'Enter' && !event.shiftKey) {
			event.preventDefault();
			send();
		}
	}

	function askSuggestion(text: string) {
		send(text);
	}
</script>

<svelte:head>
	<title>{m.assistant_title()}</title>
	<meta name="description" content={m.assistant_meta_desc()} />
</svelte:head>

<section
	class="flex min-h-[calc(100vh-5rem)] flex-col py-16"
	style="background-color: rgb(245, 245, 245);"
>
	<div class="mx-auto flex w-full max-w-6xl flex-col px-6">
		<a
			href={localizeHref(resolve('/'))}
			class="inline-flex items-center gap-1 text-sm font-medium text-secondary hover:underline"
		>
			<span aria-hidden="true">&larr;</span>
			{m.back_home()}
		</a>

		<h1 class="mt-6 text-4xl font-bold tracking-tight text-primary sm:text-5xl">
			{m.assistant_heading()}
		</h1>
		<p class="mt-4 max-w-3xl text-lg leading-relaxed text-muted-foreground">
			{m.assistant_subtitle()}
		</p>

		<!-- Cartão do chat: acompanha o conteúdo (compacto quando vazio) e só cresce/rola
		     quando a conversa passa da altura máxima. -->
		<div
			class="mt-8 flex {hasConversation
				? 'min-h-[440px]'
				: 'min-h-[256px]'} max-h-[min(65vh,560px)] w-full max-w-4xl flex-col self-center overflow-hidden rounded-2xl border border-border bg-white shadow-sm transition-[min-height] duration-300"
		>
			<!-- Conversa: rola internamente para o input ficar sempre visível -->
			<div
				bind:this={conversationEl}
				class="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-5"
			>
				{#if messages.length === 0}
					<div class="flex flex-1 flex-col items-center justify-center px-8 pt-4 pb-2 text-center">
						<div
							class="flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary"
						>
							<Sparkles class="size-7" aria-hidden="true" />
						</div>
						<h2 class="mt-4 text-xl font-semibold text-primary">{m.assistant_empty_title()}</h2>
						<p class="mt-2 max-w-md text-muted-foreground">{m.assistant_empty_subtitle()}</p>

						<div class="mt-5 flex w-full max-w-2xl flex-col gap-2.5">
							<span class="sr-only">{m.assistant_suggestions_label()}</span>
							{#each suggestions as suggestion (suggestion)}
								<button
									type="button"
									onclick={() => askSuggestion(suggestion())}
									class="group flex items-center gap-3 rounded-xl border border-border bg-muted/40 px-4 py-3 text-left text-sm text-foreground transition-colors hover:border-secondary/50 hover:bg-muted"
								>
									<Sparkles
										class="size-4 shrink-0 text-secondary transition-transform group-hover:scale-110"
										aria-hidden="true"
									/>
									<span>{suggestion()}</span>
								</button>
							{/each}
						</div>
					</div>
				{/if}

				{#each messages as message (message)}
					{#if message.role === 'user'}
						<div class="flex justify-end">
							<div
								class="max-w-[85%] rounded-2xl rounded-br-sm bg-primary px-5 py-3 text-white shadow-sm"
							>
								{message.text}
							</div>
						</div>
					{:else}
						<div class="flex justify-start">
							<div
								class="w-full max-w-[92%] rounded-2xl rounded-bl-sm border border-border bg-white px-5 py-4 shadow-sm"
							>
								<p class="leading-relaxed whitespace-pre-wrap text-foreground">{message.text}</p>

								{#if message.fontes && message.fontes.length > 0}
									<div class="mt-5 border-t border-border pt-4">
										<h2 class="mb-3 text-sm font-semibold tracking-wide text-primary uppercase">
											{m.assistant_sources_title()}
										</h2>
										<div class="grid gap-3 sm:grid-cols-2">
											{#each message.fontes as fonte (fonte.titulo)}
												<div class="rounded-xl border border-border bg-muted/40 p-4">
													<div class="flex items-start gap-2">
														<FileText
															class="mt-0.5 size-4 shrink-0 text-secondary"
															aria-hidden="true"
														/>
														<div class="min-w-0">
															<p class="text-sm font-semibold text-foreground">
																{fonte.titulo}
															</p>
															<p class="mt-0.5 text-xs text-muted-foreground">
																{[fonte.tipo, fonte.ano, fonte.tema].filter(Boolean).join(' · ')}
															</p>
															{#if fonte.link}
																<a
																	href={fonte.link}
																	target="_blank"
																	rel="noopener noreferrer"
																	class="mt-2 inline-flex items-center gap-1 text-xs font-medium text-secondary hover:underline"
																>
																	{m.assistant_open_source()}
																	<ExternalLink class="size-3" aria-hidden="true" />
																</a>
															{/if}
														</div>
													</div>
												</div>
											{/each}
										</div>
									</div>
								{/if}
							</div>
						</div>
					{/if}
				{/each}

				{#if loading}
					<div class="flex justify-start">
						<div
							class="flex items-center gap-2 rounded-2xl rounded-bl-sm border border-border bg-white px-5 py-3 text-muted-foreground shadow-sm"
						>
							<Loader class="size-4 animate-spin" aria-hidden="true" />
							{m.assistant_thinking()}
						</div>
					</div>
				{/if}

				{#if errored}
					<div
						class="rounded-xl border border-destructive/30 bg-destructive/5 px-5 py-3 text-sm text-destructive"
					>
						{m.assistant_error()}
					</div>
				{/if}
			</div>

			<!-- Campo de entrada: caixa única (texto + botão) sobre o mesmo fundo do chat,
			     sem linha divisória. Padding alinhado ao da conversa (p-5) para a caixa
			     acompanhar a margem das mensagens/sugestões. O foco envolve toda a caixa. -->
			<div class="px-5 pt-2 pb-5">
				<div
					class="flex items-end gap-2 rounded-2xl bg-muted p-1.5 transition-shadow focus-within:ring-2 focus-within:ring-primary"
				>
					<textarea
						bind:this={textareaEl}
						bind:value={input}
						onkeydown={onKeydown}
						rows="1"
						placeholder={m.assistant_input_placeholder()}
						class="max-h-[200px] min-h-[2.5rem] flex-1 resize-none bg-transparent px-3 py-2 text-foreground outline-none placeholder:text-muted-foreground/60"
					></textarea>
					<button
						onclick={() => send()}
						disabled={loading || !input.trim()}
						aria-label={m.assistant_send()}
						class="inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary text-white shadow-sm transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:bg-transparent disabled:text-muted-foreground disabled:shadow-none"
					>
						<Send class="size-5" aria-hidden="true" />
					</button>
				</div>
			</div>
		</div>

		<!-- Aviso: bloco compacto com a mesma largura do cartão, contêiner sutil e
		     accordion. Fechado mostra só o essencial; aberto revela os detalhes. -->
		<div
			class="mt-5 w-full max-w-4xl self-center rounded-xl border border-secondary/25 bg-secondary/5 px-4 py-3 text-sm"
		>
			<div class="flex items-start gap-3">
				<Info class="mt-0.5 size-5 shrink-0 text-secondary" aria-hidden="true" />
				<div class="min-w-0 flex-1">
					{#if !showNotice}
						<div class="flex items-start justify-between gap-4">
							<p class="max-w-[680px] text-muted-foreground">{m.assistant_notice_short()}</p>
							<button
								type="button"
								onclick={() => (showNotice = true)}
								aria-expanded="false"
								class="shrink-0 font-medium text-secondary hover:underline"
							>
								{m.assistant_notice_more()}
							</button>
						</div>
					{:else}
						<div class="flex items-start justify-between gap-4">
							<h2 class="font-semibold text-primary">{m.assistant_notice_title()}</h2>
							<button
								type="button"
								onclick={() => (showNotice = false)}
								aria-expanded="true"
								class="shrink-0 font-medium text-secondary hover:underline"
							>
								{m.assistant_notice_less()}
							</button>
						</div>

						<div class="max-w-[680px]">
							<p class="mt-2 leading-relaxed text-muted-foreground">
								{m.assistant_notice_about()}
							</p>

							<h3 class="mt-4 text-xs font-semibold tracking-wide text-primary uppercase">
								{m.assistant_notice_docs_title()}
							</h3>
							<ul class="mt-2 space-y-1 text-muted-foreground">
								<li class="flex gap-2">
									<span aria-hidden="true" class="text-secondary">&bull;</span>
									<span>{m.assistant_notice_doc_1()}</span>
								</li>
								<li class="flex gap-2">
									<span aria-hidden="true" class="text-secondary">&bull;</span>
									<span>{m.assistant_notice_doc_2()}</span>
								</li>
								<li class="flex gap-2">
									<span aria-hidden="true" class="text-secondary">&bull;</span>
									<span>{m.assistant_notice_doc_3()}</span>
								</li>
							</ul>

							<p class="mt-4 text-muted-foreground">{m.assistant_notice_sources()}</p>
						</div>
					{/if}
				</div>
			</div>
		</div>
	</div>
</section>
