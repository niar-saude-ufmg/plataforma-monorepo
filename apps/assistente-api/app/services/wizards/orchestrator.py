import json

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models import CatalogTable, Dataset, WizardSession, WizardType
from app.services.llm.gateway import llm_gateway
from app.services.llm.prompts import (
    ADVISORY_SYSTEM_PROMPT,
    CLEAN_INITIAL_SCRIPT_PROMPT,
    CLEAN_KICKOFF_FROM_DOC_PROMPT,
    CLEAN_KICKOFF_PROMPT,
    CLEAN_SYSTEM_PROMPT,
    DOC_SYSTEM_PROMPT,
    PROJECT_DOC_SECTIONS,
    SCRIPT_TEMPLATE_HEADER,
    SECTION_GUIDANCE,
    SECTION_LABELS,
    build_section_draft_instruction,
)
from app.services.quality.criteria import PROJECT_CRITERIA, all_criteria_labels
from app.services.wizards.section_migration import migrate_section_data
from app.services.llm.json_utils import coerce_section_value, normalize_section_draft_result, parse_json_object
from app.services.scriptgen.validator import validate_script
from app.services.wizards.chat_context import (
    CHAT_MAX_OUTPUT_TOKENS,
    SECTION_DRAFT_MAX_OUTPUT_TOKENS,
    messages_for_channel,
    section_context_summary,
    trim_chat_history,
    truncate_text,
)
from app.services.wizards.text_import import (
    count_filled_sections,
    should_use_chunked_import,
    split_long_text_into_sections,
)

MAX_SAMPLE_ROWS = 10


def parse_sample_rows(raw: str) -> list[dict]:
    try:
        rows = json.loads(raw or "[]")
        if isinstance(rows, list):
            return [r for r in rows if isinstance(r, dict)][:MAX_SAMPLE_ROWS]
    except json.JSONDecodeError:
        pass
    return []


async def get_schema_context(db: AsyncSession, dataset_id: int, *, include_samples: bool = True) -> str:
    result = await db.execute(
        select(Dataset)
        .where(Dataset.id == dataset_id)
        .options(
            selectinload(Dataset.tables).selectinload(CatalogTable.columns),
            selectinload(Dataset.tables).selectinload(CatalogTable.relationships_from),
        )
    )
    dataset = result.scalar_one_or_none()
    if not dataset:
        return "Conjunto de dados não encontrado."

    lines = [f"Conjunto: {dataset.name}", f"Descrição: {dataset.description}", ""]
    for table in dataset.tables:
        lines.append(f"Tabela: {table.name}: {table.description}")
        for col in table.columns:
            phi = " [PHI]" if col.is_phi else ""
            lines.append(
                f"  - {col.name} ({col.data_type}, nullable={col.nullable}){phi}: {col.description}"
            )
            if col.valid_values:
                lines.append(f"    Valores válidos: {col.valid_values}")
        for rel in table.relationships_from:
            lines.append(
                f"  -> Unir {rel.from_column} com {rel.to_table_id}.{rel.to_column} ({rel.relationship_type})"
            )
        if include_samples:
            samples = parse_sample_rows(table.sample_rows)
            if samples:
                lines.append(f"  Linhas de amostra (até {MAX_SAMPLE_ROWS}, exemplos desidentificados):")
                for i, row in enumerate(samples, 1):
                    lines.append(f"    {i}. {json.dumps(row)}")
            else:
                lines.append("  Linhas de amostra: (nenhuma fornecida)")
        lines.append("")
    return "\n".join(lines)


PROJECT_CONTEXT_SECTIONS = (
    "data_sources",
    "study_population",
    "variables_endpoints",
    "methods_analysis",
    "responsible_ai",
)

SCRIPT_MAX_OUTPUT_TOKENS = 16_384


def _normalize_generated_script(script: str) -> str:
    cleaned = script.strip()
    if cleaned.startswith("```"):
        lines = cleaned.split("\n")
        cleaned = "\n".join(lines[1:])
        if cleaned.endswith("```"):
            cleaned = cleaned[:-3]
    cleaned = cleaned.strip()
    if SCRIPT_TEMPLATE_HEADER.strip() not in cleaned:
        cleaned = SCRIPT_TEMPLATE_HEADER + cleaned
    return cleaned


async def get_linked_project_context(db: AsyncSession, session: WizardSession) -> str:
    if not session.linked_project_id:
        return ""
    result = await db.execute(
        select(WizardSession).where(
            WizardSession.id == session.linked_project_id,
            WizardSession.wizard_type == WizardType.project_doc,
        )
    )
    project = result.scalar_one_or_none()
    if not project:
        return ""
    section_data = json.loads(project.section_data or "{}")
    lines = ["Contexto do documento do projeto vinculado:"]
    for key in PROJECT_CONTEXT_SECTIONS:
        raw = str(section_data.get(key, "") or "").strip()
        if not raw:
            continue
        label = SECTION_LABELS.get(key, key)
        lines.append(f"- {label}: {truncate_text(raw, 800)}")
    return "\n".join(lines) if len(lines) > 1 else ""


