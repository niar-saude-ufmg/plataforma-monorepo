from app.main import create_app


def test_assistente_routes_use_public_namespace() -> None:
    paths = {route.path for route in create_app().routes}

    assert "/api/assistente/projects" in paths
    assert "/api/assistente/auth/me" in paths
    assert "/api/projects" not in paths
    assert "/api/auth/me" not in paths


def test_assistente_does_not_expose_login_endpoints() -> None:
    paths = {route.path for route in create_app().routes}

    assert "/api/assistente/auth/login" not in paths
    assert "/api/assistente/auth/login/json" not in paths
    assert "/api/auth/login" not in paths
    assert "/api/auth/login/json" not in paths
