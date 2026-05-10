from typing import List, Dict


def rank_candidates(candidates: List[Dict]) -> List[Dict]:
    """Sort candidates by total score descending and assign ranks."""
    sorted_candidates = sorted(
        candidates,
        key=lambda c: (c.get("total_score", 0), c.get("name", "")),
        reverse=True
    )

    for i, candidate in enumerate(sorted_candidates):
        candidate["rank"] = i + 1

    return sorted_candidates
