# Plano de Trabalho — Plataforma NIAR

Este arquivo registra o plano vivo da implementação da plataforma.

Regra de manutenção:
- sempre que Guilherme pedir para armazenar, atualizar ou expandir o plano, as novas decisões devem ser adicionadas neste arquivo;
- este documento deve evoluir incrementalmente, preservando contexto e decisões anteriores importantes;
- quando houver mudança de direção, registrar a nova decisão sem apagar o racional anterior de forma irresponsável.

---

## 1. Objetivo desta primeira fase

Estruturar a base da plataforma com foco no fluxo administrativo inicial, sem priorizar nesta etapa:

- backend analítico;
- frontend da sala segura;
- implementação final do assistente de pesquisa.

O objetivo imediato é preparar a composição da plataforma e o módulo central de gestão do processo.

## 2. Visão arquitetural inicial

A arquitetura alvo considerada nesta fase é composta por:

- `shell principal`
- `micro institucional`
- `micro admin`
- `micro assistente` em etapa posterior

Observação importante:

- o `institucional` faz parte da arquitetura alvo, mas fica fora da implementação inicial neste momento;
- ele também permanece fora do monorepo nesta primeira fase, pois está em outro repositório;
- a integração com o `institucional` deve ocorrer mais ao final da etapa de implementação principal.

### 2.1 Shell principal

Responsabilidades previstas:

- controlar rotas;
- compor os micros;
- servir como ponto central de navegação da plataforma;
- centralizar autenticação e sessão compartilhada da plataforma;
- repassar contexto autenticado para os micros;
- no futuro, possivelmente centralizar também layout e outros contextos compartilhados.

Nesta fase, a shell deve permanecer o mais fina possível, sem absorver regras de negócio do domínio, mas já pode assumir o papel de entrada de autenticação da plataforma.

### 2.2 Micro institucional

Contexto:

- já existe;
- foi desenvolvido em `Svelte`;
- deve ser integrado à shell sem exigir reescrita imediata.

Papel nesta fase:

- permanecer como entrada principal pública da plataforma;
- ocupar a rota principal `/`;
- funcionar como área pública/institucional do ecossistema.

### 2.3 Micro admin

Contexto:

- é o módulo central do MVP atual;
- no estado atual, ele também representa a principal área funcional da plataforma.

Responsabilidades previstas:

- cadastro de usuários;
- gestão de perfis como pesquisador, admin, comissão e outros papéis necessários;
- gestão de projetos;
- gestão de documentos;
- controle de status e tramitação;
- envio e acompanhamento do fluxo de comissão;
- páginas e fluxos associados ao uso principal da plataforma.

Rota inicialmente considerada:

- `/admin`

### 2.4 Micro assistente

Contexto:

- será integrado depois;
- pode vir a ser reconstruído com novo frontend e novo backend, se necessário.

Rota inicialmente considerada:

- `/assistente`

Nesta primeira fase, o assistente não é o foco da implementação, mas a arquitetura já deve reservar espaço para sua futura entrada como micro independente.

## 3. Banco de dados e integração entre módulos

Direção atual:

- evitar dois bancos separados para `assistente` e `admin` neste momento;
- priorizar um banco compartilhado para o domínio central;
- manter separação de responsabilidades no nível das APIs e dos módulos.

Motivação:

- `usuário`, `projeto`, `documento`, `status` e `avaliação` pertencem ao mesmo núcleo de domínio;
- separar fisicamente cedo demais tende a gerar duplicação e sincronização desnecessária;
- o maior cuidado neste momento é separar ownership de regras, não duplicar dados base.

## 4. Estratégia de implementação da primeira fase

A primeira fase deve seguir esta ordem lógica:

1. definir a composição inicial da plataforma em torno da `shell`;
2. iniciar o `admin` como principal micro do MVP;
3. preparar a arquitetura para futura entrada do `assistente`;
4. preservar o banco compartilhado como base do domínio comum, sem fechar prematuramente a arquitetura final;
5. deixar a integração com o `institucional` para etapa posterior.

## 5. Decisões registradas até agora

- o backend inicial deve usar `Node.js + Express + Prisma + MySQL em Docker`;
- `PostgreSQL` fica como possibilidade futura, não como direção atual;
- o `institucional` deve ficar na rota principal `/`, mas fora da implementação inicial;
- o `admin` deve ficar em `/admin`;
- o `assistente` deve ficar em `/assistente`;
- o `admin` não deve ser tratado como módulo separado de “portal” neste momento;
- a shell principal deve cuidar de rotas e composição, não de regra de negócio;
- o `institucional` já existe em `Svelte`, está em outro repositório e deve ser integrado apenas mais ao final;
- o `assistente` entra depois;
- o foco atual está no `admin` e na organização da plataforma.
- o nome `admin` é provisório e pode ser revisto no futuro, já que “plataforma” representa o ecossistema como um todo.
- o fluxo de `login` deve ficar centralizado na `shell`, como direção do modelo alvo;
- `admin` e `assistente` devem funcionar como áreas autenticadas consumindo sessão compartilhada;
- o login atualmente existente no `assistente` pode ser tratado apenas como mecanismo transitório durante a integração inicial.

