from fastapi import APIRouter, HTTPException
from app.services.document_service import document_service

router = APIRouter()

@router.post("/")
async def ingest_knowledge():
    try:
        # For the API endpoint, we assume the data is in the default directory
        directory_path = "data/knowledge_base"
        documents = document_service.load_documents_from_directory(directory_path)
        
        if not documents:
            return {"status": "success", "message": "No documents found to ingest."}
            
        doc_count, chunk_count = document_service.ingest_documents(documents)
        return {
            "status": "success",
            "message": "Ingestion completed successfully.",
            "documents_processed": doc_count,
            "chunks_created": chunk_count
        }
    except Exception as e:
        print(f"Ingestion error: {e}")
        raise HTTPException(status_code=500, detail="Internal server error during ingestion.")
