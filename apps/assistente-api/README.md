# assistente-api

Diretório reservado para a futura extração do backend do assistente para dentro do monorepo.

## Origem atual

Hoje a implementação real continua em:

```text
assistente/backend
```

## Direção

- preservar o backend atual como base real de integração;
- trazer esse backend para a estrutura `apps/assistente-api` em uma etapa posterior, com cuidado para não quebrar o fluxo já funcional;
- manter o banco compartilhado no nível das APIs, não na shell;
- consumir o mesmo pacote `@niar/database` usado pelo `admin-api` quando essa extração acontecer.
