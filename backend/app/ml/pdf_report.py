import os
from datetime import datetime
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, HRFlowable
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch

from app.utils.paths import REPORTS_DIR

def generate_pdf_report(
    summary_data: dict,
    rfm_meta: dict,
    clustering_meta: dict,
    segment_meta: dict,
    churn_meta: dict,
    recommendations: list,
    output_filename: str = "CustomerIQ_Executive_Report.pdf"
) -> str:
    pdf_path = os.path.join(REPORTS_DIR, output_filename)
    try:
        # Test if REPORTS_DIR is writeable
        test_f = open(os.path.join(REPORTS_DIR, "_test_perm.tmp"), "w")
        test_f.close()
        os.remove(os.path.join(REPORTS_DIR, "_test_perm.tmp"))
    except Exception:
        import tempfile
        pdf_path = os.path.join(tempfile.gettempdir(), output_filename)

    doc = SimpleDocTemplate(
        pdf_path,
        pagesize=letter,
        rightMargin=40,
        leftMargin=40,
        topMargin=40,
        bottomMargin=40
    )
    
    styles = getSampleStyleSheet()
    
    # Custom Enterprise Palette
    navy_color = colors.HexColor("#0F172A")
    blue_color = colors.HexColor("#1D4ED8")
    slate_muted = colors.HexColor("#475569")
    light_bg = colors.HexColor("#F8FAFC")
    border_color = colors.HexColor("#E2E8F0")
    
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=24,
        leading=28,
        textColor=navy_color,
        spaceAfter=4
    )
    
    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=12,
        leading=16,
        textColor=slate_muted,
        spaceAfter=15
    )
    
    h1_style = ParagraphStyle(
        'Header1',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=15,
        leading=19,
        textColor=navy_color,
        spaceBefore=14,
        spaceAfter=8
    )

    h2_style = ParagraphStyle(
        'Header2',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=12,
        leading=15,
        textColor=blue_color,
        spaceBefore=8,
        spaceAfter=4
    )
    
    body_style = ParagraphStyle(
        'BodyDark',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9.5,
        leading=13.5,
        textColor=colors.HexColor("#1E293B"),
        spaceAfter=6
    )

    cell_style = ParagraphStyle(
        'CellText',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=11.5,
        textColor=colors.HexColor("#1E293B")
    )
    
    cell_bold_style = ParagraphStyle(
        'CellBold',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8.5,
        leading=11.5,
        textColor=navy_color
    )
    
    story = []
    
    # Header & Branding
    story.append(Paragraph("CustomerIQ Enterprise Analytics", title_style))
    story.append(Paragraph("Academic Project Title: Customer Behaviour Segmentation & Insight Discovery Platform", subtitle_style))
    story.append(Paragraph(f"Generated: {datetime.utcnow().strftime('%B %d, %Y - %H:%M UTC')} | Tagline: Understand Customers. Discover Patterns. Drive Growth.", ParagraphStyle('MetaInfo', fontName='Helvetica-Oblique', fontSize=8.5, textColor=slate_muted)))
    story.append(HRFlowable(width="100%", thickness=1.5, color=blue_color, spaceAfter=14))
    
    # 1. Executive Summary & Dataset Information
    story.append(Paragraph("1. Dataset & Preprocessing Audit", h1_style))
    pre_audit = summary_data or {}
    dataset_table_data = [
        [Paragraph("Metric", cell_bold_style), Paragraph("Value", cell_bold_style), Paragraph("Description / Audit Note", cell_bold_style)],
        [Paragraph("Raw Record Count", cell_style), Paragraph(f"{pre_audit.get('initial_records', 'N/A')}", cell_style), Paragraph("Total transactional rows loaded from source CSV.", cell_style)],
        [Paragraph("Cleaned Record Count", cell_style), Paragraph(f"{pre_audit.get('final_records', 'N/A')}", cell_style), Paragraph("Filtered for cancellations ('C'), negative quantities, & missing Customer IDs.", cell_style)],
        [Paragraph("Data Retention Rate", cell_style), Paragraph(f"{pre_audit.get('retention_rate_pct', 'N/A')}%", cell_style), Paragraph("High integrity transactions retained after rigorous cleaning.", cell_style)],
        [Paragraph("Unique Customer Accounts", cell_style), Paragraph(f"{pre_audit.get('unique_customers', 'N/A')}", cell_style), Paragraph("Distinct client entities identified in the observation period.", cell_style)],
        [Paragraph("Total Validated Revenue", cell_style), Paragraph(f"${pre_audit.get('total_revenue', 0):,.2f}", cell_style), Paragraph("Sum of fulfilled transaction values (LineTotal).", cell_style)],
        [Paragraph("Date Coverage", cell_style), Paragraph(f"{pre_audit.get('date_range', {}).get('start_date', 'N/A')} to {pre_audit.get('date_range', {}).get('end_date', 'N/A')}", cell_style), Paragraph(f"Span: {pre_audit.get('date_range', {}).get('days_span', 'N/A')} active days.", cell_style)],
    ]
    t1 = Table(dataset_table_data, colWidths=[1.8*inch, 1.4*inch, 3.8*inch])
    t1.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), light_bg),
        ('GRID', (0,0), (-1,-1), 0.5, border_color),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
    ]))
    story.append(t1)
    story.append(Spacer(1, 12))
    
    # 2. RFM Feature Engineering
    story.append(Paragraph("2. RFM Feature Engineering Methodology", h1_style))
    story.append(Paragraph(
        "Customer behavior was decomposed into 3 core vectors evaluated from transactional telemetry: "
        "<b>Recency</b> (days since last purchase relative to reference timestamp), "
        "<b>Frequency</b> (unique distinct orders placed), and "
        "<b>Monetary</b> (total cumulative spend).", body_style
    ))
    rfm_stats = rfm_meta.get("statistics", {})
    rfm_table_data = [
        [Paragraph("Dimension", cell_bold_style), Paragraph("Mean", cell_bold_style), Paragraph("Median", cell_bold_style), Paragraph("Std Dev", cell_bold_style), Paragraph("25th - 75th Percentile", cell_bold_style)],
        [Paragraph("Recency (Days)", cell_style), Paragraph(f"{rfm_stats.get('recency', {}).get('mean', 'N/A')}", cell_style), Paragraph(f"{rfm_stats.get('recency', {}).get('median', 'N/A')}", cell_style), Paragraph(f"{rfm_stats.get('recency', {}).get('std', 'N/A')}", cell_style), Paragraph(f"{rfm_stats.get('recency', {}).get('p25', 'N/A')} - {rfm_stats.get('recency', {}).get('p75', 'N/A')}", cell_style)],
        [Paragraph("Frequency (Orders)", cell_style), Paragraph(f"{rfm_stats.get('frequency', {}).get('mean', 'N/A')}", cell_style), Paragraph(f"{rfm_stats.get('frequency', {}).get('median', 'N/A')}", cell_style), Paragraph(f"{rfm_stats.get('frequency', {}).get('std', 'N/A')}", cell_style), Paragraph(f"{rfm_stats.get('frequency', {}).get('p25', 'N/A')} - {rfm_stats.get('frequency', {}).get('p75', 'N/A')}", cell_style)],
        [Paragraph("Monetary Value ($)", cell_style), Paragraph(f"${rfm_stats.get('monetary', {}).get('mean', 0):,.2f}", cell_style), Paragraph(f"${rfm_stats.get('monetary', {}).get('median', 0):,.2f}", cell_style), Paragraph(f"${rfm_stats.get('monetary', {}).get('std', 0):,.2f}", cell_style), Paragraph(f"${rfm_stats.get('monetary', {}).get('p25', 0):,.2f} - ${rfm_stats.get('monetary', {}).get('p75', 0):,.2f}", cell_style)],
        [Paragraph("Average Order Value ($)", cell_style), Paragraph(f"${rfm_stats.get('aov', {}).get('mean', 0):,.2f}", cell_style), Paragraph(f"${rfm_stats.get('aov', {}).get('median', 0):,.2f}", cell_style), Paragraph(f"${rfm_stats.get('aov', {}).get('std', 0):,.2f}", cell_style), Paragraph(f"${rfm_stats.get('aov', {}).get('p25', 0):,.2f} - ${rfm_stats.get('aov', {}).get('p75', 0):,.2f}", cell_style)],
    ]
    t_rfm = Table(rfm_table_data, colWidths=[1.8*inch, 1.2*inch, 1.2*inch, 1.2*inch, 1.6*inch])
    t_rfm.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), light_bg),
        ('GRID', (0,0), (-1,-1), 0.5, border_color),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
    ]))
    story.append(t_rfm)
    story.append(Spacer(1, 12))
    
    # 3. Unsupervised Machine Learning & Model Comparison
    story.append(Paragraph("3. Unsupervised Clustering Algorithms & Evaluation", h1_style))
    story.append(Paragraph(
        "Features were normalized via log-transformation and standardized with StandardScaler. "
        "Three distinct clustering paradigms were systematically benchmarked across silhouette cohesion, "
        "Davies-Bouldin cluster separation, and Calinski-Harabasz variance ratio.", body_style
    ))
    
    comp_list = clustering_meta.get("comparison_table", [])
    comp_table_data = [
        [Paragraph("Algorithm", cell_bold_style), Paragraph("Silhouette", cell_bold_style), Paragraph("Davies-Bouldin", cell_bold_style), Paragraph("Calinski-Harabasz", cell_bold_style), Paragraph("Clusters", cell_bold_style), Paragraph("Noise %", cell_bold_style), Paragraph("Time (ms)", cell_bold_style)]
    ]
    for m in comp_list:
        comp_table_data.append([
            Paragraph(f"{m.get('name')}", cell_style),
            Paragraph(f"{m.get('silhouette_score', 'N/A')}", cell_style),
            Paragraph(f"{m.get('davies_bouldin_index', 'N/A')}", cell_style),
            Paragraph(f"{m.get('calinski_harabasz_score', 'N/A')}", cell_style),
            Paragraph(f"{m.get('n_clusters')}", cell_style),
            Paragraph(f"{m.get('noise_pct')}%", cell_style),
            Paragraph(f"{m.get('execution_time_ms')}", cell_style),
        ])
    t_comp = Table(comp_table_data, colWidths=[2.2*inch, 0.8*inch, 0.9*inch, 1.1*inch, 0.6*inch, 0.7*inch, 0.7*inch])
    t_comp.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), light_bg),
        ('GRID', (0,0), (-1,-1), 0.5, border_color),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
    ]))
    story.append(t_comp)
    story.append(Spacer(1, 6))
    
    rationale = clustering_meta.get("selection_rationale", "K-Means was selected based on optimal silhouette cohesion and 100% complete assignment.")
    story.append(Paragraph(f"<b>Model Selection Rationale:</b> {rationale}", body_style))
    story.append(Spacer(1, 10))
    
    # 4. Customer Segment Profiles
    story.append(Paragraph("4. Customer Segment Profiles & Behavioral Archetypes", h1_style))
    segs = segment_meta.get("segments", [])
    seg_table_data = [
        [Paragraph("Segment Name", cell_bold_style), Paragraph("Customers (%)", cell_bold_style), Paragraph("Total Revenue (%)", cell_bold_style), Paragraph("Avg Recency", cell_bold_style), Paragraph("Avg Freq", cell_bold_style), Paragraph("Avg Spend", cell_bold_style)]
    ]
    for s in segs:
        seg_table_data.append([
            Paragraph(f"<b>{s.get('name')}</b>", cell_style),
            Paragraph(f"{s.get('customer_count')} ({s.get('customer_pct')}%)", cell_style),
            Paragraph(f"${s.get('total_revenue', 0):,.2f} ({s.get('revenue_contribution_pct')}%)", cell_style),
            Paragraph(f"{s.get('avg_recency_days')} d", cell_style),
            Paragraph(f"{s.get('avg_frequency_orders')} orders", cell_style),
            Paragraph(f"${s.get('avg_monetary_spend', 0):,.2f}", cell_style),
        ])
    t_seg = Table(seg_table_data, colWidths=[1.8*inch, 1.1*inch, 1.5*inch, 0.8*inch, 0.9*inch, 0.9*inch])
    t_seg.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), light_bg),
        ('GRID', (0,0), (-1,-1), 0.5, border_color),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
    ]))
    story.append(t_seg)
    story.append(Spacer(1, 12))
    
    # PageBreak for Clean Section 5
    story.append(PageBreak())
    
    # 5. Supervised Churn Modeling
    story.append(Paragraph("5. Supervised Churn Prediction & Early Warning System", h1_style))
    story.append(Paragraph(
        "To prevent data leakage, a chronological cutoff boundary was instituted (historical observation vs 90-day future outcome window). "
        "Three supervised classifiers were benchmarked using stratified cross-validation.", body_style
    ))
    
    churn_comp = churn_meta.get("model_comparison", [])
    churn_table_data = [
        [Paragraph("Model", cell_bold_style), Paragraph("Accuracy", cell_bold_style), Paragraph("Precision", cell_bold_style), Paragraph("Recall", cell_bold_style), Paragraph("F1-Score", cell_bold_style), Paragraph("ROC-AUC", cell_bold_style)]
    ]
    for cm in churn_comp:
        churn_table_data.append([
            Paragraph(f"{cm.get('name')}", cell_style),
            Paragraph(f"{cm.get('accuracy', 'N/A')}", cell_style),
            Paragraph(f"{cm.get('precision', 'N/A')}", cell_style),
            Paragraph(f"{cm.get('recall', 'N/A')}", cell_style),
            Paragraph(f"{cm.get('f1_score', 'N/A')}", cell_style),
            Paragraph(f"{cm.get('roc_auc', 'N/A')}", cell_style),
        ])
    t_churn = Table(churn_table_data, colWidths=[2.3*inch, 0.9*inch, 0.9*inch, 0.9*inch, 1.0*inch, 1.0*inch])
    t_churn.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), light_bg),
        ('GRID', (0,0), (-1,-1), 0.5, border_color),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
    ]))
    story.append(t_churn)
    story.append(Spacer(1, 6))
    
    r_break = churn_meta.get("risk_breakdown", {})
    story.append(Paragraph(
        f"<b>Customer Attrition Risk Distribution:</b> High Risk: {r_break.get('high_risk', 0)} ({r_break.get('high_risk_pct', 0)}%) | "
        f"Medium Risk: {r_break.get('medium_risk', 0)} ({r_break.get('medium_risk_pct', 0)}%) | "
        f"Low Risk: {r_break.get('low_risk', 0)} ({r_break.get('low_risk_pct', 0)}%)", body_style
    ))
    story.append(Spacer(1, 10))
    
    # 6. Strategic Business Recommendations
    story.append(Paragraph("6. Business Action Plan & Prescriptive Recommendations", h1_style))
    for rec in recommendations[:5]:
        story.append(Paragraph(f"<b>Segment: {rec.get('segment_name')} - {rec.get('title')}</b>", h2_style))
        story.append(Paragraph(f"<b>Target:</b> {rec.get('target')}", body_style))
        story.append(Paragraph(f"<b>Recommended Action:</b> {rec.get('action')}", body_style))
        story.append(Paragraph(f"<b>Data Rationale:</b> {rec.get('rationale')}", body_style))
        story.append(Paragraph(f"<b>Expected Business Benefit:</b> {rec.get('expected_benefit')}", body_style))
        story.append(Spacer(1, 4))
        
    story.append(Spacer(1, 10))
    
    # 7. Conclusion
    story.append(Paragraph("7. Architectural Conclusion & Governance", h1_style))
    story.append(Paragraph(
        "CustomerIQ integrates unsupervised behavioral clustering with supervised chronological churn modeling to provide "
        "an end-to-end customer intelligence lifecycle. By combining segment characteristics with calibrated departure probabilities, "
        "retail and e-commerce enterprises can prioritize retention capital where account lifetime value is highest.", body_style
    ))
    
    doc.build(story)
    return pdf_path
