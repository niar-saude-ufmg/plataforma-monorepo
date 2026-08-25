from app.services.llm.json_utils import (
    coerce_section_value,
    extract_draft_content,
    normalize_section_draft_result,
    parse_json_object,
    unescape_llm_text,
)


def test_parse_json_object_from_fence():
    raw = '```json\n{"background": "Test background"}\n```'
    result = parse_json_object(raw)
    assert result["background"] == "Test background"


def test_coerce_section_value_from_dict():
    assert coerce_section_value({"content": "Hello"}) == "Hello"


def test_parse_nested_sections():
    raw = '{"sections": {"objectives": "Primary objective"}}'
    result = parse_json_object(raw)
    assert result["sections"]["objectives"] == "Primary objective"


def test_parse_loose_json_keys():
    raw = '{content: "Texto da seção", complete: true, missing: []}'
    result = parse_json_object(raw)
    assert result["content"] == "Texto da seção"
    assert result["complete"] is True


def test_unescape_literal_newlines():
    assert unescape_llm_text("Linha 1\\nLinha 2") == "Linha 1\nLinha 2"


def test_extract_draft_content_from_raw_json_blob():
    raw = (
        '{content: "O infarto agudo do miocárdio é relevante.\\n\\n'
        'Este estudo investiga readmissões.", complete: false, missing: ["referências"]}'
    )
    result = normalize_section_draft_result({"raw": raw})
    assert "content:" not in result["content"]
    assert "O infarto agudo" in result["content"]
    assert "\n\n" in result["content"]
    assert result["complete"] is False
    assert result["missing"] == ["referências"]


def test_extract_draft_content_when_content_is_nested_json_string():
    nested = '{"content": "Texto final.", "complete": true, "missing": []}'
    result = normalize_section_draft_result({"content": nested})
    assert result["content"] == "Texto final."
    assert result["complete"] is True
