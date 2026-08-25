from __future__ import annotations

import json
import re
from typing import Optional


def strip_code_fence(text: str) -> str:
    cleaned = text.strip()
    if cleaned.startswith("```"):
        cleaned = re.sub(r"^```(?:json)?\s*", "", cleaned)
        cleaned = re.sub(r"\s*```$", "", cleaned)
    return cleaned.strip()


def _quote_loose_json_keys(text: str) -> str:
    return re.sub(r'([{\[,]\s*)([a-zA-Z_][a-zA-Z0-9_]*)\s*:', r'\1"\2":', text)


def _extract_json_field_string(text: str, field: str) -> Optional[str]:
    pattern = re.compile(
        rf'["\']?{re.escape(field)}["\']?\s*:\s*("(?:\\.|[^"\\])*")',
        re.DOTALL | re.IGNORECASE,
    )
    match = pattern.search(text)
    if not match:
        return None
    try:
        return json.loads(match.group(1))
    except json.JSONDecodeError:
        return match.group(1).strip('"').replace("\\n", "\n").replace('\\"', '"')


def unescape_llm_text(text: str) -> str:
    if not text:
        return text
    cleaned = text.strip()
    if cleaned.startswith('"') and cleaned.endswith('"'):
        try:
            decoded = json.loads(cleaned)
            if isinstance(decoded, str):
                return decoded.strip()
        except json.JSONDecodeError:
            pass
    if "\\n" in cleaned or "\\t" in cleaned or '\\"' in cleaned:
        cleaned = (
            cleaned.replace("\\r\\n", "\n")
            .replace("\\n", "\n")
            .replace("\\t", "\t")
            .replace('\\"', '"')
            .replace("\\'", "'")
        )
    return cleaned.strip()


def parse_json_object(text: str) -> dict:
    cleaned = strip_code_fence(text)
    candidates = [cleaned, _quote_loose_json_keys(cleaned)]
    for candidate in candidates:
        try:
            parsed = json.loads(candidate)
            if isinstance(parsed, dict):
                return parsed
        except json.JSONDecodeError:
            continue

    match = re.search(r"\{[\s\S]*\}", cleaned)
    if match:
        fragment = match.group()
        for candidate in (fragment, _quote_loose_json_keys(fragment)):
            try:
                parsed = json.loads(candidate)
                if isinstance(parsed, dict):
                    return parsed
            except json.JSONDecodeError:
                continue

    return {"raw": text}


def coerce_section_value(value: object) -> str:
    if value is None:
        return ""
    if isinstance(value, dict):
        for key in ("content", "text", "value", "body"):
            if key in value and value[key]:
                return unescape_llm_text(str(value[key]))
        return json.dumps(value, indent=2, ensure_ascii=False)
    return unescape_llm_text(str(value).strip())


def _coerce_bool(value: object, default: bool = False) -> bool:
    if isinstance(value, bool):
        return value
    if isinstance(value, str):
        lowered = value.strip().lower()
        if lowered in {"true", "1", "yes", "sim"}:
            return True
        if lowered in {"false", "0", "no", "nao", "não"}:
            return False
    return default


def _coerce_missing(value: object) -> list[str]:
    if value is None:
        return []
    if isinstance(value, list):
        return [str(item).strip() for item in value if str(item).strip()]
    if isinstance(value, str) and value.strip():
        return [value.strip()]
    return []


def extract_draft_content(result: dict) -> str:
    if not result:
        return ""

    content = result.get("content")
    if content is not None and str(content).strip():
        text = coerce_section_value(content)
        if text.startswith("{") and "content" in text.lower():
            reparsed = parse_json_object(text)
            if reparsed.get("content"):
                return coerce_section_value(reparsed["content"])
        return text

    raw = str(result.get("raw", "") or "").strip()
    if raw:
        reparsed = parse_json_object(raw)
        if reparsed.get("content") is not None:
            return coerce_section_value(reparsed["content"])
        extracted = _extract_json_field_string(raw, "content")
        if extracted:
            return unescape_llm_text(extracted)
        if not reparsed.get("raw"):
            return coerce_section_value(reparsed)
        return unescape_llm_text(raw)

    return ""


def normalize_section_draft_result(result: dict) -> dict:
    source = dict(result)
    raw = str(result.get("raw", "") or "").strip()
    if raw:
        reparsed = parse_json_object(raw)
        if reparsed.get("content") is not None or "complete" in reparsed or "missing" in reparsed:
            source = reparsed

    content = extract_draft_content(source if source is not result or not raw else result)
    complete = _coerce_bool(source.get("complete"), default=False) if "complete" in source else bool(content)
    missing = _coerce_missing(source.get("missing"))
    return {
        "content": content,
        "complete": complete,
        "missing": missing,
    }
