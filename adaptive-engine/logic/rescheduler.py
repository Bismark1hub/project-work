from datetime import datetime, timedelta

def find_reschedule_slot(
    missed_session: dict,
    current_schedule: list[dict],
    preferred_window: tuple | None = None
) -> dict:
    """Find the next available free slot for a missed session"""

    # Parse existing schedule into busy slots
    busy_slots = []
    for session in current_schedule:
        try:
            start = datetime.fromisoformat(session["start_time"].replace("Z", "+00:00"))
            end = datetime.fromisoformat(session["end_time"].replace("Z", "+00:00"))
            busy_slots.append((start, end))
        except (ValueError, TypeError, KeyError):
            continue

    busy_slots.sort()

    # Calculate session duration
    try:
        orig_start = datetime.fromisoformat(missed_session.get("start_time", "").replace("Z", "+00:00"))
        orig_end = datetime.fromisoformat(missed_session.get("end_time", "").replace("Z", "+00:00"))
        duration = (orig_end - orig_start).total_seconds() / 3600
    except (ValueError, TypeError):
        duration = 1.5

    # Start looking from tomorrow
    search_start = datetime.now().replace(hour=8, minute=0, second=0) + timedelta(days=1)
    search_end = search_start + timedelta(days=7)

    current = search_start
    while current < search_end:
        slot_end = current + timedelta(hours=duration)

        # Skip if outside preferred window
        if preferred_window:
            pref_start_hour, pref_end_hour = preferred_window
            if current.hour < pref_start_hour or slot_end.hour > pref_end_hour:
                current += timedelta(hours=1)
                continue

        # Check if slot conflicts with any busy slot
        conflicts = False
        for busy_start, busy_end in busy_slots:
            if current.date() == busy_start.date():
                if current < busy_end and slot_end > busy_start:
                    conflicts = True
                    break

        if not conflicts and current.hour >= 8 and slot_end.hour <= 22:
            return {
                "suggested_start": current.isoformat(),
                "suggested_end": slot_end.isoformat(),
                "confidence": 85,
                "message": f"Reschedule to {current.strftime('%A, %B %d at %I:%M %p')}"
            }

        current += timedelta(hours=1)

    return {
        "suggested_start": None,
        "suggested_end": None,
        "confidence": 0,
        "message": "No suitable slot found in the next 7 days. Try reducing your schedule."
    }