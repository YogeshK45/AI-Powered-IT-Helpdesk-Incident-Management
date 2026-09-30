import pytest
from app.services.embedding_service import embedding_service

def test_embedding_dimension():
    """Verify embedding dimension is exactly 384."""
    dim = embedding_service.get_dimension()
    assert dim == 384

def test_embed_vpn_query():
    """Verify query 'VPN connection problem' produces exactly 384 floating point values."""
    query = "VPN connection problem"
    embedding = embedding_service.embed_text(query)
    assert len(embedding) == 384
    assert isinstance(embedding[0], float)
    assert any(v != 0.0 for v in embedding)

def test_embed_singleton_model():
    """Verify model is loaded once and reused."""
    model_1 = embedding_service.model
    model_2 = embedding_service.model
    assert model_1 is model_2

def test_embed_empty_text():
    """Verify empty text returns zero vector."""
    vector = embedding_service.embed_text("")
    assert len(vector) == 384
    assert vector == [0.0] * 384

def test_embed_documents_batch():
    """Verify batch embedding works and matches dimensions."""
    texts = ["VPN issue", "SAP logon failure"]
    embeddings = embedding_service.embed_documents(texts)
    assert len(embeddings) == 2
    assert len(embeddings[0]) == 384
    assert len(embeddings[1]) == 384
