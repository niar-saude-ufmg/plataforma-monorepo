import {
  CLEAN_STEPS,
  DATASET_SYNTHETIC_ALERT,
  DOC_SECTION_DESCRIPTIONS,
  DOC_SECTIONS,
  EMBEDDED_CLEAN_STEPS,
} from '../constants';

export default function InformacoesPage() {
  return (
    <div className="page info-page">
      <header className="page-intro">
        <h1>Informações</h1>
        <p className="muted">Sobre o NIAr-Saúde, as seções do projeto e a engenharia de dados.</p>
      </header>

      <section className="info-block">
        <h2>Sobre o NIAr-Saúde</h2>
        <p>
          O <strong>NIAr-Saúde</strong> (Núcleo de Inteligência Artificial Responsável para a Saúde)
          é uma iniciativa do Departamento de Ciência da Computação da UFMG voltada ao desenvolvimento
          e uso responsável de inteligência artificial em saúde pública.
        </p>
        <p>
          Este assistente apoia pesquisadores na documentação estruturada de projetos de ciência de dados
          em saúde no âmbito do SUS, com conversa guiada por seção, exportação do documento do projeto
          e geração assistida do script de engenharia de dados (<code>data_clean.py</code>).
        </p>
      </section>

      <section className="info-block">
        <h2>Seções do projeto de pesquisa</h2>
        <p className="muted">
          O documento do projeto é dividido em {DOC_SECTIONS.length} seções. Cada uma orienta
          um aspecto do estudo e alimenta a etapa de engenharia de dados.
        </p>
        <ul className="info-section-list">
          {DOC_SECTIONS.map((section) => (
            <li key={section.key} className="info-section-item">
              <h3>{section.label}</h3>
              <p>{DOC_SECTION_DESCRIPTIONS[section.key]}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="info-block">
        <h2>Engenharia de dados e o script</h2>
        <p>
          Após revisar o documento do projeto, a etapa de engenharia de dados conduz o planejamento
          e a geração do script <code>data_clean.py</code> com base no esquema do conjunto vinculado
          e no conteúdo do projeto.
        </p>

        <h3>Fluxo da engenharia de dados</h3>
        <ol className="info-steps">
          {CLEAN_STEPS.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
        <p className="muted">
          No workspace do projeto, o fluxo embutido segue: {EMBEDDED_CLEAN_STEPS.join(' → ')}.
        </p>

        <h3>Como o script é desenvolvido</h3>
        <ol className="info-steps">
          <li>
            <strong>Rascunho inicial:</strong> gerado a partir das seções do projeto vinculado
            (fontes, coorte, variáveis, métodos) e dos metadados do conjunto de dados.
          </li>
          <li>
            <strong>Discussão de planejamento:</strong> o assistente conduz perguntas sobre objetivo,
            coorte, filtros, junções e transformações, referenciando tabelas e colunas reais do esquema.
          </li>
          <li>
            <strong>Geração do script:</strong> código Python com pandas e SQLAlchemy, sem operações DDL;
            cada execução parte das tabelas fonte originais.
          </li>
          <li>
            <strong>Validação:</strong> verificação estática do script antes da submissão ou exportação.
          </li>
        </ol>

        <p className="info-alert">{DATASET_SYNTHETIC_ALERT}</p>
      </section>
    </div>
  );
}
