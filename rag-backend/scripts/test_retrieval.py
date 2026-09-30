import sys
from pathlib import Path

# Add project root to path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.services.retrieval_service import retrieval_service

TEST_QUERIES = [
    {
        "query": "VPN is not connecting after changing password",
        "expected": "KB-1001",
        "description": "VPN Connectivity Troubleshooting"
    },
    {
        "query": "SAP user cannot access a transaction",
        "expected": "KB-1002 / KB-1010",
        "description": "SAP Authorization / Access Procedure"
    },
    {
        "query": "SAP login is failing",
        "expected": "KB-1003",
        "description": "SAP Login Troubleshooting"
    },
    {
        "query": "Corporate DNS is not resolving",
        "expected": "KB-1004",
        "description": "Corporate DNS Troubleshooting"
    },
    {
        "query": "Internet connection is unstable",
        "expected": "KB-1005",
        "description": "Network Connectivity Troubleshooting"
    },
    {
        "query": "I forgot my corporate password",
        "expected": "KB-1006",
        "description": "Password Reset Procedure"
    },
    {
        "query": "Office printer cannot be reached",
        "expected": "KB-1007",
        "description": "Printer Connectivity Guide"
    },
    {
        "query": "Laptop is very slow",
        "expected": "KB-1008",
        "description": "Laptop Performance Troubleshooting"
    },
    {
        "query": "Unable to access corporate email",
        "expected": "KB-1009",
        "description": "Email Access Troubleshooting"
    },
    {
        "query": "User needs SAP system access",
        "expected": "KB-1010",
        "description": "SAP User Access Procedure"
    },
    # Negative Test Case
    {
        "query": "How do I cook pasta?",
        "expected": "ZERO RESULTS (Below threshold)",
        "description": "Negative Test - Irrelevant Non-IT Query"
    }
]

def main():
    print("=" * 50)
    print("RAG RETRIEVAL TEST SUITE")
    print("=" * 50)
    
    passed_count = 0
    total_count = len(TEST_QUERIES)

    for idx, test_case in enumerate(TEST_QUERIES, 1):
        query = test_case["query"]
        expected = test_case["expected"]
        desc = test_case["description"]
        
        print("\n" + "=" * 40)
        print("RAG RETRIEVAL TEST")
        print("=" * 40)
        print(f"Test #{idx}: {desc}")
        print(f"Query:\n{query}\n")
        print(f"Expected:\n{expected}\n")

        results = retrieval_service.retrieve(query=query, top_k=5)

        if not results:
            print("Results:\n[Zero results returned - Below threshold]")
            if "ZERO RESULTS" in expected:
                print("Status: PASSED (Correctly rejected irrelevant query)")
                passed_count += 1
            else:
                print("Status: FAILED (Expected relevant results)")
        else:
            top_result = results[0]
            print(f"Top Retrieved Document: {top_result.document_id} ({top_result.title}) [Score: {top_result.score:.4f}]")
            print("Retrieved Chunks:")
            for rank, chunk in enumerate(results[:3], 1):
                print(f"{rank}. {chunk.document_id}")
                print(f"   {chunk.title}")
                print(f"   Category: {chunk.category} | Subcategory: {chunk.subcategory}")
                print(f"   Score: {chunk.score:.4f}")

            # Verify expectation
            matched = False
            if "KB-1002" in expected and ("KB-1002" in [r.document_id for r in results] or "KB-1010" in [r.document_id for r in results]):
                matched = True
            elif top_result.document_id in expected:
                matched = True
            elif any(r.document_id in expected for r in results[:2]):
                matched = True

            if matched:
                print(f"Status: PASSED (Matched {expected})")
                passed_count += 1
            else:
                print(f"Status: FAILED (Expected {expected}, got {top_result.document_id})")

    print("\n" + "=" * 50)
    print(f"RETRIEVAL TEST RESULTS: {passed_count} / {total_count} PASSED")
    print("=" * 50)

if __name__ == "__main__":
    main()
