# VM Oracle Linux

Este guia concentra a preparacao minima da VM para receber o deploy automatico do monorepo.

## Objetivo

Ao final, a VM deve conseguir:

- receber o codigo por SSH a partir do GitHub Actions;
- executar `pnpm install --frozen-lockfile`;
- executar `pnpm prod:deploy`;
- subir a stack com Postgres, APIs, micros e proxy.

## Premissas

- sistema operacional: Oracle Linux
- usuario de acesso: `opc`
- diretorio do projeto na VM: `/home/opc/niar/plataforma`
- deploy automatizado disparado apos merge na `main`

## Preparacao inicial da VM

### 1. Atualizar pacotes basicos

```bash
sudo dnf update -y
sudo dnf install -y git curl
```

### 2. Instalar Node 22 via nvm

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
source ~/.bashrc
nvm install 22
nvm use 22
nvm alias default 22
```

Se estiver usando `zsh`, troque `~/.bashrc` por `~/.zshrc`.

### 3. Instalar pnpm 11

```bash
npm install -g pnpm@11.19.0
pnpm --version
```

### 4. Verificar runtime de containers

No Oracle Linux, normalmente o runtime disponivel sera `podman`.

Verifique:

```bash
podman --version
podman compose version
```

Se o alias `podman compose` nao estiver disponivel, conferir antes do deploy automatico como o ambiente esta oferecendo Compose.

### 5. Criar a pasta do projeto

```bash
mkdir -p /home/opc/niar/plataforma
```

## Chave SSH para o GitHub Actions

O secret `DEPLOY_SSH_KEY` deve conter a chave privada correspondente a uma chave publica autorizada em:

```bash
~/.ssh/authorized_keys
```

Se precisar adicionar manualmente:

```bash
mkdir -p ~/.ssh
chmod 700 ~/.ssh
touch ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
```

Depois, anexar a chave publica ao arquivo.

## Variaveis do GitHub

Configurar estes secrets no repositório:

- `DEPLOY_HOST`
- `DEPLOY_PORT`
- `DEPLOY_USER`
- `DEPLOY_PATH`
- `DEPLOY_SSH_KEY`
- `PRODUCTION_ENV_FILE`

Valores esperados hoje:

- `DEPLOY_USER=opc`
- `DEPLOY_PORT=22`
- `DEPLOY_PATH=/home/opc/niar/plataforma`

## Primeiro teste manual na VM

Depois de copiar o repositório e criar o `.env.production`, validar:

```bash
cd /home/opc/niar/plataforma
pnpm install --frozen-lockfile
pnpm prod:deploy
```

## Problemas conhecidos

### Locks do Podman

Em algumas execucoes no Oracle Linux ja apareceu erro de lock do Podman. O `infra.mjs` ja tenta mitigar isso com `podman system renumber` antes de operacoes criticas.

### Portas 80 e 443

O proxy reverso publica `80:80` e `443:443`. Se a VM estiver com firewall ativo, essas portas precisam estar liberadas.

### `.env.production`

O arquivo nao fica versionado no Git. No deploy automatico, ele e recriado a partir do secret `PRODUCTION_ENV_FILE`.
