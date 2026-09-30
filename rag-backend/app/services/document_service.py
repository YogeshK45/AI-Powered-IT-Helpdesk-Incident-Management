import json
import os
from pathlib import Path
from app.models.schemas import KnowledgeDocument
from app.services.chunking_service import chunking_service
from app.services.embedding_service import embedding_service
from app.services.vector_service import vector_service

class DocumentService:
    def load_documents_from_directory(self, directory_path: str) -> list[KnowledgeDocument]:
        documents = []
        path = Path(directory_path)
        
        if not path.exists():
            return documents

        for file_path in path.glob('*.json'):
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    if isinstance(data, list):
                        for item in data:
                            documents.append(KnowledgeDocument(**item))
                    else:
                        documents.append(KnowledgeDocument(**data))
            except Exception as e:
                print(f"Error loading {file_path}: {e}")
                
        return documents

    def ingest_documents(self, documents: list[KnowledgeDocument]):
        all_chunks = []
        
        for doc in documents:
            chunks = chunking_service.chunk_document(doc)
            all_chunks.extend(chunks)
            
        if not all_chunks:
            return 0, 0
            
        texts = [chunk.content for chunk in all_chunks]
        embeddings = embedding_service.embed_documents(texts)
        
        vector_service.initialize_collection()
        vector_service.upsert_chunks(all_chunks, embeddings)
        
        return len(documents), len(all_chunks)

document_service = DocumentService()
