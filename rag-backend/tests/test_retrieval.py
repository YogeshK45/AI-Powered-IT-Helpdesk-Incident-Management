import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.services.retrieval_service import retrieval_service
from app.models.schemas import RetrievedChunk

client = TestClient(app)

def test_1_empty_query_rejected():
    """Requirement 1: Empty query rejected via API (400 / 422)."""
    # Empty string
    res1 = client.post("/api/v1/retrieve", json={"query": "", "top_k": 5})
    assert res1.status_code in [400, 422]

    # Whitespace only
    res2 = client.post("/api/v1/retrieve", json={"query": "   ", "top_k": 5})
    assert res2.status_code in [400, 422]

    # Also on /api/v1/rag/retrieve
    res3 = client.post("/api/v1/rag/retrieve", json={"query": ""})
    assert res3.status_code in [400, 422]

def test_2_embedding_dimension():
    """Requirement 2: Embedding dimension equals 384."""
    from app.services.embedding_service import embedding_service
    emb = embedding_service.embed_text("VPN connection problem")
    assert len(emb) == 384
    assert embedding_service.get_dimension() == 384

def test_3_chunk_metadata_exists():
    """Requirement 3: Retrieved results preserve complete metadata."""
    results = retrieval_service.retrieve("VPN connection problem", top_k=3)
    assert len(results) > 0
    for chunk in results:
        assert isinstance(chunk, RetrievedChunk)
        assert chunk.document_id.startswith("KB-")
        assert len(chunk.title) > 0
        assert len(chunk.category) > 0
        assert len(chunk.subcategory) > 0
        assert chunk.chunk_index >= 0
        assert len(chunk.content) > 0
        assert len(chunk.source) > 0
        assert isinstance(chunk.score, float)

def test_4_retrieval_returns_correct_schema():
    """Requirement 4: Retrieval API returns the expected response schema."""
    response = client.post(
        "/api/v1/retrieve",
        json={"query": "VPN is not connecting after password reset", "top_k": 3}
    )
    assert response.status_code == 200
    data = response.json()
    assert "query" in data
    assert "results" in data
    assert "count" in data
    assert data["count"] == len(data["results"])
    assert isinstance(data["results"], list)
    if data["results"]:
        top = data["results"][0]
        assert "document_id" in top
        assert "title" in top
        assert "category" in top
        assert "subcategory" in top
        assert "content" in top
        assert "score" in top

def test_5_results_sorted_by_score():
    """Requirement 5: Results are sorted by similarity score descending."""
    results = retrieval_service.retrieve("SAP login is failing", top_k=5)
    assert len(results) >= 2
    scores = [r.score for r in results]
    assert scores == sorted(scores, reverse=True), f"Scores not sorted descending: {scores}"

def test_6_similarity_threshold_works():
    """Requirement 6: Similarity threshold filters out chunks with score < threshold."""
    from app.core.config import settings
    results = retrieval_service.retrieve("VPN connection problem", top_k=5)
    for r in results:
        assert r.score >= settings.SIMILARITY_THRESHOLD, f"Score {r.score} < threshold {settings.SIMILARITY_THRESHOLD}"

def test_7_category_filter_works():
    """Requirement 7: Category filtering restricts results to the specified category."""
    # Filter by category VPN
    results_vpn = retrieval_service.retrieve("connection problem", top_k=5, category="VPN")
    assert len(results_vpn) > 0
    for r in results_vpn:
        assert r.category == "VPN", f"Expected category VPN, got {r.category}"

    # Filter via API
    api_res = client.post(
        "/api/v1/retrieve",
        json={"query": "connection problem", "top_k": 5, "category": "VPN"}
    )
    assert api_res.status_code == 200
    api_data = api_res.json()
    for item in api_data["results"]:
        assert item["category"] == "VPN"

def test_8_irrelevant_query_returns_zero_results():
    """Requirement 8: Irrelevant query returns zero results and appropriate message."""
    # Negative test query
    res = client.post("/api/v1/retrieve", json={"query": "How do I cook pasta?", "top_k": 5})
    assert res.status_code == 200
    data = res.json()
    assert data["count"] == 0
    assert len(data["results"]) == 0
    assert data["message"] == "No sufficiently relevant knowledge was found."

def test_9_top_k_validation_works():
    """Requirement 9: top_k must be between 1 and 10."""
    # Invalid: top_k = 0
    res_zero = client.post("/api/v1/retrieve", json={"query": "printer error", "top_k": 0})
    assert res_zero.status_code in [400, 422]

    # Invalid: top_k = 11
    res_large = client.post("/api/v1/retrieve", json={"query": "printer error", "top_k": 11})
    assert res_large.status_code in [400, 422]

    # Valid: top_k = 1
    res_one = client.post("/api/v1/retrieve", json={"query": "printer error", "top_k": 1})
    assert res_one.status_code == 200
    assert len(res_one.json()["results"]) <= 1

    # Valid: top_k = 10
    res_ten = client.post("/api/v1/retrieve", json={"query": "printer error", "top_k": 10})
    assert res_ten.status_code == 200
    assert len(res_ten.json()["results"]) <= 10
