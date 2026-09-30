import logging
from app.core.config import settings
from app.services.embedding_service import embedding_service
from app.services.vector_service import vector_service
from app.models.schemas import RetrievedChunk

logger = logging.getLogger("rag-backend.retrieval_service")

class RetrievalService:
    def retrieve(
        self,
        query: str,
        top_k: int = 5,
        category: str | None = None
    ) -> list[RetrievedChunk]:
        """
        Executes semantic similarity search against the Qdrant vector store.
        Filters candidates below settings.SIMILARITY_THRESHOLD and sorts descending.
        """
        if not query or not query.strip():
            logger.info("Empty query received; returning 0 results.")
            return []

        clean_query = query.strip()
        
        # 1. Generate query embedding
        query_vector = embedding_service.embed_text(clean_query)
        embedding_dim = len(query_vector)

        # 2. Search Qdrant vector store
        # Query with sufficient candidate headroom to evaluate against threshold
        candidate_limit = max(top_k * 2, 10)
        search_results = vector_service.search(
            query_vector=query_vector,
            top_k=candidate_limit,
            category=category
        )

        candidates_count = len(search_results)

        # 3. Filter by SIMILARITY_THRESHOLD from config (.env)
        retrieved_chunks: list[RetrievedChunk] = []
        for scored_point in search_results:
            if scored_point.score >= settings.SIMILARITY_THRESHOLD:
                payload = scored_point.payload or {}
                retrieved_chunks.append(
                    RetrievedChunk(
                        document_id=payload.get("document_id", ""),
                        title=payload.get("title", ""),
                        category=payload.get("category", ""),
                        subcategory=payload.get("subcategory", ""),
                        chunk_index=payload.get("chunk_index", 0),
                        content=payload.get("content", ""),
                        source=payload.get("source", ""),
                        score=round(float(scored_point.score), 4)
                    )
                )

        # 4. Sort descending by score and slice to top_k
        retrieved_chunks.sort(key=lambda x: x.score, reverse=True)
        final_results = retrieved_chunks[:top_k]

        # 5. Section 13: Development Logging
        top_id = final_results[0].document_id if final_results else "None"
        top_score = final_results[0].score if final_results else 0.0

        logger.info(
            f"\n--- RETRIEVAL DEBUG ---"
            f"\nQuery: {clean_query}"
            f"\nEmbedding dimension: {embedding_dim}"
            f"\nRetrieved candidates: {candidates_count}"
            f"\nAfter threshold filtering: {len(final_results)}"
            f"\nTop result: {top_id}"
            f"\nTop score: {top_score:.4f}"
            f"\n-----------------------"
        )
        print(
            f"[Retrieval] Query: '{clean_query}' | "
            f"Candidates: {candidates_count} | "
            f"Filtered (>= {settings.SIMILARITY_THRESHOLD}): {len(final_results)} | "
            f"Top: {top_id} ({top_score:.4f})"
        )

        return final_results

retrieval_service = RetrievalService()
