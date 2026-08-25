"""Build submission bundles (project plan + data engineering script)."""

from __future__ import annotations

import zipfile
from datetime import datetime, timezone
from io import BytesIO


def build_submission_zip(
    *,
    project_title: str,
    project_id: int,
    cleaning_session_id: int,
    user_email: str,
    docx_bytes: bytes,
    script_content: str,
    model_used: str,
) -> bytes:
    submitted_at = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC")
    readme = f"""Submissão para avaliação — Assistente de Pesquisa em Saúde

Projeto: {project_title}
ID do projeto: {project_id}
ID da engenharia de dados: {cleaning_session_id}
Autor: {user_email}
Modelo de IA: {model_used}
Data da submissão: {submitted_at}

Conteúdo do pacote:
- projeto.docx — plano de análise e documento do estudo
- data_clean.py — script de engenharia de dados

Revise ambos os artefatos antes de aprovar a execução em ambiente de produção.
"""
    buffer = BytesIO()
    with zipfile.ZipFile(buffer, "w", zipfile.ZIP_DEFLATED) as archive:
        archive.writestr("LEIA-ME.txt", readme)
        archive.writestr("projeto.docx", docx_bytes)
        archive.writestr("data_clean.py", script_content)
    return buffer.getvalue()