async def run_doc_intake(
    db: AsyncSession,
    session: WizardSession,
    user_message: str,
) -> str:
    section_data = json.loads(session.section_data or "{}")
    current_section = section_data.get("_current_section", PROJECT_DOC_SECTIONS[0])
    guidance = SECTION_GUIDANCE.get(current_section, "")

    messages = [
        {"role": "system", "content": DOC_SYSTEM_PROMPT},
        {
            "role": "system",
            "content": (
                f"Seção atual: {current_section} ({SECTION_LABELS.get(current_section, current_section)}). "
                f"Objetivo da seção: {guidance} "
                f"Resumo das seções já preenchidas:\n{section_context_summary(section_data)}\n"
                "Seja claro e objetivo. Se o pesquisador pedir listas, referências bibliográficas ou "
                "dados epidemiológicos, entregue a lista completa em português, sem cortar no meio. "
                "Caso contrário, prefira respostas curtas com até 2 perguntas de acompanhamento."
            ),
        },
    ]
    messages.extend(
        trim_chat_history(session.messages, channel="intake", section_key=current_section)
    )
    messages.append({"role": "user", "content": user_message})

    reply, _, _ = await llm_gateway.complete(
        messages,
        max_tokens=CHAT_MAX_OUTPUT_TOKENS,
        disable_reasoning=True,
    )
    session.llm_model_used = llm_gateway.model
    return reply


async def run_advisory_chat(
    db: AsyncSession,
    session: WizardSession,
    user_message: str,
) -> str:
    section_data = json.loads(session.section_data or "{}")
    summary = section_context_summary(section_data)

    messages = [
        {"role": "system", "content": ADVISORY_SYSTEM_PROMPT},
        {
            "role": "system",
            "content": (
                f"Resumo do documento do projeto (somente leitura, para contexto):\n{summary}\n"
                "Responda de forma clara: até 6 frases quando possível."
            ),
        },
    ]
    messages.extend(trim_chat_history(session.messages, channel="advisory"))
    messages.append({"role": "user", "content": user_message})

    reply, _, _ = await llm_gateway.complete(
        messages,
        max_tokens=CHAT_MAX_OUTPUT_TOKENS,
        disable_reasoning=True,
    )
    session.llm_model_used = llm_gateway.model
    return reply


async def extract_section_content(
    db: AsyncSession,
    session: WizardSession,
    section_key: str,
) -> dict:
    section_data = migrate_section_data(json.loads(session.section_data or "{}"))
    existing = str(section_data.get(section_key, "") or "").strip()
    messages = [
        {"role": "system", "content": DOC_SYSTEM_PROMPT},
        {
            "role": "system",
            "content": build_section_draft_instruction(
                section_key,
                existing_content=existing,
            ),
        },
    ]
    for msg in messages_for_channel(session.messages, "intake", section_key=section_key):
        messages.append({"role": msg.role, "content": msg.content})

    result, _, _, _ = await llm_gateway.complete_json(
        messages,
        max_tokens=SECTION_DRAFT_MAX_OUTPUT_TOKENS,
    )
    return normalize_section_draft_result(result)


async def split_full_text_into_sections(full_text: str) -> tuple[dict[str, str], str, dict]:
    if should_use_chunked_import(full_text):
        sections, debug = await split_long_text_into_sections(llm_gateway, full_text)
        debug["model"] = llm_gateway.model
        return sections, llm_gateway.model, debug

    section_spec = {
        key: SECTION_LABELS.get(key, key.replace("_", " ").title())
        for key in PROJECT_DOC_SECTIONS
    }
    keys_list = ", ".join(PROJECT_DOC_SECTIONS)
    system_content = (
        f"{DOC_SYSTEM_PROMPT}\n\n"
        "Divida o texto completo do documento do projeto do usuário em seções predefinidas. "
        "Use APENAS o texto fornecido. Não invente conteúdo. "
        f"Rótulos das seções: {json.dumps(section_spec, indent=2)}. "
        f"Você DEVE retornar um único objeto JSON usando EXATAMENTE estas chaves snake_case: {keys_list}. "
        "Cada valor deve ser uma string com o texto extraído para essa seção. "
        "Use string vazia se a seção não estiver presente no texto original."
    )
    messages = [
        {"role": "system", "content": system_content},
        {"role": "user", "content": full_text},
    ]
    result, raw_content, _, _ = await llm_gateway.complete_json(messages, max_tokens=16384)

    if "raw" in result and len(result) == 1:
        result = parse_json_object(str(result["raw"]))

    if "sections" in result and isinstance(result["sections"], dict):
        result = {**result, **result["sections"]}

    label_to_key = {
        key.lower(): key for key in PROJECT_DOC_SECTIONS
    }
    for key, label in SECTION_LABELS.items():
        label_to_key[label.lower()] = key
        label_to_key[label.lower().replace(" / ", "_").replace(" ", "_")] = key

    sections: dict[str, str] = {}
    for key in PROJECT_DOC_SECTIONS:
        value = result.get(key, "")
        if not value:
            for result_key, result_value in result.items():
                if str(result_key).startswith("_"):
                    continue
                normalized = str(result_key).lower().replace(" ", "_").replace("/", "_")
                if normalized == key or label_to_key.get(str(result_key).lower()) == key:
                    value = result_value
                    break
        sections[key] = coerce_section_value(value)

    debug = {
        "strategy": "single_json",
        "model": llm_gateway.model,
        "raw_length": len(raw_content),
        "raw_preview": raw_content[:800],
        "parsed_keys": [k for k in result.keys() if not str(k).startswith("_")],
        "filled_sections": count_filled_sections(sections),
        "input_length": len(full_text),
    }
    return sections, llm_gateway.model, debug


