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

## Revisões, entregas e pareceres

A identidade continua em `admin.projects`. A primeira submissão cria a versão 1;
reenvios exigem que a versão mais recente esteja em `needs_changes`, com parecer
final solicitando alterações do projeto. `project_versions.revision_evaluation_id`
identifica esse parecer e tem unicidade para impedir seu consumo duas vezes.
O contrato atual usa `project_changes_requested` para a solicitação de revisão
e reserva `to_review` à atribuição ou ao recebimento de nova entrega.
Os status de parecer legados continuam representados nos dois ORMs para leitura,
sem reescrever o histórico. O PUT só aceita as decisões do contrato atual.
O papel antigo `auditor` também é mantido para ler autores e responsáveis do
histórico, mas não permite autenticação, cadastro nem atribuição no fluxo atual.
Uma solicitação antiga `needs_changes` também permite revisão quando a versão
atual está em `needs_changes` e a entrega é 0; pareceres intermediários antigos do Comitê não
abrem revisão.

O rascunho permanece em `assistant.wizard_sessions`. PATCH e save-draft não
alteram snapshots nem documentos submetidos. A consulta da sessão expõe a versão
atual, seu snapshot e a solicitação vigente, sem expor `evaluation_status` ao
pesquisador. GET, listagem, PATCH e save-draft retornam essa mesma referência de
submissão. DOCX e ZIP submetidos têm nomes únicos e registros próprios em
`export_artifacts` e `project_documents`.
As duas APIs devem usar o mesmo `EXPORTS_DIR`. Se o diretório configurado não
puder ser usado, a submissão recebe 503 sem criar versão ou artefatos; não há
fallback para outro diretório que tornaria o download indisponível no admin.
Caminhos relativos são resolvidos a partir da raiz do monorepo nas duas APIs;
os documentos gerados usam caminhos absolutos, independentemente do diretório
de execução de cada serviço.

Não há outra entidade de versão ou avaliação. `delivery_number` agrupa os
arquivos de uma entrega na versão existente: 0 para o projeto escrito e 1 em
diante para relatórios. Cada registro de `admin.evaluations` aponta para a versão
e esse número de entrega. `round_number` ordena os registros imutáveis de
atribuição, encaminhamento e parecer. Novas decisões acrescentam registros;
histórico e auditoria apontam para o novo registro na mesma transação.
`committee_member_user_id` preserva o responsável entre rodadas e
entregas de relatório.

### Recebimento pós-sala segura

`POST /api/admin/project-versions/{id}/report-deliveries` aceita gestor ou
pesquisador proprietário:

```json
{
  "delivery_number": 1,
  "documents": [{ "source_export_artifact_id": 123 }]
}
```

Os artefatos devem estar persistidos, com arquivos novos, e pertencer à sessão da
versão ou à sua engenharia de dados. Os tipos aceitos são `report`,
`report_artifact` e `filled_questionnaire`. Para questionário preenchido,
`export_artifacts.questionnaire_id` aponta para a definição publicada exata,
mesmo que já esteja inativa. Um `questionnaire_id` opcional no payload deve
coincidir com essa referência; ela é copiada para o documento da entrega.
Antes de registrar documentos e avaliação, o recebimento exige arquivos regulares,
legíveis e existentes dentro de `EXPORTS_DIR`, usando a mesma validação dos downloads.
Arquivo ausente, diretório, caminho externo ou symlink externo recebe 400 sem
consumir o número da entrega. Referências ao mesmo arquivo físico também são rejeitadas.

A primeira entrega exige `under_safe_room`. Depois de
`report_changes_requested`, a entrega seguinte pode chegar em
`safe_room_reuse_requested`, `under_safe_room` ou `reapproved_for_safe_room`.
O número deve ser exatamente o seguinte; duplicatas, arquivos já entregues e
versões antigas recebem 409. O recebimento cria uma rodada `to_review` atribuída
ao mesmo membro do Comitê. A integração externa e a geração dos artefatos FIAR
ficam para tarefas posteriores.

O PUT da avaliação exige `evaluation_id` nas decisões de relatório, obtido no
GET da avaliação, para impedir que um parecer desatualizado avalie outra entrega.
`report_changes_requested` solicita ajustes/reuso na mesma versão;
`report_approved` e `report_rejected` encerram a entrega. O campo
`certification_decision` (`granted` ou `not_granted`) é obrigatório em
`report_approved` e só é aceito nessa decisão. `not_granted` exige
`certification_reason`. `to_review` não é
aceito no PUT. GET do projeto preserva todas as versões, snapshots, documentos,
pareceres e vínculos de histórico; o pesquisador continua sem os campos de
avaliação restritos por papel.

### Migração e testes

O SQL é reaplicável. Pareceres existentes recebem números em ordem de ID.
A entrega é 0 para o projeto escrito; quando há `evaluation_context` legado,
pareceres pós-sala segura e seus documentos de relatório recebem entrega 1.
Uma avaliação pós-sala segura pendente migra de `under_review` para
`report_under_review`; pedidos de ajustes antigos migram para
`safe_room_reuse_requested`, preservando os pareceres e permitindo a entrega 2.
O responsável do Comitê é recuperado dos usuários de atribuição e
parecer quando possível. Registros e arquivos sobrescritos antes desta mudança
não podem ser reconstruídos pela migração.

Os testes de integração inserem dados e exigem um banco descartável inicializado
com `001_base.sql`. Eles só executam quando `TEST_DATABASE_URL` está definido:

```sh
TEST_DATABASE_URL=postgresql://... pnpm --filter @niar/admin-api test
cd apps/assistente-api
python -m pip install -r requirements.txt -r requirements-dev.txt
TEST_DATABASE_URL=postgresql://... python -m pytest -q
```

O Swagger descreve as exigências por decisão com `oneOf`, incluindo justificativa,
referência da avaliação e decisão de certificação. Os testes verificam esse
contrato e sua validação, concorrência, rollback, arquivos e compatibilidade legada.
