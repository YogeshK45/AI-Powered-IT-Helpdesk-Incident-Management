from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import health, rag, ingest
from app.models import schemas

app = FastAPI(
    title="IT Helpdesk RAG API",
    description="RAG Backend for AI-Powered IT Helpdesk & Incident Management System",
    version="1.0.0"
)

# CORS configuration to allow frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Health Router
app.include_router(health.router, prefix="/health", tags=["Health"])

# Direct POST /api/v1/retrieve endpoint as specified in requirements
app.add_api_route(
    "/api/v1/retrieve",
    rag.retrieve_knowledge,
    methods=["POST"],
    response_model=schemas.RetrievalResponse,
    tags=["Retrieval"],
    summary="Semantic Knowledge Retrieval",
    description="Main retrieval endpoint for searching relevant knowledge chunks using cosine semantic similarity."
)

# Include API Routers
app.include_router(ingest.router, prefix="/api/v1/ingest", tags=["Ingestion"])
app.include_router(rag.router, prefix="/api/v1/rag", tags=["RAG"])

@app.on_event("startup")
async def startup_event():
    print("Starting up IT Helpdesk RAG API...")
    # Trigger model loading
    from app.services.embedding_service import embedding_service
    _ = embedding_service.model
    print("Embedding model loaded successfully.")

    # Ensure collection exists
    from app.services.vector_service import vector_service
    try:
        vector_service.initialize_collection()
        print("Vector database collection checked/initialized.")
    except Exception as e:
        print(f"Vector DB collection notice: {e}")
