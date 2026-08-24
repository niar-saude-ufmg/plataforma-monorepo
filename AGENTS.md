# plataforma — AGENTS.md

Regras específicas para trabalho neste diretório `plataforma`.

Este arquivo herda e complementa o contexto global já definido fora deste workspace, especialmente:

- o `AGENTS.md` global carregado pelo ambiente do Codex;
- quaisquer regras universais equivalentes mantidas por Guilherme;
- convenções locais relevantes do ecossistema NIAR.

Este arquivo também se inspira na organização do `CLAUDE.md` de referência em `/Users/guilherme/Documents/more/b3/b3-design-system-web/CLAUDE.md`, mas adapta o conteúdo ao contexto da plataforma NIAR.

---

## Contexto do workspace

Este diretório `plataforma` concentra a evolução da plataforma do NIAR relacionada ao assistente de pesquisa, à futura aplicação administrativa e, possivelmente, à composição de micros dentro de uma plataforma mãe.

Atualmente existe um projeto funcional em `assistente/`, que deve ser tratado como ponto de partida real para integração e evolução incremental.

## Visão do produto

A direção atual não é começar pela aplicação analítica da sala segura nem pelo backend analítico. O foco mudou para uma plataforma mãe que organize o fluxo administrativo e de submissão de projetos de pesquisa.

Essa plataforma mãe deve, progressivamente, comportar componentes independentes, preferencialmente como micros, por exemplo:

- assistente de pesquisa;
- aplicação administrativa;
- site institucional;
- no futuro, outros módulos relacionados à operação da plataforma.

O objetivo é manter independência de responsabilidades entre os módulos, sem duplicar o domínio central do negócio.

## Decisões já tomadas

- O assistente de pesquisa já existe e está implementado em `assistente/`.
- O frontend atual do assistente já é em React + TypeScript.
- O backend atual do assistente usa FastAPI + PostgreSQL + SQLAlchemy async.
- O MVP atual não deve focar no backend analítico.
- O MVP atual não deve focar no frontend da sala segura.
- O frontend definitivo da plataforma mãe ainda não está fechado; React é uma opção válida.
- A arquitetura deve privilegiar composição modular/microfrontend.

## Escopo atual do MVP

O MVP deve priorizar o fluxo administrativo e de submissão:

- cadastro/autenticação de usuário;
- integração com o assistente de pesquisa;
- criação e estruturação assistida do projeto, incluindo o documento para envio à comissão;
- armazenamento e acompanhamento do projeto;
- envio/encaminhamento para comissão;
- acompanhamento de status;
- distinção entre projetos com base própria e projetos que demandam base do NIAR.

Neste momento, a sala segura entra como desdobramento posterior de parte dos projetos, não como foco principal da primeira entrega.

## Banco de dados e domínio

No curto prazo, deve-se reaproveitar o banco já utilizado pelo projeto `assistente/`, evitando criação de dois bancos para `assistente` e `admin`.

Motivação:

- `usuário`, `projeto`, `documento`, `status` e `avaliação` pertencem ao mesmo domínio central;
- separar em dois bancos agora tenderia a gerar duplicação, sincronização e inconsistência;
- a diferença principal entre `assistente` e `admin` é de responsabilidade de API e fluxo, não de domínio base.

### Diretriz atual

- usar um banco compartilhado;
- manter APIs separadas por responsabilidade;
- evitar duplicação de entidades centrais;
- adiar qualquer divisão física de banco até haver necessidade real.

### Diretriz de evolução

Embora o banco atual do assistente seja o ponto de partida, o modelo-alvo deve separar conceitualmente:

#### Domínio central da plataforma

- `users`
- `projects`
- `project_documents`
- `project_status`
- `project_status_history`
- `committee_submissions`
- `committee_reviews`

#### Domínio específico do assistente

- `assistant_sessions`
- `assistant_messages`
- `assistant_artifacts`
- `assistant_section_drafts`

Importante: no estado atual do projeto `assistente/`, o conceito de projeto ainda está fortemente acoplado ao wizard (`WizardSession`). Isso pode ser usado temporariamente na integração, mas não deve ser tratado como modelo final ideal da plataforma.

## Estratégia de implementação

Estratégia acordada:

1. primeiro integrar e reaproveitar o projeto `assistente/` como está;
2. criar/evoluir a parte administrativa em cima desse contexto real;
3. pensar o banco desde já com separação conceitual entre domínio central e domínio do assistente;
4. futuramente refatorar ou reescrever com modelo mais limpo, quando a integração e o fluxo estiverem mais estáveis.

Ou seja: integração primeiro, reescrita depois.

## APIs e fronteiras

### API do assistente

Responsável principalmente por:

- experiência conversacional;
- coleta e estruturação do projeto;
- drafts e seções do documento;
- mensagens de chat;
- artefatos gerados pelo assistente.

### API admin

Responsável principalmente por:

- cadastro e gestão administrativa;
- acompanhamento do ciclo do projeto;
- status e tramitação;
- envio para comissão;
- avaliação e governança do fluxo.

## BFF

Neste momento, BFF não é obrigatório.

Diretriz atual:

- começar sem BFF, se a composição entre micros/frontends e APIs continuar simples;
- considerar BFF apenas se surgirem dores reais de composição de chamadas, sessão, autorização ou agregação orientada à UI.

Evitar abstração prematura.

## Microfrontends e reaproveitamento do frontend atual

É aceitável reutilizar inicialmente o frontend já existente no projeto `assistente/` como parte do ecossistema da plataforma, inclusive como base para um micro ou para integração gradual.

Não é necessário esperar o frontend definitivo da plataforma mãe para começar.

Diretriz prática:

- reaproveitar o frontend atual onde isso acelerar entrega;
- evitar acoplamentos irreversíveis com a shell futura;
- planejar a extração/adaptação futura para composição como microfrontend.

## Monorepo

A ideia de monorepo é compatível com a direção atual e pode facilitar:

- manter `assistente`, `admin`, shell/plataforma mãe e módulos relacionados no mesmo lugar;
- compartilhar padrões, contratos e utilitários;
- coordenar evolução arquitetural com menos dispersão entre repositórios.

Se adotado, o monorepo deve preservar fronteiras claras entre aplicações e responsabilidades, evitando misturar tudo em um único app monolítico.

## Fluxo de negócio consolidado

Visão resumida do fluxo principal:

1. usuário se cadastra ou é cadastrado;
2. usuário acessa a plataforma mãe;
3. usuário utiliza o assistente para estruturar o projeto;
4. o assistente gera o documento/artefato de submissão;
5. o projeto é persistido no domínio central;
6. o projeto é encaminhado para comissão;
7. o pesquisador acompanha o status;
8. dependendo do caso, o projeto segue para uso de base própria ou para fluxo que exige dados do NIAR/sala segura.

## Observações importantes para futuros agentes

- Não assumir que o modelo atual do assistente já representa o modelo final ideal da plataforma.
- Não introduzir dois bancos sem justificativa forte.
- Não priorizar backend analítico ou frontend da sala segura neste momento.
- Não tratar o assistente como um módulo isolado do domínio; ele participa diretamente da criação do projeto e do documento de submissão.
- Preservar independência de responsabilidades entre módulos, mesmo quando compartilharem banco e parte do domínio.
