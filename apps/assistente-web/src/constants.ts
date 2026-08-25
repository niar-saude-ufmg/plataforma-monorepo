export const DOC_SECTIONS = [
  { key: 'background', label: 'Contexto' },
  { key: 'research_questions', label: 'Perguntas de Pesquisa / Hipóteses' },
  { key: 'objectives', label: 'Objetivos' },
  { key: 'data_sources', label: 'Fontes de Dados' },
  { key: 'study_population', label: 'População do Estudo' },
  { key: 'variables_endpoints', label: 'Variáveis e Desfechos' },
  { key: 'methods_analysis', label: 'Métodos, Plano e Fluxo de Análise' },
  { key: 'responsible_ai', label: 'IA Responsável: Viés, Justiça e Explicabilidade' },
  { key: 'expected_artifacts', label: 'Artefatos e Entregáveis Esperados' },
  { key: 'risks_limitations', label: 'Riscos e Limitações' },
  { key: 'references', label: 'Referências' },
];

export const DOC_SECTION_HINTS: Record<string, string> = {
  background: 'Qual é o problema clínico ou epidemiológico e por que o estudo importa?',
  research_questions: 'Quais perguntas de pesquisa e hipóteses testáveis orientam o trabalho?',
  objectives: 'Defina o objetivo geral e os objetivos específicos mensuráveis.',
  data_sources: 'Quais dados existem? Fontes, tabelas, vínculos e acesso.',
  study_population: 'Quem entra na coorte? Critérios de inclusão, exclusão e período.',
  variables_endpoints: 'Quais campos importam? Preditoras, desfechos, codificação e regras para dados ausentes.',
  methods_analysis: 'Plano estatístico/ML e como a análise será executada na prática (entradas, etapas, saídas).',
  responsible_ai: 'Quais riscos de viés, estratégias de equidade e requisitos de explicabilidade se aplicam?',
  expected_artifacts: 'O que a análise deve produzir? Tabelas, gráficos, modelos, exportações e relatórios.',
  risks_limitations: 'Quais limitações metodológicas, éticas ou de dados devem ser declaradas?',
  references: 'Bibliografia, normas e documentos de referência do estudo.',
};

export const DOC_SECTION_DESCRIPTIONS: Record<string, string> = {
  background: 'Contextualiza o problema em saúde, a lacuna de evidência e a motivação do estudo no âmbito do SUS.',
  research_questions: 'Formula as questões centrais e hipóteses que o projeto pretende responder ou testar.',
  objectives: 'Especifica o que o estudo busca alcançar de forma clara e verificável.',
  data_sources: 'Lista bases de dados, tabelas, vínculos entre fontes e condições de acesso.',
  study_population: 'Define a população-alvo, janelas temporais e regras de inclusão e exclusão.',
  variables_endpoints: 'Detalha variáveis preditoras, desfechos, codificação e tratamento de ausentes.',
  methods_analysis: 'Descreve desenho analítico, modelos, validação e fluxo de execução da análise.',
  responsible_ai: 'Documenta riscos de viés, equidade, transparência e explicabilidade quando há uso de IA.',
  expected_artifacts: 'Enumera entregáveis esperados: tabelas, gráficos, modelos, scripts e relatórios.',
  risks_limitations: 'Registra limitações de dados, generalização, viés residual e aspectos éticos.',
  references: 'Reúne referências bibliográficas, normas e documentação de apoio.',
};

export const PROJECT_COLLECTION_GOALS = [
  'Dados: fontes, coorte, variáveis e preparação',
  'Métodos: plano, fluxo de execução, modelos e validação',
  'Artefatos: tabelas, gráficos, modelos e exportações',
];

export const DOC_STEPS = [
  'Início',
  'Projeto de Pesquisa',
  'Revisar Projeto',
  'Engenharia de Dados',
];

export const DOC_STEP_KEYS = ['start', 'project', 'review', 'data_engineering'] as const;

export const DOC_STEP_LABELS: Record<string, string> = {
  start: 'Início',
  project: 'Projeto de Pesquisa',
  review: 'Revisar Projeto',
  data_engineering: 'Engenharia de Dados',
  basics: 'Início',
  intake: 'Projeto de Pesquisa',
  quality: 'Revisar Projeto',
  export: 'Engenharia de Dados',
  cleaning: 'Engenharia de Dados',
};

export const CLEAN_STEPS = [
  'Selecionar Conjunto',
  'Vincular Projeto',
  'Explorar Dados',
  'Discussão de Planejamento',
  'Rascunho do Script',
  'Validação',
  'Exportar',
];

export const CLEAN_STEP_KEYS = [
  'select_dataset',
  'link_project',
  'schema_explore',
  'discussion',
  'script_draft',
  'validation',
  'export',
] as const;

export const DATASET_SYNTHETIC_ALERT =
  'Os conjuntos disponíveis usam dados sintéticos de demonstração. Apenas o esquema (tabelas e colunas) está disponível; as amostras exibidas são fictícias e servem só como referência.';

export const CLEAN_BUSINESS_TOPICS = [
  'Para qual análise ou modelo preditivo você está preparando os dados?',
  'Quem deve ser incluído ou excluído da coorte?',
  'Quais filtros ou regras de qualidade de dados devem ser aplicados?',
  'Quais tabelas precisam ser unidas e em qual nível?',
  'Quais variáveis derivadas ou transformações são necessárias?',
  'Como os valores ausentes devem ser tratados?',
  'Qual é a granularidade final do conjunto de dados para modelagem?',
];

export const CLEAN_STEP_LABELS: Record<string, string> = {
  select_dataset: 'Selecionar Conjunto',
  link_project: 'Vincular Projeto',
  schema_explore: 'Explorar Dados',
  discussion: 'Discussão de Planejamento',
  script_draft: 'Rascunho do Script',
  validation: 'Validação',
  export: 'Submeter',
};

export const EMBEDDED_CLEAN_STEPS = [
  'Selecionar Conjunto',
  'Explorar Dados',
  'Discussão de Planejamento',
  'Rascunho do Script',
  'Validação',
  'Submeter',
];

export const EMBEDDED_CLEAN_STEP_KEYS = [
  'select_dataset',
  'schema_explore',
  'discussion',
  'script_draft',
  'validation',
  'export',
] as const;
