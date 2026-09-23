from datetime import datetime, timedelta
from collections import defaultdict

def detect_missed_patterns(behavior_logs: list[dict]) -> dict | None:
    if not behavior_logs:
        return None

    cutoff = datetime.now() - timedelta(days=14)
    recent_logs = []

    for log in behavior_logs:
        try:
            scheduled = datetime.fromisoformat(log["scheduled_at"].replace("Z", "+00:00"))
            if scheduled >= cutoff:
                recent_logs.append(log)
        except (ValueError, TypeError):
            continue

    missed = [log for log in recent_logs if log.get("status") == "missed"]
    if len(missed) < 2:
        return None

    day_counts = defaultdict(int)

    for log in missed:
        try:
            scheduled = datetime.fromisoformat(log["scheduled_at"].replace("Z", "+00:00"))
            day_name = scheduled.strftime("%A")
            day_counts[day_name] += 1
        except (ValueError, TypeError):
            continue

    if not day_counts:
        return None

    worst_day = max(day_counts, key=day_counts.get)
    worst_day_count = day_counts[worst_day]
    confidence = min(round((worst_day_count / len(missed)) * 100), 90)

    return {
        "type": "calculus",
        "title": "Recurring Miss Pattern Detected",
        "description": f"You've missed {worst_day_count} sessions on {worst_day}s in the last 14 days.",
        "confidence_score": confidence,
        "recommendation": f"Your {worst_day} schedule may be overloaded. Try moving sessions to a lighter day.",
        "status": "pending",
        "metadata": {
            "worst_day": worst_day,
            "total_missed": len(missed),
            "analysis_period_days": 14
        }
    }