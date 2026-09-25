from typing import Optional
from pydantic import BaseModel, Field


class ChatRequest(BaseModel):
    pergunta: str = Field(
        ...,
        min_length=1,
        max_length=1000,
        description="Pergunta do usuário (até 1000 caracteres)",
    )


class Fonte(BaseModel):
    titulo: str
    tipo: str = ""
    ano: str = ""
    tema: str = ""
    link: str = ""


class ChatResponse(BaseModel):
    resposta: str
    fontes: list[Fonte]
