from typing import List, Dict, Any

def generate_recommendations(segment_summaries: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    recommendations = []
    
    REC_TEMPLATES = {
        "Champions": {
            "title": "VIP Brand Ambassador & Early Access Program",
            "action": "Enroll in an exclusive tier offering zero-threshold priority fulfillment, sneak-peek access to catalog launches, and direct account concierge.",
            "target": "Top accounts with highest monetary spend and purchase frequency.",
            "rationale_template": "This segment constitutes {pct}% of your customer base but generates {rev_pct}% of total revenue with an average spend of ${spend}. Preserving their advocacy drives organic word-of-mouth.",
            "expected_benefit": "Strengthens emotional moat, maintains lifetime purchase cadence, and defends high-margin revenue against competitor poaches."
        },
        "Loyal Customers": {
            "title": "Automated Re-order & Tiered Loyalty Milestones",
            "action": "Deploy gamified reward tiers where incremental spending unlocks escalating rewards and milestone gift bundles.",
            "target": "Consistent repeat purchasers with steady order frequency.",
            "rationale_template": "With {count} active buyers ordering an average of {freq} times, they represent your core recurring revenue engine.",
            "expected_benefit": "Incentivizes basket size expansion and elevates average order value towards Champions thresholds."
        },
        "Potential Loyalists": {
            "title": "Nurture Lifecycle & Category Cross-Sell Journeys",
            "action": "Introduce dynamic category recommendations based on initial basket SKUs paired with limited-time second-order incentive vouchers.",
            "target": "Recent buyers with 2-4 orders showing rising engagement.",
            "rationale_template": "These {count} customers recently bought with an average recency of {recency} days, indicating fresh brand recall.",
            "expected_benefit": "Accelerates conversion velocity from exploratory shoppers into entrenched habitual repeat customers."
        },
        "Big Spenders": {
            "title": "High-Ticket Premium Advisory & Volume Bundling",
            "action": "Provide white-glove checkout support, volume tier discounts, and curated premium product kits.",
            "target": "Accounts with outsized basket value despite lower order frequencies.",
            "rationale_template": "Average basket value stands at ${spend}, substantially above median benchmark, despite fewer distinct transactions.",
            "expected_benefit": "Maximizes single-transaction capture and shortens purchase interval on high-margin lines."
        },
        "New Customers": {
            "title": "Onboarding Welcome Cadence & Post-Purchase Check-in",
            "action": "Automate a 14-day post-delivery email sequence featuring product care guides, customer satisfaction survey, and a time-bound re-order credit.",
            "target": "First-time purchasers acquired within the past 30 days.",
            "rationale_template": "Currently represents {count} shoppers at average spend of ${spend}. Early post-purchase sentiment determines 90-day retention.",
            "expected_benefit": "Mitigates buyers remorse and drives the critical second transaction before brand affinity cools."
        },
        "At-Risk Customers": {
            "title": "Proactive Win-Back Sequence & Feedback Discovery",
            "action": "Trigger targeted reactivation flows featuring compelling reactivation discounts and an interactive friction inquiry survey.",
            "target": "Previously reliable customers currently inactive for over {recency} days.",
            "rationale_template": "Average dormancy has reached {recency} days among {count} customers who previously contributed ${total_rev} in revenue.",
            "expected_benefit": "Recaptures at-risk lifetime value at a fraction of modern new-customer acquisition costs."
        },
        "Hibernating Customers": {
            "title": "Low-Cost Automated Clearance Retargeting",
            "action": "Restrict outreach to zero-marginal-cost seasonal clearance notifications, suppressing high-cost direct mail or ad-spend.",
            "target": "Long-term dormant shoppers with low lifetime contribution.",
            "rationale_template": "Extended dormancy ({recency} days) and low historical volume (${spend}) render expensive ad retargeting cost-inefficient.",
            "expected_benefit": "Protects marketing margins by redirecting discretionary acquisition spend to high-potential cohorts."
        }
    }
    
    for seg in segment_summaries:
        name = seg.get("name")
        tpl = REC_TEMPLATES.get(name)
        if not tpl:
            continue
            
        rationale = tpl["rationale_template"].format(
            pct=seg.get("customer_pct", 0),
            rev_pct=seg.get("revenue_contribution_pct", 0),
            spend=seg.get("avg_monetary_spend", 0),
            count=seg.get("customer_count", 0),
            freq=seg.get("avg_frequency_orders", 0),
            recency=seg.get("avg_recency_days", 0),
            total_rev=f"{seg.get('total_revenue', 0):,.2f}"
        )
        
        recommendations.append({
            "segment_name": name,
            "color": seg.get("color"),
            "badge_bg": seg.get("badge_bg"),
            "badge_text": seg.get("badge_text"),
            "title": tpl["title"],
            "action": tpl["action"],
            "target": tpl["target"],
            "rationale": rationale,
            "expected_benefit": tpl["expected_benefit"],
            "priority": seg.get("importance", "High")
        })
        
    return recommendations
