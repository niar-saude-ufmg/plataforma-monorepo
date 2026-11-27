from types import SimpleNamespace

from app.core import config


def test_relative_exports_use_workspace_and_return_absolute_paths(tmp_path, monkeypatch):
    workspace = tmp_path / "workspace"
    caller = tmp_path / "other-app"
    caller.mkdir()
    monkeypatch.chdir(caller)
    monkeypatch.setattr(config, "_WORKSPACE_ROOT", workspace)
    monkeypatch.setattr(config, "get_settings", lambda: SimpleNamespace(exports_dir="./exports"))

    result = config.get_exports_dir()

    assert result == workspace / "exports"
    assert result.is_absolute()
    assert result.is_dir()
    assert list(result.iterdir()) == []
    assert not (caller / "exports").exists()
