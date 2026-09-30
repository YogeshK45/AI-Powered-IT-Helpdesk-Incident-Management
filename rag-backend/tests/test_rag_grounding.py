import pytest
from unittest.mock import AsyncMock, patch
from fastapi.testclient import TestClient
from app.main import app
from app.services.rag_service import rag_service, NO_CONTEXT_ANSWER
from app.models.schemas import RagQueryResponse, RetrievedChunk

client = TestClient(app)

MOCK_LLM_ANSWER = """Summary
User cannot establish VPN connection following a password change.

Likely Cause
The client is attempting authentication using cached credentials or the account is locked in AD.

Recommended Troubleshooting
1. Clear cached VPN credentials in Cisco AnyConnect.
2. Confirm new password is entered with full UPN.
3. Check Active Directory for account lockout.

Recommended Resolution
Update credentials in VPN client and reconnect.

Escalation Condition
Escalate to Network Operations if VPN gateway remains unreachable."""

@pytest.mark.asyncio
async def test_1_retrieved_context_passed_to_llm():
    """Requirement 1: Retrieved context is passed into the LLM prompt."""
    with patch("app.services.rag_service.llm_service.generate", new_callable=AsyncMock) as mock_llm:
        mock_llm.return_value = MOCK_LLM_ANSWER

        response = await rag_service.answer_query("VPN is not connecting after changing password", top_k=3)

        assert mock_llm.called, "LLM generate should have been called"
        call_args = mock_llm.call_args[0]
        system_prompt, user_prompt = call_args[0], call_args[1]

        # Verify ground rules in system prompt
        assert "GROUNDING RULES" in system_prompt
        # Verify retrieved context was passed in user prompt
        assert "KB-1001" in user_prompt
        assert "Retrieved Knowledge" in user_prompt
        assert response.grounded is True

@pytest.mark.asyncio
async def test_2_sources_come_from_retrieval_results():
    """Requirement 2: Sources come strictly from retrieval results."""
    with patch("app.services.rag_service.llm_service.generate", new_callable=AsyncMock) as mock_llm:
        mock_llm.return_value = MOCK_LLM_ANSWER

        response = await rag_service.answer_query("Office printer is not reachable", top_k=3)

        assert len(response.sources) > 0
        doc_ids = [s.document_id for s in response.sources]
        assert "KB-1007" in doc_ids
        for s in response.sources:
            assert s.document_id.startswith("KB-")
            assert isinstance(s.score, float)

@pytest.mark.asyncio
async def test_3_no_context_queries_do_not_call_llm():
    """Requirement 3: No-context queries do NOT call the LLM."""
    with patch("app.services.rag_service.llm_service.generate", new_callable=AsyncMock) as mock_llm:
        # Out-of-domain query with no relevant documents above threshold
        response = await rag_service.answer_query("How do I cook pasta?", top_k=5)

        assert not mock_llm.called, "LLM must NOT be called when retrieval returns no relevant context"
        assert response.grounded is False
        assert response.sources == []
        assert response.confidence == 0.0
        assert response.retrieved_chunks == 0
        assert response.answer == NO_CONTEXT_ANSWER

def test_4_empty_queries_rejected():
    """Requirement 4: Empty queries are rejected with validation error."""
    # API validation test for empty query
    res_empty = client.post("/api/v1/rag/query", json={"query": ""})
    assert res_empty.status_code in [400, 422]

    # Whitespace only
    res_spaces = client.post("/api/v1/rag/query", json={"query": "     "})
    assert res_spaces.status_code in [400, 422]

@pytest.mark.asyncio
async def test_5_grounded_response_contains_sources():
    """Requirement 5: Grounded response contains valid sources."""
    with patch("app.services.rag_service.llm_service.generate", new_callable=AsyncMock) as mock_llm:
        mock_llm.return_value = MOCK_LLM_ANSWER

        response = await rag_service.answer_query("Corporate DNS is not resolving", top_k=3)

        assert response.grounded is True
        assert len(response.sources) >= 1
        assert response.sources[0].document_id == "KB-1004"
        assert response.confidence > 0.35

@pytest.mark.asyncio
async def test_6_document_ids_cannot_be_invented():
    """Requirement 6: Source layer cannot invent document IDs even if LLM hallucinated one."""
    hallucinated_llm_answer = (
        "Summary: Refer to document KB-9999 and KB-FAKE for resolution.\n"
        "Likely Cause: Mystery fault.\n"
        "Recommended Troubleshooting: Reboot.\n"
        "Recommended Resolution: None.\n"
        "Escalation Condition: None."
    )
    with patch("app.services.rag_service.llm_service.generate", new_callable=AsyncMock) as mock_llm:
        mock_llm.return_value = hallucinated_llm_answer

        response = await rag_service.answer_query("VPN connection problem", top_k=3)

        # Sources must come from retrieval, not the LLM's hallucinated KB-9999
        source_ids = [s.document_id for s in response.sources]
        assert "KB-9999" not in source_ids
        assert "KB-FAKE" not in source_ids
        assert "KB-1001" in source_ids

@pytest.mark.asyncio
async def test_7_retrieval_scores_preserved():
    """Requirement 7: Retrieval similarity scores are preserved in sources."""
    with patch("app.services.rag_service.llm_service.generate", new_callable=AsyncMock) as mock_llm:
        mock_llm.return_value = MOCK_LLM_ANSWER

        response = await rag_service.answer_query("SAP login is failing", top_k=3)

        assert response.confidence > 0.0
        assert len(response.sources) > 0
        for s in response.sources:
            assert s.score > 0.35
            assert s.score <= 1.0

def test_8_rag_response_schema_is_valid():
    """Requirement 8: RAG response schema is fully valid against Pydantic model."""
    res = client.post(
        "/api/v1/rag/query",
        json={"query": "How do I cook pasta?", "top_k": 3}
    )
    assert res.status_code == 200
    data = res.json()
    model = RagQueryResponse(**data)
    assert model.query == "How do I cook pasta?"
    assert model.grounded is False
    assert model.confidence == 0.0
    assert model.sources == []
    assert model.retrieved_chunks == 0
