import os
import tempfile
from typing import List, Dict
from datetime import datetime


DIMENSION_LABELS = {
    "skills_match": "Skills Match",
    "experience_relevance": "Experience Relevance",
    "education_certs": "Education & Certs",
    "project_portfolio": "Project / Portfolio",
    "communication_quality": "Communication Quality"
}

RECOMMENDATION_COLORS = {
    "Strong Hire": "#00c853",
    "Hire": "#64dd17",
    "Maybe": "#ffd600",
    "No Hire": "#d50000"
}


def score_bar(score: float, max_score: float = 10.0) -> str:
    pct = (score / max_score) * 100
    if score >= 7.5:
        color = "#00c853"
    elif score >= 5.0:
        color = "#ffd600"
    else:
        color = "#d50000"
    return f"""
    <div style="background:#1e1e2e;border-radius:4px;height:8px;width:100%;overflow:hidden;">
        <div style="background:{color};width:{pct:.1f}%;height:100%;border-radius:4px;transition:width 0.3s;"></div>
    </div>"""


def generate_html_report(
    requirements: Dict,
    candidates: List[Dict],
    session_id: str
) -> str:
    """Generate a polished HTML shortlist report."""

    generated_at = datetime.now().strftime("%B %d, %Y at %H:%M")
    title = requirements.get("title", "Position")
    company = requirements.get("company", "")

    # Candidate cards
    candidate_rows = ""
    for c in candidates:
        rec = c.get("recommendation", "Maybe")
        rec_color = RECOMMENDATION_COLORS.get(rec, "#ffd600")
        total = c.get("total_score", 0)
        rank = c.get("rank", 0)
        override_badge = ' <span style="background:#7c3aed;color:#fff;padding:2px 8px;border-radius:12px;font-size:11px;">HR Override</span>' if c.get("hr_override") else ""

        # Dimension rows
        dim_rows = ""
        for dim_key, label in DIMENSION_LABELS.items():
            dim = c.get("scores", {}).get(dim_key, {})
            score = dim.get("score", 0)
            weight = int(dim.get("weight", 0) * 100)
            justification = dim.get("justification", "N/A")
            overridden = dim.get("overridden", False)
            override_tag = ' <span style="background:#7c3aed;color:#fff;padding:1px 6px;border-radius:8px;font-size:10px;">Overridden</span>' if overridden else ""

            dim_rows += f"""
            <tr style="border-bottom:1px solid #2a2a3e;">
                <td style="padding:10px 8px;color:#a0a0c0;font-size:13px;">{label}{override_tag}</td>
                <td style="padding:10px 8px;width:40%;min-width:120px;">{score_bar(score)}<span style="font-size:11px;color:#666;margin-top:2px;display:block;">{score:.1f}/10</span></td>
                <td style="padding:10px 8px;color:#888;font-size:11px;text-align:center;">{weight}%</td>
                <td style="padding:10px 8px;color:#b0b0c0;font-size:12px;">{justification}</td>
            </tr>"""

        candidate_rows += f"""
        <div style="background:#13131f;border:1px solid #2a2a3e;border-radius:12px;margin-bottom:20px;overflow:hidden;">
            <div style="padding:20px 24px;display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid #2a2a3e;flex-wrap:wrap;gap:12px;">
                <div style="display:flex;align-items:center;gap:16px;">
                    <div style="background:#1e1e3f;color:#818cf8;width:40px;height:40px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:18px;font-weight:700;">#{rank}</div>
                    <div>
                        <div style="font-size:18px;font-weight:600;color:#f0f0ff;">{c.get('name','Unknown')}{override_badge}</div>
                        <div style="font-size:13px;color:#666;">{c.get('email','')} &middot; {c.get('source','resume').upper()}</div>
                    </div>
                </div>
                <div style="display:flex;align-items:center;gap:16px;">
                    <div style="text-align:center;">
                        <div style="font-size:28px;font-weight:700;color:#818cf8;">{total:.1f}</div>
                        <div style="font-size:11px;color:#555;">/ 10.0</div>
                    </div>
                    <div style="background:{rec_color}22;color:{rec_color};border:1px solid {rec_color}55;padding:6px 16px;border-radius:20px;font-size:13px;font-weight:600;">{rec}</div>
                </div>
            </div>
            <div style="padding:0 16px 12px;">
                <table style="width:100%;border-collapse:collapse;">
                    <thead>
                        <tr style="border-bottom:1px solid #2a2a3e;">
                            <th style="padding:10px 8px;text-align:left;font-size:11px;color:#555;text-transform:uppercase;letter-spacing:1px;">Dimension</th>
                            <th style="padding:10px 8px;text-align:left;font-size:11px;color:#555;text-transform:uppercase;letter-spacing:1px;">Score</th>
                            <th style="padding:10px 8px;text-align:center;font-size:11px;color:#555;text-transform:uppercase;letter-spacing:1px;">Weight</th>
                            <th style="padding:10px 8px;text-align:left;font-size:11px;color:#555;text-transform:uppercase;letter-spacing:1px;">Justification</th>
                        </tr>
                    </thead>
                    <tbody>{dim_rows}</tbody>
                </table>
            </div>
        </div>"""

    html = f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>HR Shortlist Report — {title}</title>
