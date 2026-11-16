import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import os
import joblib
from typing import Dict, Any, Tuple, List, Optional
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, roc_auc_score, confusion_matrix, roc_curve

from app.utils.paths import MODELS_DIR

def construct_chronological_churn_dataset(
    df: pd.DataFrame,
    inactivity_threshold_days: int = 90
) -> Tuple[Optional[pd.DataFrame], Dict[str, Any]]:
    # Validate date range
    if 'InvoiceDate' not in df.columns or 'CustomerID' not in df.columns:
        return None, {"error": "Dataset must contain InvoiceDate and CustomerID"}
        
    min_date = df['InvoiceDate'].min()
    max_date = df['InvoiceDate'].max()
    total_days = (max_date - min_date).days
    
    # Requirement: chronological observation window + future inactivity window
    # Cutoff date = max_date - inactivity_threshold_days
    cutoff_date = max_date - timedelta(days=inactivity_threshold_days)
    
    if cutoff_date <= min_date + timedelta(days=30):
        return None, {
            "error": "Dataset timespan insufficient for leakage-free chronological churn modeling",
            "details": f"Total span is {total_days} days. An inactivity window of {inactivity_threshold_days} days requires at least {inactivity_threshold_days + 60} days of historical transactions."
        }
        
    # Split historical observation window (<= cutoff_date) and future outcome window (> cutoff_date)
    obs_df = df[df['InvoiceDate'] <= cutoff_date]
    future_df = df[df['InvoiceDate'] > cutoff_date]
    
    # Active customers prior to cutoff
    active_customers = obs_df['CustomerID'].unique()
    future_active_customers = set(future_df['CustomerID'].unique())
    
    churn_records = []
    for cid in active_customers:
        c_obs = obs_df[obs_df['CustomerID'] == cid]
        
        # Features computed STRICTLY before cutoff_date:
        last_obs_date = c_obs['InvoiceDate'].max()
        first_obs_date = c_obs['InvoiceDate'].min()
        
        recency_at_cutoff = (cutoff_date - last_obs_date).days
        tenure_at_cutoff = (cutoff_date - first_obs_date).days
        freq_at_cutoff = c_obs['InvoiceNo'].nunique()
        monetary_at_cutoff = float(c_obs['LineTotal'].sum())
        total_items = int(c_obs['Quantity'].sum())
        unique_skus = c_obs['StockCode'].nunique()
        aov = round(monetary_at_cutoff / freq_at_cutoff, 2) if freq_at_cutoff > 0 else 0.0
        
        # Purchase interval variance
        inv_dates = c_obs[['InvoiceNo', 'InvoiceDate']].drop_duplicates()['InvoiceDate'].sort_values()
        if len(inv_dates) > 1:
            intervals = (inv_dates.diff().dt.total_seconds() / 86400).dropna()
            avg_interval = float(intervals.mean())
        else:
            avg_interval = float(tenure_at_cutoff)
            
        # Target label: 1 if customer did NOT return in the future window (churned), 0 if they returned
        churn_label = 0 if cid in future_active_customers else 1
        
        churn_records.append({
            'CustomerID': str(cid),
            'recency': recency_at_cutoff,
            'frequency': freq_at_cutoff,
            'monetary': round(monetary_at_cutoff, 2),
            'tenure': tenure_at_cutoff,
            'aov': aov,
            'total_items': total_items,
            'unique_skus': unique_skus,
            'avg_interval': round(avg_interval, 2),
            'churn': churn_label
        })
        
    churn_df = pd.DataFrame(churn_records)
    
    churn_rate = round(float(churn_df['churn'].mean()) * 100, 2)
    meta = {
        "cutoff_date": cutoff_date.strftime("%Y-%m-%d"),
        "min_date": min_date.strftime("%Y-%m-%d"),
        "max_date": max_date.strftime("%Y-%m-%d"),
        "total_observation_customers": len(churn_df),
        "churned_customers": int(churn_df['churn'].sum()),
        "retained_customers": int((churn_df['churn'] == 0).sum()),
        "churn_rate_pct": churn_rate
    }
    
    return churn_df, meta

