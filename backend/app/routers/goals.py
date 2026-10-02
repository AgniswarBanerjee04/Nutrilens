"""User macro goals router."""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, UserGoals
from app.schemas import UserGoalsOut, UserGoalsUpdate
from app.auth import get_current_user

router = APIRouter(prefix="/api/goals", tags=["Nutritional Goals"])


@router.get("", response_model=UserGoalsOut)
def get_user_goals(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Fetches the daily caloric and macro targets for the logged-in user."""
    goals = db.query(UserGoals).filter(UserGoals.user_id == current_user.id).first()
    if not goals:
        # Default initialization if none exists
        goals = UserGoals(
            user_id=current_user.id,
            target_calories=2000.0,
            target_protein=150.0,
            target_carbs=200.0,
            target_fats=65.0
        )
        db.add(goals)
        db.commit()
        db.refresh(goals)
    return goals


@router.put("", response_model=UserGoalsOut)
def update_user_goals(
    goals_in: UserGoalsUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Updates daily caloric and macro goals for the authenticated user."""
    goals = db.query(UserGoals).filter(UserGoals.user_id == current_user.id).first()
    if not goals:
        goals = UserGoals(user_id=current_user.id)
        db.add(goals)

    goals.target_calories = goals_in.target_calories
    goals.target_protein = goals_in.target_protein
    goals.target_carbs = goals_in.target_carbs
    goals.target_fats = goals_in.target_fats

    db.commit()
    db.refresh(goals)
    return goals
