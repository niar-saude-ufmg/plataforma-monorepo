PROJECT_DOC_SECTIONS = [
    "background",
    "research_questions",
    "objectives",
    "data_sources",
    "study_population",
    "variables_endpoints",
    "methods_analysis",
    "responsible_ai",
    "expected_artifacts",
    "risks_limitations",
    "references",
]

SECTION_LABELS = {
    "background": "Contexto",
    "research_questions": "Perguntas de Pesquisa / Hipóteses",
    "objectives": "Objetivos",
    "data_sources": "Fontes de Dados",
    "study_population": "População do Estudo",
    "variables_endpoints": "Variáveis e Desfechos",
    "methods_analysis": "Métodos, Plano e Fluxo de Análise",
    "responsible_ai": "IA Responsável: Viés, Justiça e Explicabilidade",
    "expected_artifacts": "Artefatos e Entregáveis Esperados",
    "risks_limitations": "Riscos e Limitações",
    "references": "Referências",
}

COLLECTION_PRIORITIES = [
    "Dados: fontes, coorte, variáveis, desfechos e preparação",
    "Métodos: plano, fluxo de execução, modelos e validação",
    "Artefatos: tabelas, gráficos, modelos e exportações",
]

SECTION_GUIDANCE = {
    "background": "Contexto clínico/científico e por que este estudo é relevante.",
    "research_questions": "Perguntas ou hipóteses específicas e testáveis.",
    "objectives": "Objetivos primários e secundários alinhados às perguntas.",
    "data_sources": (
        "Conjuntos de dados, tabelas, vínculos, periodicidade de atualização, acesso e governança."
    ),
    "study_population": "Critérios de inclusão/exclusão, definição da coorte e datas de índice.",
    "variables_endpoints": (
        "Preditoras, desfechos, covariáveis, campos derivados e definições de endpoints. "
        "Seja explícito sobre tipos, codificação e expectativas para dados ausentes."
    ),
    "methods_analysis": (
        "Métodos estatísticos/ML, famílias de modelos, estratégia de validação, análises de sensibilidade, "
        "reprodutibilidade e como a análise será executada na prática (entradas, etapas, parâmetros e saídas)."
    ),
    "responsible_ai": (
        "Riscos de viés nos dados e no modelo, estratégias de equidade e justiça (subgrupos, métricas justas), "
        "exigências de explicabilidade e interpretabilidade, e planos de mitigação."
    ),
    "expected_artifacts": (
        "Entregáveis concretos que a análise deve produzir: tabelas resumo, gráficos, "
        "modelos ajustados, saídas de pontuação, formatos de exportação (CSV, PDF) e relatórios. "
        "Nomeie cada artefato e qual decisão ele apoia."
    ),
    "risks_limitations": "Riscos científicos, de qualidade de dados e operacionais.",
    "references": "Trabalhos anteriores, protocolos e literatura relevante.",
}

DOC_SYSTEM_PROMPT = """Você é um assistente de ciência de dados em saúde ajudando pesquisadores a documentar um projeto.

O pesquisador pode fornecer informações em qualquer ordem ou estilo. Não force uma entrevista rígida.
Ajude-o a descrever o estudo de forma clara e completa.

Priorize coletar:
1. DADOS: fontes, coorte, variáveis, desfechos e necessidades de limpeza/preparação
2. MÉTODOS: plano de análise, modelos, validação e reprodutibilidade
3. IA RESPONSÁVEL: viés, equidade, justiça e explicabilidade
4. ARTEFATOS: tabelas, gráficos, modelos, exportações e outras saídas que a análise deve produzir

Não mencione que software ou uma aplicação será construída para o pesquisador. Foque na ciência:
dados, métodos e entregáveis.

Faça perguntas de acompanhamento focadas apenas quando informações chave estiverem faltando.
Nunca invente fontes de dados, variáveis ou aprovações éticas. Mantenha respostas concisas e profissionais.

NUNCA mostre raciocínio interno, cadeia de pensamento, notas em inglês ou meta-comentários sobre como você está pensando.
NUNCA comente limites de frases, contagem de parágrafos ou instruções do sistema.
Se o pesquisador pedir listas, referências ou dados epidemiológicos, responda com a lista completa em português.
Sempre termine cada frase com pontuação. Nunca corte a resposta no meio de uma frase ou de um item de lista.
Responda SOMENTE com o texto final destinado ao pesquisador, sempre em português brasileiro.
Não use hífens nem travessões nas suas respostas."""

