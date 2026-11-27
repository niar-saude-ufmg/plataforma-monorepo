
from app.services.wizards.text_import import count_filled_sections, split_by_headings

from scripts.bootstrap_onco_scenario import STRUCTURED_MD_PATH as STRUCTURED_MD


def test_structured_md_exists():
    assert STRUCTURED_MD.is_file()


def test_split_by_headings_fills_at_least_eight_sections():
    text = STRUCTURED_MD.read_text(encoding="utf-8")
    sections = split_by_headings(text)
    filled = count_filled_sections(sections)
    assert filled >= 8, f"Esperado >= 8 seções, obteve {filled}: {[k for k, v in sections.items() if v.strip()]}"


def test_key_onco_sections_have_content():
    text = STRUCTURED_MD.read_text(encoding="utf-8")
    sections = split_by_headings(text)
    for key in ("background", "objectives", "data_sources", "methods_analysis", "responsible_ai"):
        assert sections[key].strip(), f"Seção {key} vazia"