async def run_quality_check(session: WizardSession) -> dict:
    section_data = migrate_section_data(json.loads(session.section_data or "{}"))
    deterministic: dict[str, tuple[bool, str]] = {}
    for criterion in PROJECT_CRITERIA:
        if criterion.validate:
            deterministic[criterion.id] = criterion.validate(section_data)

    messages = [
        {"role": "system", "content": DOC_SYSTEM_PROMPT},
        {
            "role": "system",
            "content": (
                "Avalie as seções do documento do projeto com base nesta lista de verificação. "
                f"Lista: {all_criteria_labels()}. "
                'Retorne JSON: {"items": [{"item": "...", "passed": bool, "note": "..."}]}'
            ),
        },
        {"role": "user", "content": json.dumps(section_data, ensure_ascii=False)},
    ]
    result, _, _, _ = await llm_gateway.complete_json(messages)
    llm_by_label: dict[str, dict] = {}
    for entry in result.get("items", []):
        if isinstance(entry, dict) and entry.get("item"):
            llm_by_label[str(entry["item"])] = entry

    items = []
    for criterion in PROJECT_CRITERIA:
        passed = True
        note = ""
        if criterion.id in deterministic:
            passed, note = deterministic[criterion.id]
        llm_entry = llm_by_label.get(criterion.label, {})
        if llm_entry:
            if criterion.id not in deterministic:
                passed = bool(llm_entry.get("passed", passed))
            llm_note = str(llm_entry.get("note", "") or "").strip()
            if llm_note:
                note = llm_note
        items.append(
            {
                "id": criterion.id,
                "item": criterion.label,
                "passed": passed,
                "note": note,
                "step": criterion.step,
            }
        )
    return {"items": items}


async def run_clean_discussion(
    db: AsyncSession,
    session: WizardSession,
    user_message: str,
) -> str:
    schema_context = ""
    if session.dataset_id:
        schema_context = await get_schema_context(db, session.dataset_id, include_samples=False)

    project_context = await get_linked_project_context(db, session)
    messages = [
        {"role": "system", "content": CLEAN_SYSTEM_PROMPT},
        {"role": "system", "content": f"Estrutura do conjunto:\n{schema_context}"},
    ]
    if project_context:
        messages.append({"role": "system", "content": project_context})
    messages.append(
        {
            "role": "system",
            "content": (
                "Seja claro e objetivo. Se o pesquisador pedir listas ou referências, "
                "entregue a resposta completa em português, sem cortar no meio. "
                "Caso contrário, prefira respostas curtas com até 2 perguntas por turno."
            ),
        },
    )
    messages.extend(trim_chat_history(session.messages))
    messages.append({"role": "user", "content": user_message})

    reply, _, _ = await llm_gateway.complete(
        messages,
        max_tokens=CHAT_MAX_OUTPUT_TOKENS,
        disable_reasoning=True,
    )
    session.llm_model_used = llm_gateway.model
    return reply


