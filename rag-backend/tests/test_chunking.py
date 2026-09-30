import pytest
from app.models.schemas import KnowledgeDocument, DocumentChunk
from app.services.chunking_service import chunking_service
from app.services.document_service import document_service

def test_chunking_metadata_preservation():
    """Verify that every chunk preserves all required metadata fields."""
    doc = KnowledgeDocument(
        document_id="KB-TEST-01",
        title="Test Troubleshooting Guide",
        category="TestCategory",
        subcategory="TestSubcategory",
        content=(
            "Problem Overview\nTest troubleshooting overview for verifying chunking.\n\n"
            "Step 1: Diagnostic Verification\nCheck system connectivity and IP address.\n\n"
            "Step 2: Resolution Workflow\nRestart the affected service and verify status.\n\n"
            "Step 3: Verification\nConfirm resolution with end user and close ticket."
        ),
        summary="Test summary",
        tags=["test", "guide", "diagnostic"],
        source="IT Knowledge Base",
        last_updated="2026-09-01"
    )

    chunks = chunking_service.chunk_document(doc)
    assert len(chunks) >= 1

    for chunk in chunks:
        assert isinstance(chunk, DocumentChunk)
        assert chunk.document_id == "KB-TEST-01"
        assert chunk.title == "Test Troubleshooting Guide"
        assert chunk.category == "TestCategory"
        assert chunk.subcategory == "TestSubcategory"
        assert chunk.source == "IT Knowledge Base"
        assert "test" in chunk.tags
        assert chunk.chunk_index >= 0
        assert len(chunk.content.strip()) > 0

def test_chunking_all_kb_articles_produce_multiple_chunks():
    """Verify all 10 knowledge documents in the knowledge base produce multiple chunks."""
    docs = document_service.load_documents_from_directory("data/knowledge_base")
    assert len(docs) >= 10, f"Expected at least 10 documents, found {len(docs)}"

    for doc in docs:
        chunks = chunking_service.chunk_document(doc)
        assert len(chunks) >= 2, f"Document {doc.document_id} should produce multiple chunks, got {len(chunks)}"
        
        # Verify chunk indices are sequential
        for idx, chunk in enumerate(chunks):
            assert chunk.chunk_index == idx
            assert chunk.document_id == doc.document_id

def test_empty_document_produces_no_chunks():
    """Verify empty or whitespace-only documents produce zero chunks."""
    doc = KnowledgeDocument(
        document_id="KB-EMPTY",
        title="Empty Doc",
        category="Misc",
        subcategory="None",
        content="   \n\n   ",
        summary="None",
        tags=[],
        source="Test",
        last_updated="2026-09-01"
    )
    chunks = chunking_service.chunk_document(doc)
    assert len(chunks) == 0
