import os
import sys
from pathlib import Path

# Add project root to python path for script execution
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.services.document_service import document_service
from app.services.vector_service import vector_service
from app.core.config import settings

def main():
    directory_path = "data/knowledge_base"
    print("=" * 50)
    print("AI-POWERED IT HELPDESK - KNOWLEDGE INGESTION")
    print("=" * 50)
    print(f"Loading documents from {directory_path}...")
    
    try:
        documents = document_service.load_documents_from_directory(directory_path)
        if not documents:
            print("No documents found to ingest. Exiting.")
            return

        doc_count = len(documents)
        print(f"Found {doc_count} documents.")

        print("Executing Chunking, Embedding & Vector Upsertion...")
        doc_count, chunk_count = document_service.ingest_documents(documents)
        
        avg_chunks = chunk_count / doc_count if doc_count > 0 else 0

        # Section 4: Print ingestion statistics
        print("\n" + "=" * 50)
        print("INGESTION STATISTICS")
        print("=" * 50)
        print(f"Documents:\n{doc_count}\n")
        print(f"Total chunks:\n{chunk_count}\n")
        print(f"Average chunks/document:\n{avg_chunks:.1f}\n")

        # Section 5: Verify collection information
        collection_info = vector_service.get_collection_info()
        points_count = collection_info.points_count if collection_info else chunk_count

        print("=" * 50)
        print("QDRANT COLLECTION INFORMATION")
        print("=" * 50)
        print(f"Collection:\n{settings.QDRANT_COLLECTION_NAME}\n")
        print(f"Vector dimension:\n{settings.EMBEDDING_DIMENSION}\n")
        print("Distance:\nCOSINE\n")
        print(f"Points:\n{points_count}\n")
        print("=" * 50)
        print("Ingestion pipeline completed successfully.")
        
    except Exception as e:
        print(f"Error during ingestion pipeline execution: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
    finally:
        vector_service.close()

if __name__ == "__main__":
    main()