<style>
  * {{ box-sizing: border-box; margin: 0; padding: 0; }}
  body {{ font-family: 'Segoe UI', system-ui, sans-serif; background: #0d0d1a; color: #e0e0ff; min-height: 100vh; }}
  @media print {{ body {{ background: white; color: #000; }} }}
</style>
</head>
<body>
<div style="max-width:960px;margin:0 auto;padding:40px 24px;">
  <!-- Header -->
  <div style="margin-bottom:40px;">
    <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:16px;">
      <div>
        <div style="font-size:12px;color:#555;text-transform:uppercase;letter-spacing:2px;margin-bottom:8px;">AI Shortlist Report</div>
        <h1 style="font-size:32px;font-weight:700;color:#f0f0ff;margin-bottom:4px;">{title}</h1>
        {f'<div style="font-size:16px;color:#818cf8;">{company}</div>' if company else ''}
      </div>
      <div style="text-align:right;">
        <div style="font-size:13px;color:#555;">Generated {generated_at}</div>
        <div style="font-size:13px;color:#555;">Session: {session_id}</div>
        <div style="font-size:13px;color:#555;margin-top:4px;">{len(candidates)} candidates evaluated</div>
      </div>
    </div>
    <div style="height:1px;background:linear-gradient(to right,#818cf8,transparent);margin-top:24px;"></div>
  </div>

  <!-- Summary Stats -->
  <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:16px;margin-bottom:40px;">
    {"".join([
      f'<div style="background:#13131f;border:1px solid #2a2a3e;border-radius:10px;padding:16px;text-align:center;"><div style="font-size:28px;font-weight:700;color:{RECOMMENDATION_COLORS[rec]};">{sum(1 for c in candidates if c.get("recommendation")==rec)}</div><div style="font-size:12px;color:#666;margin-top:4px;">{rec}</div></div>'
      for rec in ["Strong Hire", "Hire", "Maybe", "No Hire"]
    ])}
  </div>

  <!-- Candidates -->
  <div style="margin-bottom:8px;font-size:12px;color:#555;text-transform:uppercase;letter-spacing:2px;">Ranked Candidates</div>
  {candidate_rows}

  <!-- Footer -->
  <div style="margin-top:40px;padding-top:20px;border-top:1px solid #2a2a3e;text-align:center;color:#444;font-size:12px;">
    Generated by HR AI Agent &middot; Scores are AI-assisted recommendations. Final hiring decisions remain with the HR team.
  </div>
</div>
</body>
</html>"""

    report_path = os.path.join(tempfile.gettempdir(), f"hr_report_{session_id}.html")
    with open(report_path, "w", encoding="utf-8") as f:
        f.write(html)

    return report_path