async def run_clean_kickoff(db: AsyncSession, session: WizardSession) -> str:
    if not session.dataset_id:
        return "Selecione um conjunto de dados primeiro para explorar estrutura e amostras."

    schema_context = await get_schema_context(db, session.dataset_id, include_samples=True)
    project_context = await get_linked_project_context(db, session)
    messages = [
        {"role": "system", "content": CLEAN_SYSTEM_PROMPT},
        {"role": "system", "content": CLEAN_KICKOFF_PROMPT},
        {"role": "system", "content": f"Estrutura e amostras do conjunto:\n{schema_context}"},
    ]
    if project_context:
        messages.append({"role": "system", "content": project_context})
        messages.append({"role": "system", "content": CLEAN_KICKOFF_FROM_DOC_PROMPT})
    messages.append(
        {
            "role": "user",
            "content": (
                "Por favor, abra nossa sessão de engenharia de dados. "
                "Se houver documento do projeto vinculado, proponha um rascunho inicial de limpeza "
                "com coorte, joins e transformações derivadas do documento, seguido de 2 ou 3 perguntas de confirmação."
            ),
        },
    )
    reply, _, _ = await llm_gateway.complete(
        messages,
        max_tokens=CHAT_MAX_OUTPUT_TOKENS,
        disable_reasoning=True,
    )
    session.llm_model_used = llm_gateway.model

    if session.linked_project_id:
        result = await db.execute(
            select(WizardSession).where(
                WizardSession.id == session.linked_project_id,
                WizardSession.wizard_type == WizardType.project_doc,
            )
        )
        project = result.scalar_one_or_none()
        if project:
            section_data = json.loads(project.section_data or "{}")
            section_data["_cleaning_kickoff_from_doc"] = True
            project.section_data = json.dumps(section_data)

    return reply


async def generate_initial_clean_script(
    db: AsyncSession,
    session: WizardSession,
) -> str:
    if not session.dataset_id:
        raise RuntimeError("Selecione um conjunto de dados antes de gerar o rascunho inicial.")
    if not session.linked_project_id:
        raise RuntimeError("Nenhum projeto vinculado para basear o rascunho inicial.")

    project_context = await get_linked_project_context(db, session)
    if not project_context:
        raise RuntimeError(
            "O documento do projeto ainda não tem seções suficientes. "
            "Preencha fontes de dados, coorte, variáveis ou métodos antes de gerar o script."
        )

    schema_context = await get_schema_context(db, session.dataset_id, include_samples=False)
    messages = [
        {"role": "system", "content": CLEAN_SYSTEM_PROMPT},
        {"role": "system", "content": CLEAN_INITIAL_SCRIPT_PROMPT},
        {"role": "system", "content": f"Esquema do conjunto (metadados; dados sintéticos de demonstração):\n{schema_context}"},
        {"role": "system", "content": project_context},
        {
            "role": "user",
            "content": (
                "Gere o rascunho inicial completo do data_clean.py com base no plano de análise acima. "
                "Inclua imports, função main(), leitura das tabelas fonte e transformações sugeridas. "
                "Marque hipóteses não confirmadas com comentários TODO."
            ),
        },
    ]

    script, _, _ = await llm_gateway.complete(
        messages,
        temperature=0.1,
        max_tokens=SCRIPT_MAX_OUTPUT_TOKENS,
        disable_reasoning=True,
    )
    script = _normalize_generated_script(script)
    session.script_content = script
    session.llm_model_used = llm_gateway.model
    validation = validate_script(script)
    session.validation_result = json.dumps(validation)
    return script


async def generate_clean_script(
    db: AsyncSession,
    session: WizardSession,
) -> str:
    schema_context = ""
    if session.dataset_id:
        schema_context = await get_schema_context(db, session.dataset_id, include_samples=True)

    project_context = await get_linked_project_context(db, session)
    messages = [
        {"role": "system", "content": CLEAN_SYSTEM_PROMPT},
        {"role": "system", "content": f"Contexto do esquema:\n{schema_context}"},
    ]
    if project_context:
        messages.append({"role": "system", "content": project_context})
    messages.append(
        {
            "role": "system",
            "content": (
                "Gere um script data_clean.py completo com base na conversa. "
                "Use pandas e SQLAlchemy. Inclua uma função main(). "
                "IMPORTANTE: leia sempre das tabelas fonte originais do conjunto de dados (base zerada). "
                "Use somente tabelas e colunas listadas no contexto do esquema. "
                "Proibido: CREATE TABLE, ALTER TABLE, DROP, TRUNCATE ou qualquer DDL. "
                "Não crie tabelas novas no banco; produza DataFrames ou arquivos de saída. "
                "Não assuma que existe saída de limpeza anterior. Cada execução parte do bruto. "
                "Retorne APENAS código Python, sem blocos markdown."
            ),
        },
    )
    messages.extend(trim_chat_history(session.messages, max_messages=24, max_chars=4_000))
    messages.append(
        {
            "role": "user",
            "content": (
                "Com base na conversa acima, gere agora o script data_clean.py completo. "
                "Inclua imports, função main() e comentários breves por etapa."
            ),
        },
    )

    script, _, _ = await llm_gateway.complete(
        messages,
        temperature=0.1,
        max_tokens=SCRIPT_MAX_OUTPUT_TOKENS,
        disable_reasoning=True,
    )
    script = _normalize_generated_script(script)

    session.script_content = script
    session.llm_model_used = llm_gateway.model
    validation = validate_script(script)
    session.validation_result = json.dumps(validation)
    return script
