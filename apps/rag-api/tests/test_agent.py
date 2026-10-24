import os

from langchain_core.messages import AIMessage, HumanMessage, ToolMessage

# Mesmo motivo de tests/test_api.py: o grafo é construído no import.
os.environ.setdefault("GOOGLE_API_KEY", "test-key")
os.environ.setdefault("GOOGLE_GENAI_API_KEY", "test-key")

from agent import agent
from agent.utils import tools


class LLMQueSempreBusca:
    """Pede uma nova busca sempre que a tool está liberada."""

    def __init__(self, **_):
        self.tool_choices = []

    def bind_tools(self, tools, tool_choice=None):
        self.tool_choices.append(tool_choice)
        return self

    def invoke(self, messages):
        if self.tool_choices[-1] == "none":
            return AIMessage(content="Resposta final.")
        n = len(self.tool_choices)
        return AIMessage(
            content="",
            tool_calls=[{"name": "retrieve_information", "args": {"query": f"busca {n}"}, "id": f"call_{n}"}],
        )


def test_agente_para_de_buscar_no_limite(monkeypatch):
    llm = LLMQueSempreBusca()
    monkeypatch.setattr(agent, "ChatGoogleGenerativeAI", lambda **kwargs: llm)
    monkeypatch.setattr(tools, "search_documents", lambda query: [])

    result = agent.create_agent_graph().invoke({
        "messages": [HumanMessage(content="pergunta")],
        "confirmation": False,
    })

    buscas = [m for m in result["messages"] if isinstance(m, ToolMessage)]
    assert len(buscas) == agent.MAX_BUSCAS_AGENTE
    assert llm.tool_choices == [None] * agent.MAX_BUSCAS_AGENTE + ["none"]
    assert result["messages"][-1].text == "Resposta final."


def test_limite_conta_so_desde_a_ultima_pergunta():
    turno_anterior = [
        HumanMessage(content="primeira"),
        ToolMessage(content="", tool_call_id="a"),
        ToolMessage(content="", tool_call_id="b"),
        AIMessage(content="resposta"),
    ]
    turno_atual = [HumanMessage(content="segunda"), ToolMessage(content="", tool_call_id="c")]

    assert agent._buscas_desde_a_pergunta(turno_anterior + turno_atual) == 1
