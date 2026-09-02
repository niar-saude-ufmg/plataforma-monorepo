# SQL do Banco Compartilhado

Esta pasta guarda a fonte de verdade do banco compartilhado entre `assistente` e `admin`.

## Modelo unico

O banco e um so, mas organizado por schemas de dominio no PostgreSQL:

- `shared`
- `assistant`
- `admin`

## Responsabilidades

- `shared`: dados e referencias comuns aos dois lados
- `assistant`: tabelas internas do fluxo do assistente
- `admin`: tabelas novas da plataforma administrativa

## ORMs

- `SQLAlchemy` continua sendo o ORM atual do assistente
- `Prisma` continua sendo o ORM atual do admin
- ambos consomem o mesmo banco

O `schema.prisma` nao e fonte de verdade do banco.
Ele deve ser tratado como espelho derivado deste SQL para gerar o client do `admin`.

Se o backend em Python continuar usando nomes de tabela sem schema explicito, a conexao deve usar `search_path` apropriado, por exemplo:

- `assistant,shared,admin,public`

## Fluxo recomendado

1. editar o SQL desta pasta
2. rodar `pnpm db:apply:sql`
3. rodar `pnpm prisma:db:pull`
4. rodar `pnpm prisma:generate`
5. ajustar os models ou queries do `assistente-api` se a mudança afetar o Python
