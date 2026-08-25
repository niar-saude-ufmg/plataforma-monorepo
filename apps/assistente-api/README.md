# Assistente API

Este diretório agora contém o backend real do assistente dentro do monorepo.

## Origem

Código trazido de:

```text
/Users/guilherme/Documents/niar/repositorio/assistente/backend
```

## Stack atual

- `Python`
- `FastAPI`
- `SQLAlchemy`
- `PostgreSQL`

## Arquivos locais gerados

Em desenvolvimento local, o assistente grava exports temporários em:

```text
apps/assistente-api/.local/exports
```

Se necessário, esse caminho pode ser sobrescrito pela variável `EXPORTS_DIR` no `.env` da raiz do monorepo.

## Credenciais locais de desenvolvimento

Quando o backend do assistente executa o `seed` em ambiente local, ele cria um usuário admin padrão caso ele ainda não exista no banco.

Credenciais atuais:

- e-mail: `admin@hra.local`
- senha: `admin12345`
- papel: `admin`

Importante:

- esse usuário existe apenas como apoio ao desenvolvimento local;
- essas credenciais não devem ser usadas como referência para produção;
- o seed não recria o usuário se ele já estiver presente no banco.

## Observação importante

Neste primeiro corte, o backend do assistente foi incorporado ao monorepo sem reescrita estrutural.

Ou seja:

- ele continua usando sua stack atual;
- o banco continua compartilhado por referência com a camada SQL central da plataforma;
- as tabelas já existentes do assistente não devem ser alteradas pela camada nova da plataforma.
