"""Remove reasoning leaks and English preambles from assistant-visible LLM output."""

from __future__ import annotations

import re
from typing import Optional

THINKING_BLOCK_RE = re.compile(
    r"<\s*(?:think|thinking|reasoning)[^>]*>.*?</\s*(?:think|thinking|reasoning)\s*>",
    re.IGNORECASE | re.DOTALL,
)

MARKDOWN_REASONING_HEADER_RE = re.compile(
    r"(?im)^#{1,3}\s*(?:reasoning|thinking|chain of thought|internal notes?)\s*:?\s*\n.*?(?=\n#{1,3}\s|\Z)",
    re.DOTALL,
)

ENGLISH_META_LINE_RE = re.compile(
    r"(?i)(?:"
    r"wait,\s*the user|the user asked|max\s+\d+\s+to\s+\d+\s+sentences|"
    r"the main text|might take a few sentences|let'?s count|"
    r"i must keep|but i must|standard conversational|not standard|"
    r"listing \d+ references|references with authors|step by step|"
    r"chain of thought|internal note|thinking about"
    r")",
)

ENGLISH_PREAMBLE_LINE_RE = re.compile(
    r"^(?:let me|i['']ll|i will|okay[,.]|sure[,.]|first[,.]|to answer|based on|"
    r"here['']s|here is|thinking[,:]|reasoning[,:]|i need to|the user|step \d+[,:]|wait,)\b",
    re.IGNORECASE,
)

DANGLING_PT_ENDINGS = (
    " em",
    " de",
    " da",
    " do",
    " com",
    " para",
    " por",
    " que",
    " o",
    " a",
    " os",
    " as",
    " um",
    " uma",
)

ENGLISH_STOPWORDS = frozenset(
    """
    the a an and or but in on at to for of is are was were be been being
    this that these those with from by as it its i you we they he she
    let will can should would could about into through during before after
    above below between under again further then once here there when where
    why how all each few more most other some such no nor not only own same
    so than too very just don now only also have has had do does did doing
    wait user asked sentences references listing main text keep must
    """.split()
)


def _word_tokens(text: str) -> list[str]:
    return re.findall(r"[a-zA-ZÀ-ÿ']+", text.lower())


def _looks_english_line(text: str) -> bool:
    stripped = text.strip()
    if not stripped:
        return False
    if ENGLISH_META_LINE_RE.search(stripped):
        return True
    if ENGLISH_PREAMBLE_LINE_RE.search(stripped):
        return True
    words = _word_tokens(stripped)
    if len(words) < 3:
        return bool(ENGLISH_META_LINE_RE.search(stripped))
    if _has_portuguese_markers(stripped):
        return False
    english_hits = sum(1 for w in words if w in ENGLISH_STOPWORDS)
    return english_hits / len(words) >= 0.28


def _looks_english_paragraph(text: str) -> bool:
    words = _word_tokens(text)
    if len(words) < 4:
        return bool(ENGLISH_PREAMBLE_LINE_RE.search(text.strip()))
    if _has_portuguese_markers(text):
        return False
    english_hits = sum(1 for w in words if w in ENGLISH_STOPWORDS)
    return english_hits / len(words) >= 0.22


def _has_portuguese_markers(text: str) -> bool:
    lowered = text.lower()
    if re.search(r"[áàâãéêíóôõúç]", lowered):
        return True
    return any(
        marker in lowered
        for marker in (
            " de ",
            " da ",
            " do ",
            " que ",
            " para ",
            " com ",
            " uma ",
            " um ",
            " não ",
            " estudo ",
            " dados ",
            " seção ",
            " brasil",
            " sus",
        )
    )


def _strip_english_meta_lines(text: str) -> str:
    kept: list[str] = []
    for line in text.splitlines():
        stripped = line.strip()
        if not stripped:
            if kept and kept[-1] != "":
                kept.append("")
            continue
        if _looks_english_line(stripped):
            continue
        kept.append(line.rstrip())
    while kept and kept[-1] == "":
        kept.pop()
    return "\n".join(kept).strip()


def _strip_leading_english_preambles(text: str) -> str:
    paragraphs = re.split(r"\n\s*\n", text.strip())
    if not paragraphs:
        return text.strip()

    while paragraphs:
        first = paragraphs[0].strip()
        if not first:
            paragraphs.pop(0)
            continue
        if _has_portuguese_markers(first):
            break
        if _looks_english_paragraph(first) or ENGLISH_PREAMBLE_LINE_RE.search(first):
            paragraphs.pop(0)
            continue
        break

    return "\n\n".join(paragraphs).strip()


def _trim_dangling_tail(text: str) -> str:
    stripped = text.rstrip()
    if not stripped:
        return stripped
    if re.search(r"[.!?;:)\]\"']$", stripped):
        return stripped

    parts = re.split(r"(?<=[.!?])\s+", stripped)
    if len(parts) <= 1:
        lowered = stripped.lower()
        if any(lowered.endswith(suffix) for suffix in DANGLING_PT_ENDINGS):
            return ""
        if len(stripped) > 50:
            return ""
        return stripped

    last = parts[-1].strip()
    if not last:
        return stripped
    if re.search(r"[.!?;:)\]\"']$", last):
        return stripped
    if _looks_english_line(last):
        return " ".join(parts[:-1]).strip()
    if any(last.lower().endswith(suffix) for suffix in DANGLING_PT_ENDINGS):
        return " ".join(parts[:-1]).strip()
    if len(last.split()) >= 3:
        return " ".join(parts[:-1]).strip()
    return stripped


def looks_truncated(text: str, *, finish_reason: Optional[str] = None) -> bool:
    if finish_reason == "length":
        return True
    stripped = text.rstrip()
    if not stripped:
        return False
    if stripped.endswith(("...", "…")):
        return True
    if re.search(r"[.!?;:)\]\"']$", stripped):
        return False
    lowered = stripped.lower()
    if any(lowered.endswith(suffix) for suffix in DANGLING_PT_ENDINGS):
        return True
    if len(stripped) >= 40:
        return True
    tail = stripped[-1]
    return tail.isalnum() or tail in ",-"


def sanitize_assistant_text(text: str, *, trim_incomplete: bool = True) -> str:
    cleaned = (text or "").strip()
    if not cleaned:
        return cleaned

    cleaned = THINKING_BLOCK_RE.sub("", cleaned)
    cleaned = MARKDOWN_REASONING_HEADER_RE.sub("", cleaned)
    cleaned = _strip_english_meta_lines(cleaned)
    cleaned = _strip_leading_english_preambles(cleaned)
    if trim_incomplete:
        cleaned = _trim_dangling_tail(cleaned)
    cleaned = re.sub(r"\n{3,}", "\n\n", cleaned).strip()
    return cleaned
