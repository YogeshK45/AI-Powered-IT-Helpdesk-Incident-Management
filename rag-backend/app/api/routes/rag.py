import logging
from fastapi import APIRouter, HTTPException
from app.models.schemas import (
    RetrievalQuery,
    RetrievalResponse,
    RagQueryResponse,
    IncidentAnalyzeRequest,
    IncidentAnalyzeResponse
)
from app.services.retrieval_service import retrieval_service
from app.services.rag_service import rag_service

logger = logging.getLogger("rag-backend.api.rag")
router = APIRouter()

@router.post(
    "/retrieve",
    response_model=RetrievalResponse,
    summary="Semantic Knowledge Retrieval",
    description="Performs semantic vector similarity search against the IT Helpdesk Knowledge Base with optional category filtering and similarity thresholding."
)
async def retrieve_knowledge(request: RetrievalQuery):
    if not request.query or not request.query.strip():
        raise HTTPException(status_code=400, detail="Query cannot be empty.")

    try:
        results = retrieval_service.retrieve(
            query=request.query,
            top_k=request.top_k,
            category=request.category
        )
        
        message = None
        if not results:
            message = "No sufficiently relevant knowledge was found."

        return RetrievalResponse(
            query=request.query,
            results=results,
            count=len(results),
            message=message
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error during retrieval: {e}")
        raise HTTPException(status_code=500, detail="Internal server error during retrieval.")

@router.post(
    "/query",
    response_model=RagQueryResponse,
    summary="RAG Question Answering",
    description="Answers user IT queries grounded on retrieved knowledge chunks."
)
async def query_rag(request: RetrievalQuery):
    if not request.query or not request.query.strip():
        raise HTTPException(status_code=400, detail="Query cannot be empty.")

    try:
        response = await rag_service.answer_query(request.query, top_k=request.top_k)
        return response
    except Exception as e:
        logger.error(f"Error in RAG query: {e}")
        raise HTTPException(status_code=500, detail="Internal server error during RAG query.")

@router.post(
    "/analyze-incident",
    response_model=IncidentAnalyzeResponse,
    summary="Incident Ticket Analysis",
    description="Analyzes an incoming IT helpdesk ticket, categorizes it, and recommends resolution steps."
)
async def analyze_incident(request: IncidentAnalyzeRequest):
    if not request.title.strip() and not request.description.strip():
        raise HTTPException(status_code=400, detail="Incident title or description must be provided.")

    try:
        response = await rag_service.analyze_incident(request)
        return response
    except Exception as e:
        logger.error(f"Error in incident analysis: {e}")
        raise HTTPException(status_code=500, detail="Internal server error during incident analysis.")
