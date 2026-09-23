from datetime import datetime
from collections import defaultdict

def classify_focus_window(behavior_logs: list[dict]) -> dict | None:
    if not behavior_logs:
        return None

    completed = [log for log in behavior_logs if log.get("status") == "completed"]
    if len(completed) < 3:
        return None

    window_counts = defaultdict(int)

    for log in completed:
        if log.get("actual_start"):
            try:
                start_time = datetime.fromisoformat(log["actual_start"].replace("Z", "+00:00"))
                hour = start_time.hour
                window_start = (hour // 2) * 2
                window_counts[window_start] += 1
            except (ValueError, TypeError):
                continue

    if not window_counts:
        return None

    best_window = max(window_counts, key=window_counts.get)
    best_count = window_counts[best_window]
    total_completed = len(completed)
    confidence = min(round((best_count / total_completed) * 100), 95)
    window_label = f"{best_window:02d}:00 - {best_window + 2:02d}:00"

    return {
        "type": "circadian",
        "title": "Circadian Focus Alignment",
        "description": f"Your peak productivity window is {window_label}. You complete {confidence}% of sessions here.",
        "confidence_score": confidence,
        "recommendation": f"Schedule your hardest courses during {window_label} for better retention.",
        "status": "pending",
        "metadata": {
            "peak_window": window_label,
            "window_start": best_window,
            "sessions_in_window": best_count,
            "total_completed": total_completed
        }
    }