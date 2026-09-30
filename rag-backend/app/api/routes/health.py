from fastapi import APIRouter
from app.services.vector_service import vector_service

router = APIRouter()

@router.get("", summary="System Health Check", description="Returns health status of the RAG backend.")
@router.get("/", include_in_schema=False)
def health_check():
    return {"status": "healthy"}

@router.get("/vector-db", summary="Vector Database Health Check", description="Checks connectivity and statistics of the Qdrant vector database.")
def vector_db_health():
    info = vector_service.get_collection_info()
    if info:
        points_count = getattr(info, "points_count", 0)
        return {
            "status": "healthy",
            "collection": vector_service.collection_name,
            "points_count": points_count
        }
    return {"status": "unhealthy", "message": "Could not retrieve collection info."}
