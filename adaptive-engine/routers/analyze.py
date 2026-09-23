from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from logic.focus_classifier import classify_focus_window
from logic.pattern_detector import detect_missed_patterns
from logic.burnout_detector import detect_burnout_risk
from logic.rescheduler import find_reschedule_slot

router = APIRouter()

class BehaviorLog(BaseModel):
    id: str
    user_id: str
    session_id: str
    scheduled_at: str
    actual_start: Optional[str] = None
    actual_end: Optional[str] = None
    status: str
    subject_id: Optional[str] = None

class AnalyzeRequest(BaseModel):
    user_id: str
    behavior_logs: list[BehaviorLog] = []
    upcoming_tasks: list[dict] = []
    current_schedule: list[dict] = []

class AnalyzeResponse(BaseModel):
    success: bool
    data: dict
    message: Optional[str] = None

@router.post("/analyze", response_model=AnalyzeResponse)
async def analyze_behavior(request: AnalyzeRequest):
    """Run all adaptive engine detectors on the user's behavior logs"""
    try:
        logs = [log.model_dump() for log in request.behavior_logs]
        insights = []

        focus_insight = classify_focus_window(logs)
        if focus_insight:
            insights.append(focus_insight)

        missed_patterns = detect_missed_patterns(logs)
        if missed_patterns:
            insights.append(missed_patterns)

        burnout_risk = detect_burnout_risk(request.upcoming_tasks)
        if burnout_risk:
            insights.append(burnout_risk)

        return {
            "success": True,
            "data": {
                "insights": insights,
                "analysis_timestamp": datetime.now().isoformat(),
                "logs_analyzed": len(logs)
            },
            "message": f"Analysis completed. {len(insights)} insights generated."
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/reschedule")
async def reschedule_session(request: dict):
    """Find the next best free slot for a missed session"""
    try:
        result = find_reschedule_slot(
            missed_session=request.get("missed_session", {}),
            current_schedule=request.get("current_schedule", []),
            preferred_window=request.get("preferred_window")
        )
        return {"success": True, "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))