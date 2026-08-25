from app.services.submission.bundle import build_submission_zip
import zipfile
from io import BytesIO


def test_build_submission_zip_contains_project_and_script():
    zip_bytes = build_submission_zip(
        project_title="Estudo Teste",
        project_id=1,
        cleaning_session_id=2,
        user_email="user@example.com",
        docx_bytes=b"docx-content",
        script_content="print('ok')",
        model_used="test-model",
    )
    with zipfile.ZipFile(BytesIO(zip_bytes)) as archive:
        names = set(archive.namelist())
    assert "projeto.docx" in names
    assert "data_clean.py" in names
    assert "LEIA-ME.txt" in names
