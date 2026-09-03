# VM Oracle Linux

Este guia define o fluxo correto para a VM de producao da plataforma.

## Diretriz

- ambiente local: `Docker`
- VM Oracle Linux: `Docker`
- CI/CD: `Docker`

O projeto nao deve depender de `Podman`.

## Provisionamento da VM

O provisionamento da instancia deve acontecer uma vez, no bootstrap da VM, usando:

- [cloud-init.yaml](./cloud-init.yaml)

Esse arquivo prepara a Oracle Linux para o padrao do projeto:

- instala `git` e `curl`
- instala `Docker Engine`
- instala o plugin `docker compose`
- remove `podman-docker`, para evitar alias de `docker -> podman`
- habilita o servico do Docker
- instala `nvm`
- instala `Node.js 22`
- instala `pnpm 11.19.0`
- cria `/home/opc/niar/plataforma`

## Como usar o cloud-init

Na criacao da VM na Oracle, informar o conteudo de [cloud-init.yaml](./cloud-init.yaml) no campo de dados de inicializacao da instancia.

Depois que a VM subir pela primeira vez:

1. acessar a VM por SSH
2. encerrar e abrir a sessao novamente, para aplicar o grupo `docker` ao usuario `opc`
3. validar:

```bash
docker --version
docker compose version
docker info
node --version
pnpm --version
```

O `docker --version` nao pode mencionar `Podman`.

## Primeira validacao manual

Depois de provisionar a VM:

```bash
mkdir -p /home/opc/niar/plataforma
cd /home/opc/niar/plataforma
```

Em seguida:

1. copiar o repositorio
2. criar `.env.production`
3. rodar:

```bash
pnpm install --frozen-lockfile
pnpm prod:deploy
```

## Fluxo do GitHub Actions

Depois que a VM ja estiver provisionada corretamente, o workflow de deploy passa a fazer apenas:

1. sincronizar o repositório por `rsync`
2. recriar `.env.production` a partir do secret `PRODUCTION_ENV_FILE`
3. ativar `Node 22` via `nvm`
4. rodar `pnpm install --frozen-lockfile`
5. rodar `pnpm prod:deploy`

Ou seja: o workflow faz deploy da aplicacao, nao provisionamento da VM.

## Portas

- `80`: publica o proxy reverso
- `127.0.0.1:5432`: Postgres restrito ao host da VM

O banco nao deve ficar exposto publicamente.

## Migracao de uma VM antiga com Podman

Se a VM ja foi usada com `Podman` antes desta padronizacao:

1. parar e remover os containers antigos do Podman
2. garantir que nenhuma porta importante ainda esteja ocupada
3. validar que `docker --version` agora aponta para Docker real
4. so depois executar o primeiro deploy com a stack nova
