import os
import uuid
import hashlib
import logging
from qdrant_client import QdrantClient
from qdrant_client.http import models as qmodels
from app.core.config import settings
from app.models.schemas import DocumentChunk

logger = logging.getLogger("rag-backend.vector_service")

class VectorService:
    def __init__(self):
        self.collection_name = settings.QDRANT_COLLECTION_NAME
        self.dimension = settings.EMBEDDING_DIMENSION
        self.client = self._init_client()

    def _init_client(self) -> QdrantClient:
        url = settings.QDRANT_URL
        api_key = settings.QDRANT_API_KEY if settings.QDRANT_API_KEY and settings.QDRANT_API_KEY.strip() else None
        if url.startswith("http://") or url.startswith("https://"):
            try:
                # Test connectivity to remote Qdrant
                client = QdrantClient(url=url, api_key=api_key, timeout=2.0)
                client.get_collections()
                logger.info(f"Connected to Qdrant server at {url}")
                return client
            except Exception as e:
                logger.warning(
                    f"Could not connect to Qdrant server at {url}: {e}. "
                    "Falling back to embedded local storage at ./data/qdrant_storage"
                )
                os.makedirs("./data/qdrant_storage", exist_ok=True)
                return QdrantClient(path="./data/qdrant_storage")
        elif url == ":memory:":
            logger.info("Using in-memory Qdrant instance")
            return QdrantClient(location=":memory:")
        else:
            logger.info(f"Using local file Qdrant storage at {url}")
            os.makedirs(url, exist_ok=True)
            return QdrantClient(path=url)

    def close(self):
        try:
            self.client.close()
        except Exception:
            pass

    def initialize_collection(self):
        """
        Verify collection exists. If not, create it. Do not delete if already exists.
        """
        try:
            collections = self.client.get_collections().collections
            exists = any(c.name == self.collection_name for c in collections)

            if not exists:
                logger.info(f"Creating Qdrant collection: {self.collection_name} (dim={self.dimension})")
                self.client.create_collection(
                    collection_name=self.collection_name,
                    vectors_config=qmodels.VectorParams(
                        size=self.dimension,
                        distance=qmodels.Distance.COSINE
                    )
                )
            else:
                logger.info(f"Qdrant collection '{self.collection_name}' already exists. Preserving existing collection.")
        except Exception as e:
            logger.error(f"Error initializing Qdrant collection: {e}")
            raise

    def upsert_chunks(self, chunks: list[DocumentChunk], embeddings: list[list[float]]):
        """
        Upsert chunks into Qdrant using deterministic IDs (document_id + chunk_index).
        Guarantees idempotence: running multiple times does not produce duplicate points.
        """
        points = []
        for chunk, emb in zip(chunks, embeddings):
            # Deterministic UUID based on document_id and chunk_index
            id_str = f"{chunk.document_id}_{chunk.chunk_index}"
            point_id = str(uuid.UUID(hashlib.md5(id_str.encode()).hexdigest()))

            points.append(qmodels.PointStruct(
                id=point_id,
                vector=emb,
                payload=chunk.model_dump()
            ))

        self.client.upsert(
            collection_name=self.collection_name,
            points=points
        )
        logger.info(f"Successfully upserted {len(points)} chunks into '{self.collection_name}'.")

    def search(self, query_vector: list[float], top_k: int = 5, category: str = None):
        """
        Perform semantic similarity search with optional category filter.
        Supports both modern qdrant-client query_points and legacy search API.
        """
        query_filter = None
        if category:
            query_filter = qmodels.Filter(
                must=[
                    qmodels.FieldCondition(
                        key="category",
                        match=qmodels.MatchValue(value=category)
                    )
                ]
            )

        if hasattr(self.client, "query_points"):
            result = self.client.query_points(
                collection_name=self.collection_name,
                query=query_vector,
                query_filter=query_filter,
                limit=top_k
            )
            return result.points
        else:
            return self.client.search(
                collection_name=self.collection_name,
                query_vector=query_vector,
                query_filter=query_filter,
                limit=top_k
            )

    def delete_document(self, document_id: str):
        self.client.delete(
            collection_name=self.collection_name,
            points_selector=qmodels.FilterSelector(
                filter=qmodels.Filter(
                    must=[
                        qmodels.FieldCondition(
                            key="document_id",
                            match=qmodels.MatchValue(value=document_id)
                        )
                    ]
                )
            )
        )

    def get_collection_info(self):
        try:
            return self.client.get_collection(self.collection_name)
        except Exception:
            return None

vector_service = VectorService()
