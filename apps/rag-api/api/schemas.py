from typing import Optional
from pydantic import BaseModel, Field


class ChatRequest(BaseModel):
    pergunta: str = Field(..., min_length=1, description="Pergunta do usuário")


class Fonte(BaseModel):
    titulo: str
    tipo: str = ""
    ano: str = ""
    tema: str = ""
    link: str = ""


class ChatResponse(BaseModel):
    resposta: str
    fontes: list[Fonte]
