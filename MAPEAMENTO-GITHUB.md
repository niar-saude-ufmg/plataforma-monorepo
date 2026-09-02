# Mapeamento para Funcionamento no GitHub

Este documento lista o que precisa estar alinhado para o monorepo funcionar bem quando versionado, revisado e publicado pelo GitHub.

Data de referencia: 2026-09-02.

## 1. O que ja esta pronto no repositório

- monorepo com `pnpm workspace` e `turbo`
- `CI` em `.github/workflows/ci.yml`
- workflow de deploy em `.github/workflows/deploy.yml`
- script de deploy da VM em `infra/vm/deploy.sh`
- documentacao base em `README.md`
- guia operacional em `GUIA-DE-USO-MONOREPO.md`
- guia de preparacao da VM em `infra/vm/README.md`

## 2. Ajustes obrigatorios dentro do repositório

### 2.1. Documentacao nao pode depender da maquina local

A documentacao precisa sempre usar caminhos genericos, nunca caminhos da maquina do Guilherme.

Ja corrigido nesta etapa:

- exemplos com `cd /Users/guilherme/...` trocados por `cd <caminho-do-repositorio>/plataforma`

Ainda vale revisar continuamente:

- novos READMEs
- exemplos de comandos adicionados em futuras tarefas

### 2.2. Documentacao precisa refletir os scripts reais

O guia nao pode citar scripts que nao existem.

Ja corrigido nesta etapa:

- `pnpm dev:shell`
- `pnpm dev:admin-web`
- `pnpm dev:admin-api`
- `pnpm dev:assistente-web`
- `pnpm dev:assistente-api`

Agora o guia usa os comandos reais com `pnpm --filter ...`.

### 2.3. Fluxo do `.env.production` precisa funcionar no Actions

O workflow de deploy nao pode gravar o texto literal do secret.

Ja corrigido nesta etapa:

- envio do `PRODUCTION_ENV_FILE` por `printf` via `ssh`

## 3. Configuracoes obrigatorias fora do codigo

Estas partes nao ficam no Git, mas sem elas o repositório nao funciona no GitHub como esperado.

### 3.1. Secrets do GitHub

Cadastrar no repositório:

- `DEPLOY_HOST`
- `DEPLOY_PORT`
- `DEPLOY_USER`
- `DEPLOY_PATH`
- `DEPLOY_SSH_KEY`
- `PRODUCTION_ENV_FILE`

### 3.2. Chave publica na VM

A chave publica correspondente ao secret `DEPLOY_SSH_KEY` precisa estar em:

- `~/.ssh/authorized_keys`

### 3.3. Preparacao minima da VM

A VM precisa ter:

- `nvm`
- `Node 22`
- `pnpm 11`
- `Docker` ou `Podman`
- pasta do projeto criada

Referencia:

- `infra/vm/README.md`

## 4. Pontos que ainda exigem disciplina da equipe

### 4.1. Banco compartilhado

Fluxo combinado hoje:

1. alterar o SQL em `packages/database/sql`
2. rodar `pnpm db:apply:sql`
3. rodar `pnpm prisma:db:pull`
4. rodar `pnpm prisma:generate`
5. atualizar o assistente Python se a mudanca afetar os models/queries dele

Risco se isso nao for seguido:

- Prisma e SQLAlchemy passam a enxergar estruturas diferentes

### 4.2. Branches e deploy

Hoje:

- a `CI` roda em `pull_request`
- a `CI` tambem roda em `push` para `main` e `feat/**`
- o deploy roda em `push` para `main`

Impacto:

- se a equipe usar outro prefixo de branch, o `push` nao dispara a CI, embora o `pull_request` continue cobrindo

### 4.3. Runtime da VM

No Oracle Linux ainda existe risco operacional com locks do Podman.

Mitigacao atual:

- `infra.mjs` tenta executar `podman system renumber`
- build de producao feito em serie

Isso ajuda, mas nao elimina todo problema de runtime da VM.

## 5. Melhorias recomendadas depois

- revisar os READMEs de `apps/assistente-api` e `apps/assistente-web` para remover referencias ao caminho original local do clone
- decidir se a equipe vai manter `feat/**` como padrao oficial de branch
- decidir se o deploy vai continuar por `merge` na `main` ou se vai existir uma branch exclusiva de homologacao
- testar o workflow completo com um primeiro merge real na `main`
- registrar um checklist de QA para validar shell, micros, APIs e login apos deploy

## 6. Resumo objetivo

Para o repositório funcionar no GitHub sem surpresa, o essencial e:

- documentacao coerente com os scripts reais
- workflows validos
- secrets cadastrados
- VM preparada
- disciplina no fluxo do banco compartilhado
