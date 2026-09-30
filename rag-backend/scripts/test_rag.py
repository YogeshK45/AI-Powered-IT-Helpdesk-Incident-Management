import asyncio
import sys
from pathlib import Path

# Add project root to sys.path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.services.rag_service import rag_service

TEST_QUERIES = [
    "VPN is not connecting after changing password.",
    "SAP user cannot access a transaction after receiving a new role.",
    "Corporate DNS is not resolving internal hostnames.",
    "Office printer is not reachable from my laptop.",
    "How do I cook pasta?"
]

async def run_tests():
    print("=" * 60)
    print("RAG GROUNDED GENERATION TEST SUITE")
    print("=" * 60)

    for idx, query in enumerate(TEST_QUERIES, 1):
        if idx > 1:
            await asyncio.sleep(2.0)
        print("\n" + "=" * 40)
        print("RAG GENERATION TEST")
        print("=" * 40)
        print(f"QUERY #{idx}:")
        print(query)
        print()

        try:
            response = await rag_service.answer_query(query, top_k=5)
            
            print("RETRIEVED SOURCES:")
            if response.sources:
                for s in response.sources:
                    print(f"  - {s.document_id}: {s.title} (score: {s.score:.4f})")
            else:
                print("  []")
            print()

            print(f"GROUNDING:\n{str(response.grounded).lower()}\n")
            print(f"CONFIDENCE:\n{response.confidence:.4f}\n")
            
            if response.error:
                print(f"ERROR:\n{response.error}\n")
                
            print("ANSWER:")
            print(response.answer)
            print("=" * 40)

        except Exception as e:
            print(f"ERROR executing test: {e}")

if __name__ == "__main__":
    asyncio.run(run_tests())
