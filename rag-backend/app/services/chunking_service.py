from app.models.schemas import KnowledgeDocument, DocumentChunk
from app.core.config import settings

class ChunkingService:
    def __init__(self):
        # Target chunk size in words (default ~250-300 words with 50-80 words overlap)
        self.chunk_size = settings.CHUNK_SIZE if settings.CHUNK_SIZE < 400 else 250
        self.chunk_overlap = settings.CHUNK_OVERLAP if settings.CHUNK_OVERLAP < 100 else 60

    def chunk_document(self, document: KnowledgeDocument) -> list[DocumentChunk]:
        """
        Chunks a knowledge document preserving paragraph boundaries and metadata.
        Ensures troubleshooting steps are not abruptly split mid-sentence.
        """
        if not document.content or not document.content.strip():
            return []

        # Split into logical paragraphs / sections
        paragraphs = [p.strip() for p in document.content.split("\n\n") if p.strip()]
        if not paragraphs:
            return []

        chunks_text = []
        current_paras = []
        current_word_count = 0

        for para in paragraphs:
            para_words = len(para.split())

            # If adding this paragraph exceeds target chunk_size and we already have content:
            if current_word_count + para_words > self.chunk_size and current_paras:
                chunks_text.append("\n\n".join(current_paras))

                # Retain overlapping context from the end of the previous chunk
                overlap_paras = []
                overlap_count = 0
                for p in reversed(current_paras):
                    w = len(p.split())
                    if overlap_count + w <= self.chunk_overlap or not overlap_paras:
                        overlap_paras.insert(0, p)
                        overlap_count += w
                    else:
                        break

                current_paras = list(overlap_paras)
                current_word_count = overlap_count

            current_paras.append(para)
            current_word_count += para_words

        if current_paras:
            chunks_text.append("\n\n".join(current_paras))

        # Build DocumentChunk objects preserving full metadata
        chunks = []
        for idx, text in enumerate(chunks_text):
            chunks.append(
                DocumentChunk(
                    document_id=document.document_id,
                    title=document.title,
                    category=document.category,
                    subcategory=document.subcategory,
                    source=document.source,
                    tags=document.tags,
                    chunk_index=idx,
                    content=text,
                    last_updated=document.last_updated
                )
            )

        return chunks

chunking_service = ChunkingService()
