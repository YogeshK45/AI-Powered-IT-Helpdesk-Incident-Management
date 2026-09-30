import logging
from app.services.retrieval_service import retrieval_service
from app.services.llm_service import llm_service, LLMServiceError
from app.models.schemas import (
    RagQueryResponse,
    RagSourceItem,
    RetrievedChunk,
    IncidentAnalyzeRequest,
    IncidentAnalyzeResponse
)

logger = logging.getLogger("rag-backend.rag_service")

# Section 3: Grounded System Prompt
GROUNDED_SYSTEM_PROMPT = """You are an IT Helpdesk AI assistant.

You assist support engineers using the provided IT Helpdesk Knowledge Base.

GROUNDING RULES:

1. Use the retrieved knowledge as the primary source for your answer.
2. Do not invent troubleshooting procedures, commands, policies, configurations, or facts.
3. Do not claim that an action has been performed.
4. Do not claim that a ticket has been resolved, assigned, closed, or escalated.
5. If the retrieved knowledge is insufficient, explicitly say that the available knowledge base does not contain enough information.
6. Do not use unrelated retrieved documents.
7. Keep recommendations practical and technically clear.
8. Reference the relevant knowledge articles used to generate the answer.
9. The support engineer remains responsible for deciding and applying the recommendation.

Return the response in this structure:

Summary
Likely Cause
Recommended Troubleshooting
Recommended Resolution
Escalation Condition"""

NO_CONTEXT_ANSWER = (
    "I could not find sufficient information in the IT Helpdesk Knowledge Base to answer this incident confidently. "
    "Please provide additional incident details or escalate the issue to the appropriate support team."
)

def build_context(retrieved_chunks: list[RetrievedChunk]) -> str:
    """
    Section 4: Context Builder
    Builds a clean, structured context string from retrieved knowledge chunks.
    Makes it explicit to the LLM which knowledge documents and contents were retrieved.
    """
    context_blocks = []
    for chunk in retrieved_chunks:
        block = (
            f"Knowledge Source:\n{chunk.document_id}\n\n"
            f"Title:\n{chunk.title}\n\n"
            f"Category:\n{chunk.category}\n\n"
            f"Content:\n{chunk.content}"
        )
        context_blocks.append(block)

    return "\n\n---\n\n".join(context_blocks)

class RagService:
    async def answer_query(self, query: str, top_k: int = 5) -> RagQueryResponse:
        """
        Executes the full RAG pipeline:
        Query -> Semantic Retrieval -> Context Builder -> Grounded LLM Prompt -> Grounded Answer.
        """
        # 1. Query validation
        if not query or not query.strip():
            logger.warning("RAG query received is empty or whitespace.")
            return RagQueryResponse(
                query=query or "",
                answer=NO_CONTEXT_ANSWER,
                grounded=False,
                confidence=0.0,
                sources=[],
                retrieved_chunks=0
            )

        clean_query = query.strip()
        logger.info(f"RAG query received: '{clean_query}' (top_k={top_k})")

        # 2. Retrieve knowledge chunks from vector store
        retrieved_chunks = retrieval_service.retrieve(clean_query, top_k=top_k)
        retrieved_count = len(retrieved_chunks)
        logger.info(f"Retrieved chunk count: {retrieved_count}")

        # 3. Section 6: No-Context Behavior
        # If no chunks passed the similarity threshold, do NOT call the LLM!
        if not retrieved_chunks:
            logger.info("No relevant chunks retrieved above threshold; skipping LLM call.")
            return RagQueryResponse(
                query=clean_query,
                answer=NO_CONTEXT_ANSWER,
                grounded=False,
                confidence=0.0,
                sources=[],
                retrieved_chunks=0
            )

        # 4. Deterministic Confidence Strategy:
        # Confidence is derived directly from the highest retrieval similarity score among the
        # filtered chunks (cosine similarity against all-MiniLM-L6-v2 embeddings).
        # This provides a transparent, deterministic measure of query-to-knowledge alignment.
        top_score = max(c.score for c in retrieved_chunks)
        confidence = round(float(top_score), 4)
        logger.info(f"Top retrieval score: {top_score:.4f}")

        # 5. Extract and deduplicate source metadata from retrieval results
        # Do NOT allow LLM to invent document IDs - sources come strictly from retrieval
        sources_map: dict[str, RagSourceItem] = {}
        for chunk in retrieved_chunks:
            doc_id = chunk.document_id
            if doc_id not in sources_map:
                sources_map[doc_id] = RagSourceItem(
                    document_id=doc_id,
                    title=chunk.title,
                    score=chunk.score
                )
            else:
                # Keep highest score if multiple chunks from the same document were retrieved
                if chunk.score > sources_map[doc_id].score:
                    sources_map[doc_id].score = chunk.score

        unique_sources = list(sources_map.values())
        # Sort sources descending by score
        unique_sources.sort(key=lambda s: s.score, reverse=True)

        # 6. Build Grounded Context
        context_str = build_context(retrieved_chunks)

        user_prompt = (
            f"User Incident:\n{clean_query}\n\n"
            f"Retrieved Knowledge:\n{context_str}\n\n"
            f"Generate a grounded troubleshooting recommendation adhering strictly to the required structure."
        )

        # 7. Call LLM Service
        logger.info("LLM generation started")
        try:
            answer = await llm_service.generate(GROUNDED_SYSTEM_PROMPT, user_prompt)
            logger.info("LLM generation completed")
            logger.info("RAG response generated")

            return RagQueryResponse(
                query=clean_query,
                answer=answer,
                grounded=True,
                confidence=confidence,
                sources=unique_sources,
                retrieved_chunks=retrieved_count
            )

        except (LLMServiceError, Exception) as exc:
            logger.error(f"LLM generation failed: {exc}")
            # Section 17: Return controlled error without fabricating an answer
            return RagQueryResponse(
                query=clean_query,
                answer=None,
                grounded=False,
                confidence=confidence,
                sources=unique_sources,
                retrieved_chunks=retrieved_count,
                error="AI generation service is currently unavailable."
            )

    async def analyze_incident(self, request: IncidentAnalyzeRequest) -> IncidentAnalyzeResponse:
        """
        Analyzes an incident ticket using the knowledge base.
        """
        query = f"Title: {request.title}\nDescription: {request.description}"
        rag_response = await self.answer_query(query, top_k=5)

        classification = "Hardware Issue"
        recommended_team = "End User Computing"
        recommended_priority = "Medium"
        issue_type = "General"

        lower_desc = (request.description or "").lower()
        if "vpn" in lower_desc:
            classification = "VPN Connectivity"
            recommended_team = "Network Operations"
            recommended_priority = "High"
            issue_type = "Authentication / VPN Client"
        elif "sap" in lower_desc and ("auth" in lower_desc or "access" in lower_desc):
            classification = "SAP Security"
            recommended_team = "SAP Security"
            recommended_priority = "High"
            issue_type = "Authorization"
        elif "printer" in lower_desc:
            classification = "Printer Error"
            recommended_team = "Facilities IT"
            recommended_priority = "Low"
            issue_type = "Peripheral"

        sources_dicts = [s.model_dump() for s in rag_response.sources]

        return IncidentAnalyzeResponse(
            ticket_id=request.ticket_id,
            classification=classification,
            issue_type=issue_type,
            recommended_priority=request.priority or recommended_priority,
            recommended_team=recommended_team,
            summary=f"Incident regarding {classification}",
            recommended_resolution=rag_response.answer or "Please refer to the knowledge sources for standard troubleshooting.",
            confidence=rag_response.confidence,
            knowledge_sources=sources_dicts
        )

rag_service = RagService()
