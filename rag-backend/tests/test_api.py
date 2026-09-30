from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "healthy"}

def test_vector_db_health():
    response = client.get("/health/vector-db")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "collection" in data
    assert "points_count" in data

def test_rag_query_empty():
    response = client.post("/api/v1/rag/query", json={"query": ""})
    assert response.status_code in [400, 422]

def test_rag_retrieve_empty():
    response = client.post("/api/v1/rag/retrieve", json={"query": "   "})
    assert response.status_code in [400, 422]
