from app.services.llm.output_sanitize import (
    looks_truncated,
    sanitize_assistant_text,
)


def test_sanitize_removes_thinking_block():
    raw = (
        "<thinking>Let me analyze the cohort definition step by step.</thinking>\n\n"
        "A coorte inclui pacientes diagnosticados entre 2008 e 2022."
    )
    assert sanitize_assistant_text(raw) == "A coorte inclui pacientes diagnosticados entre 2008 e 2022."


def test_sanitize_strips_english_preamble():
    raw = (
        "Let me think about this section carefully.\n\n"
        "O estudo investiga a trajetória oncológica no SUS em Belo Horizonte."
    )
    assert sanitize_assistant_text(raw) == (
        "O estudo investiga a trajetória oncológica no SUS em Belo Horizonte."
    )


def test_sanitize_removes_asterisk_reasoning_from_user_example():
    raw = (
        "*   *Wait, the user asked to list the data and give 5 references.* "
        "Listing 5 references with authors, year, and title might take a few sentences, but I must keep\n\n"
        "Dados epidemiológicos sugeridos:\n"
        "1. Mortalidade por doenças cardiovasculares no Brasil.\n"
        "2. Taxa de internação por infarto agudo do miocárdio."
    )
    cleaned = sanitize_assistant_text(raw)
    assert "Wait" not in cleaned
    assert "the user asked" not in cleaned
    assert "Dados epidemiológicos sugeridos" in cleaned


def test_sanitize_removes_max_sentences_meta():
    raw = (
        "*   Max 3 to 5 sentences? The main text has 2 sentences, the list has 5 items "
        "(which are references, not standard conversational sentences, but let's\n\n"
        "Referências sugeridas:\n"
        "1. Autor A et al. (2023). Título do artigo."
    )
    cleaned = sanitize_assistant_text(raw)
    assert "Max 3" not in cleaned
    assert "Referências sugeridas" in cleaned


def test_sanitize_trims_incomplete_final_sentence():
    raw = (
        "O infarto agudo do miocárdio é uma das principais causas de morbimortalidade no Brasil. "
        "Este projeto visa"
    )
    cleaned = sanitize_assistant_text(raw)
    assert cleaned == (
        "O infarto agudo do miocárdio é uma das principais causas de morbimortalidade no Brasil."
    )


def test_sanitize_keeps_complete_portuguese_with_list():
    text = (
        "O infarto agudo do miocárdio é uma das principais causas de morbimortalidade no Brasil.\n\n"
        "Referências:\n"
        "1. Silva et al. (2022). Epidemiologia cardiovascular no SUS."
    )
    assert sanitize_assistant_text(text) == text


def test_sanitize_keeps_portuguese_only_text():
    text = "As variáveis preditoras incluem idade, sexo e estágio clínico."
    assert sanitize_assistant_text(text) == text


def test_looks_truncated_on_length_finish_reason():
    assert looks_truncated("Texto completo.", finish_reason="length") is True


def test_looks_truncated_on_incomplete_sentence():
    assert looks_truncated("Este parágrafo termina sem pontuação final e continua crescendo " * 3) is True


def test_looks_truncated_on_dangling_preposition():
    assert looks_truncated("Estudos apontam taxas de readmissão por reinfarto em") is True


def test_looks_truncated_false_on_complete_sentence():
    assert looks_truncated("Esta frase está completa.") is False