## 6. Dúvidas e decisões em aberto

Pontos ainda não fechados nesta etapa:

- como a shell simples por rotas será estruturada tecnicamente no monorepo;
- qual abordagem será adotada para integrar o `Svelte` do institucional na shell quando chegar a etapa final;
- como será feita a aproximação entre o monorepo principal e o repositório externo do institucional;
- como será o contrato de contexto entre `admin` e `assistente` quando o assistente entrar.

Observação:

- a direção já definida é centralizar o `login` na `shell`;
- o que permanece em aberto é a implementação técnica dessa autenticação compartilhada.

## 7. Próximos passos sugeridos

Próximos passos mais prováveis para continuidade:

1. estruturar tecnicamente a shell simples por rotas dentro do monorepo;
2. consolidar a estrutura inicial do monorepo;
3. começar a estruturar o módulo `admin` e seu papel como núcleo do MVP;
4. definir depois como o `institucional` em `Svelte` será incorporado na shell;
5. evoluir este plano sempre que novas decisões forem tomadas.

## 8. Estrutura inicial recomendada do repositório

Direção recomendada para esta fase:

- adotar um monorepo único da plataforma;
- manter frontend e backend no mesmo repositório;
- separar aplicações por responsabilidade dentro do monorepo.

Estrutura inicial sugerida:

```text
plataforma/
  apps/
    shell/
    admin-web/
    admin-api/
    assistente-web/   # depois
    assistente-api/   # depois
  packages/
    contracts/
    auth/
    config/
    ui/               # se fizer sentido depois
```

Motivação:

- simplificar o aprendizado e a manutenção para o time e para os alunos;
- manter o domínio, a documentação e os contratos próximos;
- facilitar mudanças coordenadas entre frontend e backend enquanto a arquitetura ainda está evoluindo;
- evitar fragmentação prematura em múltiplos repositórios;
- manter o `institucional` fora deste monorepo até a etapa de integração final.

Diretriz adicional de documentação dentro do monorepo:

- manter no diretório raiz da plataforma os documentos vivos de contexto e arquitetura da implementação;
- usar o `PLANO-DE-TRABALHO.md` como referência de execução e decisões incrementais;
- usar o documento `DOCUMENTO-MODELO-ASSISTENTE-E-ADMIN.md` como referência de entendimento do modelo atual do assistente, da direção de integração com o `admin` e da evolução planejada do domínio;
- preservar, no monorepo, a proximidade entre código, plano e documentação de contexto, para facilitar onboarding e continuidade do projeto.

## 9. Stack inicial recomendada

### 9.1 Frontend

Decisões alinhadas até agora:

- `React` para o módulo principal da plataforma;
- `Vite` como base de build e desenvolvimento;
- `React Router` para o roteamento do frontend.

Justificativa para `React Router`:

- é a opção mais conhecida e didática para o estágio atual do projeto;
- reduz curva de aprendizado para quem está começando;
- resolve bem a necessidade de navegação interna do `admin`;
- evita introduzir mais uma camada conceitual desnecessária neste primeiro momento.

Observação:

- a shell principal continua simples e orientada por rotas;
- o `React Router` é sugerido para o app `admin-web`, não como ferramenta obrigatória de composição de microfrontend entre todos os apps.

### 9.2 Backend

Sugestão atual a ser adotada como direção inicial:

- `Node.js`
- `Express`
- `Prisma`
- `MySQL` em Docker nesta primeira etapa

Motivação:

- stack simples e próxima de um cenário de produção mais realista;
- fácil entendimento para ensino e onboarding quando padronizada com Docker;
- boa produtividade para estruturar rapidamente a API administrativa;
- Prisma ajuda a organizar o modelo de dados e as migrações;
- MySQL em Docker evita instalação manual do banco na máquina e mantém o ambiente mais previsível.

Ponto de atenção:

- manter `MySQL` como direção inicial também para alinhar melhor com o ambiente hoje considerado mais provável de produção;
- `PostgreSQL` pode ser reavaliado futuramente caso a UFMG libere ou passe a suportar melhor esse cenário.

### 9.3 Testes

Direção atual para testes:

- `frontend`: `Vitest` + `React Testing Library`
- `backend`: `Jest` + `Supertest`

Justificativa:

- no frontend, `Vitest` combina naturalmente com `Vite + React`;
- no backend, `Jest` reaproveita um padrão já conhecido e já usado por Guilherme em `estudos/study-tracker-api`;
- `Supertest` deve ser usado para validar rotas e comportamento HTTP da API;
- no backend, o mock do banco deve seguir a abordagem já utilizada com mock do Prisma.