def train_churn_models(
    churn_df: pd.DataFrame,
    test_size: float = 0.25,
    random_state: int = 42
) -> Dict[str, Any]:
    feature_cols = ['recency', 'frequency', 'monetary', 'tenure', 'aov', 'total_items', 'unique_skus', 'avg_interval']
    X = churn_df[feature_cols].copy()
    y = churn_df['churn'].values
    
    # Check class balance
    if len(np.unique(y)) < 2:
        return {"error": "All customers in dataset have the same churn outcome. Cannot train classifier."}
        
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=test_size, random_state=random_state, stratify=y
    )
    
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    
    models = {
        "logistic_regression": {
            "name": "Logistic Regression",
            "model": LogisticRegression(max_iter=1000, random_state=random_state)
        },
        "random_forest": {
            "name": "Random Forest Classifier",
            "model": RandomForestClassifier(n_estimators=100, max_depth=5, random_state=random_state)
        },
        "gradient_boosting": {
            "name": "Gradient Boosting Classifier",
            "model": GradientBoostingClassifier(n_estimators=100, learning_rate=0.08, max_depth=3, random_state=random_state)
        }
    }
    
    eval_results = []
    roc_curves = {}
    best_model_key = "gradient_boosting"
    best_f1 = -1
    trained_model_objs = {}
    
    for key, item in models.items():
        clf = item["model"]
        if key == "logistic_regression":
            clf.fit(X_train_scaled, y_train)
            y_pred = clf.predict(X_test_scaled)
            y_prob = clf.predict_proba(X_test_scaled)[:, 1]
        else:
            clf.fit(X_train, y_train)
            y_pred = clf.predict(X_test)
            y_prob = clf.predict_proba(X_test)[:, 1]
            
        trained_model_objs[key] = clf
        
        acc = float(accuracy_score(y_test, y_pred))
        prec = float(precision_score(y_test, y_pred, zero_division=0))
        rec = float(recall_score(y_test, y_pred, zero_division=0))
        f1 = float(f1_score(y_test, y_pred, zero_division=0))
        auc = float(roc_auc_score(y_test, y_prob)) if len(np.unique(y_test)) > 1 else 0.5
        cm = confusion_matrix(y_test, y_pred).tolist()
        
        # ROC curve sampling
        fpr, tpr, _ = roc_curve(y_test, y_prob)
        # Sample ~15 points for visualization
        step = max(1, len(fpr) // 15)
        curve_points = [
            {"fpr": round(float(fpr[i]), 3), "tpr": round(float(tpr[i]), 3)}
            for i in range(0, len(fpr), step)
        ]
        if curve_points[-1]["fpr"] < 1.0:
            curve_points.append({"fpr": 1.0, "tpr": 1.0})
        roc_curves[key] = curve_points
        
        eval_results.append({
            "model_key": key,
            "name": item["name"],
            "accuracy": round(acc, 4),
            "precision": round(prec, 4),
            "recall": round(rec, 4),
            "f1_score": round(f1, 4),
            "roc_auc": round(auc, 4),
            "confusion_matrix": {
                "true_negative": cm[0][0],
                "false_positive": cm[0][1],
                "false_negative": cm[1][0],
                "true_positive": cm[1][1]
            }
        })
        
        if f1 > best_f1:
            best_f1 = f1
            best_model_key = key
            
    # Feature Importance from Random Forest / Gradient Boosting
    best_clf = trained_model_objs[best_model_key]
    if hasattr(best_clf, 'feature_importances_'):
        importances = best_clf.feature_importances_
    elif hasattr(best_clf, 'coef_'):
        importances = np.abs(best_clf.coef_[0])
    else:
        importances = [1.0 / len(feature_cols)] * len(feature_cols)
        
    feat_importance_list = [
        {"feature": col, "importance": round(float(imp), 4), "importance_pct": round(float(imp / sum(importances)) * 100, 1)}
        for col, imp in zip(feature_cols, importances)
    ]
    feat_importance_list.sort(key=lambda x: x["importance"], reverse=True)
    
    # Calculate churn probabilities across all active customers using best model
    if best_model_key == "logistic_regression":
        all_probs = best_clf.predict_proba(scaler.transform(X))[:, 1]
    else:
        all_probs = best_clf.predict_proba(X)[:, 1]
        
    customer_probabilities = []
    risk_counts = {"high": 0, "medium": 0, "low": 0}
    
    for idx, prob in enumerate(all_probs):
        p_val = round(float(prob), 4)
        if p_val >= 0.65:
            risk_tier = "High"
            risk_counts["high"] += 1
        elif p_val >= 0.35:
            risk_tier = "Medium"
            risk_counts["medium"] += 1
        else:
            risk_tier = "Low"
            risk_counts["low"] += 1
            
        customer_probabilities.append({
            "customer_id": churn_df.iloc[idx]['CustomerID'],
            "churn_probability": p_val,
            "risk_tier": risk_tier,
            "recency": float(churn_df.iloc[idx]['recency']),
            "frequency": int(churn_df.iloc[idx]['frequency']),
            "monetary": float(churn_df.iloc[idx]['monetary'])
        })
        
    # Save best model and scaler safely
    try:
        joblib.dump(best_clf, os.path.join(MODELS_DIR, "churn_best_model.joblib"))
        joblib.dump(scaler, os.path.join(MODELS_DIR, "churn_scaler.joblib"))
    except Exception as e:
        print(f"[CustomerIQ] Churn model artifact saving notice: {e}")
    
    total_eval = len(customer_probabilities)
    explanation = (
        f"{models[best_model_key]['name']} emerged as the highest performing churn classifier with an F1-Score of {best_f1:.4f}. "
        f"Its non-linear decision trees capture nuanced interactions between transaction recency and order frequency decay, "
        "enabling precise identification of dormant accounts while minimizing false alarm interventions."
    )

    return {
        "best_model": best_model_key,
        "best_model_name": models[best_model_key]["name"],
        "model_comparison": eval_results,
        "roc_curves": roc_curves,
        "feature_importances": feat_importance_list,
        "risk_breakdown": {
            "total_customers": total_eval,
            "high_risk": risk_counts["high"],
            "high_risk_pct": round((risk_counts["high"] / total_eval) * 100, 1) if total_eval > 0 else 0,
            "medium_risk": risk_counts["medium"],
            "medium_risk_pct": round((risk_counts["medium"] / total_eval) * 100, 1) if total_eval > 0 else 0,
            "low_risk": risk_counts["low"],
            "low_risk_pct": round((risk_counts["low"] / total_eval) * 100, 1) if total_eval > 0 else 0
        },
        "customer_probabilities": customer_probabilities,
        "explanation": explanation
    }
