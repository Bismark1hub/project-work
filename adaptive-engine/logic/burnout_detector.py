from datetime import datetime, timedelta

def detect_burnout_risk(upcoming_tasks: list[dict]) -> dict | None:
    if not upcoming_tasks or len(upcoming_tasks) < 3:
        return None

    tasks_with_dates = []
    for task in upcoming_tasks:
        due_str = task.get("due_date")
        if due_str:
            try:
                due_date = datetime.fromisoformat(due_str.replace("Z", "+00:00"))
                tasks_with_dates.append({**task, "parsed_due": due_date})
            except (ValueError, TypeError):
                continue

    if len(tasks_with_dates) < 3:
        return None

    tasks_with_dates.sort(key=lambda t: t["parsed_due"])

    max_cluster = 0
    for i in range(len(tasks_with_dates)):
        for j in range(i, len(tasks_with_dates)):
            window = tasks_with_dates[j]["parsed_due"] - tasks_with_dates[i]["parsed_due"]
            cluster_size = j - i + 1
            if window <= timedelta(hours=48) and cluster_size > max_cluster:
                max_cluster = cluster_size

    if max_cluster < 3:
        return None

    risk_score = min(round((max_cluster / len(tasks_with_dates)) * 100), 95)

    return {
        "type": "burnout",
        "title": "Burnout Risk Detected",
        "description": f"You have {max_cluster} deadlines clustered within 48 hours.",
        "confidence_score": risk_score,
        "recommendation": "Stagger your start dates to spread cognitive load and reduce last-minute stress.",
        "status": "pending",
        "metadata": {
            "clustered_tasks": max_cluster,
            "total_upcoming": len(tasks_with_dates),
            "risk_level": "high" if risk_score > 70 else "moderate"
        }
    }