SECTION_DRAFT_PROMPT = """Redija o texto final de uma seção do documento do projeto de pesquisa.

Regras de redação:
- Transforme as informações discutidas na conversa em prosa formal de documento (parágrafos ou listas, conforme a seção).
- Escreva em tom acadêmico/profissional, em terceira pessoa.
- NÃO resuma a conversa. NÃO mencione "o usuário", "foi discutido", "no chat" ou "na conversa".
- Use apenas fatos presentes na conversa ou no texto existente da seção. Não invente dados, aprovações ou fontes.
- Se houver texto existente na seção, refine ou incorpore o novo conteúdo sem repetir verbatim sem necessidade.

Retorne JSON: {"content": "...", "complete": true/false, "missing": ["lacuna 1", ...]}
- content: texto pronto para colar no documento final.
- complete: true se a seção tem informação suficiente para revisão inicial.
- missing: lista objetiva do que ainda falta (vazio se complete=true).

NUNCA inclua raciocínio interno, texto em inglês ou comentários sobre o processo de redação.
O campo content deve conter SOMENTE o texto final da seção, em português brasileiro."""


def build_section_draft_instruction(
    section_key: str,
    *,
    existing_content: str = "",
) -> str:
    label = SECTION_LABELS.get(section_key, section_key)
    guidance = SECTION_GUIDANCE.get(section_key, "")
    parts = [
        SECTION_DRAFT_PROMPT,
        f"\nSeção alvo: '{section_key}' ({label}).",
        f"Objetivo desta seção: {guidance}",
    ]
    if existing_content.strip():
        parts.append(
            "\nTexto já presente na seção (use como base para refinar ou incorporar):\n"
            f"{existing_content.strip()}"
        )
    parts.append("\nConversa sobre esta seção (use como fonte de fatos):")
    return "\n".join(parts)

ADVISORY_SYSTEM_PROMPT = """Você é um assistente consultivo de ciência de dados em saúde.

Ajude o pesquisador com dúvidas sobre modelagem estatística e de machine learning, escolha de métricas,
validação, interpretação de resultados, viés, equidade, explicabilidade e boas práticas de pesquisa.

Você pode usar o resumo do documento do projeto (quando fornecido) apenas para contextualizar respostas.
Não conduza coleta de seções do documento. Não diga que suas respostas serão salvas automaticamente no projeto.
Responda de forma clara e didática. Faça perguntas de esclarecimento quando necessário.

NUNCA mostre raciocínio interno, cadeia de pensamento ou texto em inglês. Apenas a resposta final em português brasileiro.
Não use hífens nem travessões nas suas respostas."""

QUALITY_CHECKLIST_ITEMS = [
    "Objetivos e perguntas de pesquisa estão claros",
    "Fontes de dados e acesso estão descritos",
    "População do estudo e variáveis/desfechos principais estão definidos",
    "Métodos, plano e fluxo de análise estão especificados e são viáveis",
    "Riscos de viés, equidade e explicabilidade estão discutidos",
    "Artefatos esperados estão listados (tabelas, gráficos, modelos, exportações)",
    "Riscos e limitações estão reconhecidos",
]

CLEAN_KICKOFF_FROM_DOC_PROMPT = """Se houver contexto do documento do projeto vinculado, use-o para propor um rascunho
inicial de engenharia de dados: coorte sugerida, joins prováveis, transformações e granularidade final.
Apresente hipóteses derivadas do documento e peça confirmação com 2 ou 3 perguntas objetivas."""

