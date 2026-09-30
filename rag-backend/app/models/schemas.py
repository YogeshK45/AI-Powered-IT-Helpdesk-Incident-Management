from pydantic import BaseModel, Field, field_validator
from typing import List, Optional

class KnowledgeDocument(BaseModel):
    document_id: str
    title: str
    category: str
    subcategory: str
    content: str
    summary: str
    tags: List[str]
    source: str
    last_updated: str

class DocumentChunk(BaseModel):
    document_id: str
    title: str
    category: str
    subcategory: str
    source: str
    tags: List[str]
    chunk_index: int
    content: str
    last_updated: str

class RetrievalQuery(BaseModel):
    query: str = Field(..., min_length=1, description="Search query string (cannot be empty)")
    top_k: int = Field(5, ge=1, le=10, description="Number of results to retrieve (between 1 and 10)")
    category: Optional[str] = Field(None, description="Optional category filter (e.g., 'VPN', 'SAP', 'Network')")

    @field_validator("query")
    @classmethod
    def validate_query_not_empty(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError("Query cannot be empty or whitespace only.")
        return v.strip()

class RetrievedChunk(BaseModel):
    document_id: str
    title: str
    category: str
    subcategory: str
    chunk_index: int
    content: str
    source: str
    score: float

class RetrievalResponse(BaseModel):
    query: str
    results: List[RetrievedChunk]
    count: int
    message: Optional[str] = None

class RagSourceItem(BaseModel):
    document_id: str
    title: str
    score: float

class RagQueryResponse(BaseModel):
    query: str
    answer: Optional[str] = None
    grounded: bool = False
    confidence: float = 0.0
    sources: List[RagSourceItem] = Field(default_factory=list)
    retrieved_chunks: int = 0
    error: Optional[str] = None

class IncidentAnalyzeRequest(BaseModel):
    ticket_id: str
    title: str
    description: str
    category: Optional[str] = None
    priority: Optional[str] = None

class IncidentAnalyzeResponse(BaseModel):
    ticket_id: str
    classification: str
    issue_type: str
    recommended_priority: str
    recommended_team: str
    summary: str
    recommended_resolution: str
    confidence: float
    knowledge_sources: List[dict]