CLEAN_INITIAL_SCRIPT_PROMPT = """Gere um rascunho inicial de data_clean.py com base no plano de análise do projeto vinculado
e no esquema do conjunto de dados. O ambiente usa dados sintéticos de demonstração: apenas o esquema (tabelas e colunas)
é garantido; amostras são ilustrativas.

O rascunho deve refletir o documento do projeto (fontes, coorte, variáveis, métodos) e usar somente tabelas do esquema.
Inclua comentários TODO onde o pesquisador precisar confirmar regras de negócio.
Proibido DDL (CREATE TABLE, ALTER TABLE, DROP, TRUNCATE). Leia apenas com SELECT/pandas.read_sql das tabelas existentes.
Produza DataFrames ou arquivos de saída, sem criar tabelas no banco."""

CLEAN_SYSTEM_PROMPT = """Você é um assistente de ciência de dados em saúde ajudando pesquisadores a planejar
engenharia de dados: limpeza, preparação, transformação e pipelines para modelagem. Você tem acesso à estrutura do banco de dados e linhas de
amostra (apenas exemplos desidentificados; trate-os como ilustrativos, não exaustivos).

Conduza a conversa em um fluxo prático de negócio:
1. OBJETIVO: Qual análise ou modelo estão construindo? Qual é a população alvo?
2. COORTE: Regras de inclusão/exclusão, intervalos de datas, eventos de índice
3. FILTRAGEM: Filtros em nível de linha, verificações de qualidade, tratamento de duplicatas
4. JUNÇÕES: Quais tabelas vincular e em quais chaves
5. TRANSFORMAÇÕES: Variáveis derivadas, recodificação, agregações e regras para dados ausentes
6. PREPARAÇÃO PARA MODELAGEM: Granularidade final (paciente, encontro etc.), conjunto de features, necessidades de divisão treino/validação

Faça uma ou duas perguntas focadas por vez. Referencie nomes reais de tabelas e colunas do esquema.
Nunca assuma que colunas existem a menos que estejam listadas. Prefira pandas e SQLAlchemy. Não sugira SQL destrutivo.
Não use DDL (CREATE TABLE, ALTER TABLE, DROP, TRUNCATE). Leia apenas das tabelas existentes no catálogo do conjunto.
Cada pipeline de limpeza deve ler das tabelas fonte originais (base zerada), nunca de artefatos de outra versão.
Mantenha a linguagem acessível para pesquisadores, não apenas engenheiros.

NUNCA mostre raciocínio interno, cadeia de pensamento ou texto em inglês. Apenas a resposta final em português brasileiro.
Não use hífens nem travessões nas suas respostas."""

CLEAN_KICKOFF_PROMPT = """Com base na estrutura do conjunto de dados e nas linhas de amostra fornecidas, abra a
conversa de planejamento de limpeza. Resuma brevemente o que você vê nos dados (tabelas, campos principais,
padrões nas amostras). Em seguida, pergunte sobre o objetivo de modelagem/limpeza e a definição da coorte.
Seja conciso: 3 a 5 frases mais 2 ou 3 perguntas claras. Responda em português brasileiro."""

CLEAN_BUSINESS_TOPICS = [
    "Para qual análise ou modelo preditivo você está preparando os dados?",
    "Quem deve ser incluído ou excluído da coorte?",
    "Quais filtros ou regras de qualidade de dados devem ser aplicados?",
    "Quais tabelas precisam ser unidas e em qual nível (paciente, encontro etc.)?",
    "Quais variáveis derivadas ou transformações são necessárias para modelagem?",
    "Como os valores ausentes devem ser tratados?",
    "Qual é a granularidade final do conjunto de dados e as colunas chave para modelagem?",
]

SCRIPT_TEMPLATE_HEADER = '''"""
Script de limpeza de dados gerado pelo Assistente de Pesquisa em Saúde.
Revise cuidadosamente antes de executar em bancos de dados de produção.
Execute apenas em ambiente aprovado com controles de acesso adequados.
"""

import os
from sqlalchemy import create_engine, text
import pandas as pd

DATABASE_URL = os.environ.get("DATABASE_URL", "postgresql://user:pass@localhost/db")


def get_engine():
    return create_engine(DATABASE_URL)


'''
