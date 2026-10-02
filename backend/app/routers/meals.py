"""Meals, Vision AI, and Macro-Balancer router for NutriLens."""

import json
from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Body, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, Meal, UserGoals
from app.schemas import (
    MealAnalysisResponse,
    MealCreate,
    MealOut,
    MacroBalancerRequest,
    MacroBalancerResponse,
    AICoachChatRequest,
    AICoachChatResponse,
    SubscriptionTierUpdate
)
from app.auth import get_current_user
from app.services.gemini import (
    analyze_meal_image,
    generate_macro_balanced_recipe,
    ask_ai_food_trainer
)

router = APIRouter(prefix="/api", tags=["Meals & AI Metabolic Engine"])


@router.post(
    "/analyze-meal",
    response_model=MealAnalysisResponse,
    summary="Analyze a photo of a meal with Gemini Vision"
)
async def analyze_meal(
    file: UploadFile = File(...),
):
    """
    Accepts an uploaded meal image (multipart/form-data) and returns
    approximate portion sizes, recognized food items, macronutrient breakdown,
    cooking method deconstruction, hidden fats, and glycemic index rating.
    """
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file must be a valid image (e.g. JPEG, PNG, WEBP)."
        )

    image_bytes = await file.read()
    if len(image_bytes) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded image file is empty."
        )

    analysis_result = await analyze_meal_image(image_bytes, file.content_type)
    return analysis_result


@router.get("/meals", response_model=List[MealOut])
def get_user_meals(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieves all meals logged by the current authenticated user."""
    meals = (
        db.query(Meal)
        .filter(Meal.user_id == current_user.id)
        .order_by(Meal.timestamp.desc())
        .all()
    )

    # Format food_items from stored JSON string
    result = []
    for m in meals:
        food_items = []
        if m.food_items_json:
            try:
                food_items = json.loads(m.food_items_json)
            except Exception:
                food_items = [m.food_summary]
        else:
            food_items = [m.food_summary]

        food_warnings = []
        if getattr(m, "hidden_fat_warnings_json", None):
            try:
                food_warnings = json.loads(m.hidden_fat_warnings_json)
            except Exception:
                food_warnings = []

        glycemic_impact = getattr(m, "glycemic_impact", None) or getattr(m, "glycemic_index_rating", "Medium") or "Medium"

        fiber_g = getattr(m, "fiber_g", 0.0) or 0.0
        sodium_mg = getattr(m, "sodium_mg", 0.0) or 0.0
        net_carbs = getattr(m, "net_carbs", 0.0) or max(0.0, (m.carbs or 0.0) - fiber_g)

        result.append(
            MealOut(
                id=m.id,
                user_id=m.user_id,
                image_url=m.image_url,
                food_summary=m.food_summary,
                food_items=food_items,
                calories=m.calories,
                protein=m.protein,
                carbs=m.carbs,
                fats=m.fats,
                fiber_g=fiber_g,
                sodium_mg=sodium_mg,
                net_carbs=net_carbs,
                hidden_fat_warnings=food_warnings,
                glycemic_impact=glycemic_impact,
                cooking_method=getattr(m, "cooking_method", "Ghee-Tempered Tadka & Griddled") or "Ghee-Tempered Tadka & Griddled",
                hidden_fat_estimate_g=getattr(m, "hidden_fat_estimate_g", 0.0) or 0.0,
                glycemic_index_rating=glycemic_impact,
                timestamp=m.timestamp
            )
        )
    return result


@router.post("/meals", response_model=MealOut, status_code=status.HTTP_201_CREATED)
def log_meal(
    meal_in: MealCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Saves a verified meal log entry with its macronutrient values and metabolic parameters."""
    food_items_json = json.dumps(meal_in.food_items) if meal_in.food_items else None
    warnings_json = json.dumps(meal_in.hidden_fat_warnings) if meal_in.hidden_fat_warnings else None
    glycemic_val = meal_in.glycemic_impact or meal_in.glycemic_index_rating or "Medium"

    fiber_val = meal_in.fiber_g or 0.0
    sodium_val = meal_in.sodium_mg or 0.0
    net_carbs_val = meal_in.net_carbs if meal_in.net_carbs is not None else max(0.0, meal_in.carbs - fiber_val)

    meal = Meal(
        user_id=current_user.id,
        image_url=meal_in.image_url,
        food_summary=meal_in.food_summary,
        food_items_json=food_items_json,
        calories=meal_in.calories,
        protein=meal_in.protein,
        carbs=meal_in.carbs,
        fats=meal_in.fats,
        fiber_g=fiber_val,
        sodium_mg=sodium_val,
        net_carbs=net_carbs_val,
        hidden_fat_warnings_json=warnings_json,
        glycemic_impact=glycemic_val,
        cooking_method=meal_in.cooking_method or "Ghee-Tempered Tadka & Griddled",
        hidden_fat_estimate_g=meal_in.hidden_fat_estimate_g or 0.0,
        glycemic_index_rating=glycemic_val,
        timestamp=meal_in.timestamp or datetime.now()
    )
    db.add(meal)
    db.commit()
    db.refresh(meal)

    return MealOut(
        id=meal.id,
        user_id=meal.user_id,
        image_url=meal.image_url,
        food_summary=meal.food_summary,
        food_items=meal_in.food_items or [meal.food_summary],
        calories=meal.calories,
        protein=meal.protein,
        carbs=meal.carbs,
        fats=meal.fats,
        fiber_g=meal.fiber_g or 0.0,
        sodium_mg=meal.sodium_mg or 0.0,
        net_carbs=meal.net_carbs or 0.0,
        hidden_fat_warnings=meal_in.hidden_fat_warnings or [],
        glycemic_impact=glycemic_val,
        cooking_method=meal.cooking_method,
        hidden_fat_estimate_g=meal.hidden_fat_estimate_g,
        glycemic_index_rating=glycemic_val,
        timestamp=meal.timestamp
    )


@router.delete("/meals/{meal_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_meal(
    meal_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Deletes a logged meal owned by the current user."""
    meal = db.query(Meal).filter(Meal.id == meal_id, Meal.user_id == current_user.id).first()
    if not meal:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Meal not found.")
    db.delete(meal)
    db.commit()
    return None


@router.post("/balance-next-meal", response_model=MacroBalancerResponse, summary="Generate a dinner recipe that balances remaining daily macro deficits")
@router.get("/balance-next-meal", response_model=MacroBalancerResponse, summary="Evaluate daily macro balance and generate next meal recipe")
async def balance_next_meal(
    payload: Optional[MacroBalancerRequest] = Body(default=None),
    dietary_preference: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Evaluates the user's daily UserGoals against all logged Meals today.
    Calculates remaining nutritional deficits (calories, protein, carbs, fats).
    If macros are unbalanced, uses Gemini to generate a custom dinner recipe
    that perfectly fills the remaining nutritional deficits.
    """
    # 1. Fetch user goals
    goals = db.query(UserGoals).filter(UserGoals.user_id == current_user.id).first()
    target_cals = float(goals.target_calories if goals else 2000.0)
    target_p = float(goals.target_protein if goals else 150.0)
    target_c = float(goals.target_carbs if goals else 200.0)
    target_f = float(goals.target_fats if goals else 65.0)

    # 2. Fetch today's logged meals
    all_user_meals = (
        db.query(Meal)
        .filter(Meal.user_id == current_user.id)
        .order_by(Meal.timestamp.desc())
        .all()
    )

    now = datetime.now()
    def _is_today(ts):
        if not ts:
            return False
        if hasattr(ts, "date"):
            return ts.date() == now.date()
        try:
            return datetime.fromisoformat(str(ts).replace("Z", "+00:00")).date() == now.date()
        except Exception:
            return False

    today_meals = [m for m in all_user_meals if _is_today(m.timestamp)]
    # If no meals today yet but recent meals exist, consider the most recent batch
    if not today_meals and all_user_meals:
        today_meals = [m for m in all_user_meals[:5]]

    consumed_cals = sum(float(m.calories or 0.0) for m in today_meals)
    consumed_p = sum(float(m.protein or 0.0) for m in today_meals)
    consumed_c = sum(float(m.carbs or 0.0) for m in today_meals)
    consumed_f = sum(float(m.fats or 0.0) for m in today_meals)

    # 3. Calculate deficits
    deficit_cals = max(0.0, target_cals - consumed_cals)
    deficit_p = max(0.0, target_p - consumed_p)
    deficit_c = max(0.0, target_c - consumed_c)
    deficit_f = max(0.0, target_f - consumed_f)

    # Unbalanced flag: if user hasn't met goals (or has notable deficit)
    is_unbalanced = (
        deficit_p >= 15.0 or deficit_c >= 20.0 or deficit_f >= 10.0 or deficit_cals >= 200.0
    )

    diet_pref = (payload.dietary_preference if payload and payload.dietary_preference else dietary_preference)

    # 4. Generate custom balanced recipe with Gemini
    recipe = await generate_macro_balanced_recipe(
        deficits={
            "calories": deficit_cals,
            "protein": deficit_p,
            "carbs": deficit_c,
            "fats": deficit_f
        },
        goals={
            "calories": target_cals,
            "protein": target_p,
            "carbs": target_c,
            "fats": target_f
        },
        consumed={
            "calories": consumed_cals,
            "protein": consumed_p,
            "carbs": consumed_c,
            "fats": consumed_f
        },
        dietary_preference=diet_pref
    )

    return MacroBalancerResponse(
        status="success",
        is_unbalanced=is_unbalanced,
        goals={
            "calories": target_cals,
            "protein": target_p,
            "carbs": target_c,
            "fats": target_f
        },
        consumed={
            "calories": round(consumed_cals, 1),
            "protein": round(consumed_p, 1),
            "carbs": round(consumed_c, 1),
            "fats": round(consumed_f, 1)
        },
        deficits={
            "calories": round(deficit_cals, 1),
            "protein": round(deficit_p, 1),
            "carbs": round(deficit_c, 1),
            "fats": round(deficit_f, 1)
        },
        recipe=recipe,
        message="Generated custom balanced metabolic dinner recipe matching remaining deficits."
    )


@router.post("/ai-coach/chat", response_model=AICoachChatResponse, summary="Chat with AI Personal Food Trainer")
async def ai_coach_chat(
    payload: AICoachChatRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Elite Personal Food Trainer chat powered by Gemini API.
    Injects user's logged meals and sleep data into the system prompt to deliver
    precise, actionable metabolic meal recommendations.
    """
    # 1. Fetch today's logged meals
    all_meals = (
        db.query(Meal)
        .filter(Meal.user_id == current_user.id)
        .order_by(Meal.timestamp.desc())
        .all()
    )

    now = datetime.now()
    def _is_today(ts):
        if not ts:
            return False
        if hasattr(ts, "date"):
            return ts.date() == now.date()
        try:
            return datetime.fromisoformat(str(ts).replace("Z", "+00:00")).date() == now.date()
        except Exception:
            return False

    today_meals_objs = [m for m in all_meals if _is_today(m.timestamp)]
    if not today_meals_objs and all_meals:
        today_meals_objs = all_meals[:5]

    meals_data = [
        {
            "food_summary": m.food_summary,
            "calories": m.calories,
            "protein": m.protein,
            "carbs": m.carbs,
            "fats": m.fats,
            "glycemic_impact": m.glycemic_impact or m.glycemic_index_rating or "Medium",
            "hidden_fat_estimate_g": m.hidden_fat_estimate_g or 0.0,
        }
        for m in today_meals_objs
    ]

    tier = payload.subscription_tier or getattr(current_user, "subscription_tier", 1) or 1
    history_dicts = [{"sender": h.sender, "text": h.text} for h in (payload.history or [])]

    result = await ask_ai_food_trainer(
        message=payload.message,
        today_meals=meals_data,
        sleep_hours=payload.sleep_hours,
        sleep_quality=payload.sleep_quality,
        subscription_tier=tier,
        history=history_dicts
    )

    return AICoachChatResponse(
        reply=result["reply"],
        suggested_meal=result.get("suggested_meal"),
        metabolic_focus=result.get("metabolic_focus"),
        glycemic_recommendation=result.get("glycemic_recommendation")
    )


@router.put("/user/subscription", summary="Update user subscription tier")
def update_subscription(
    payload: SubscriptionTierUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Updates user subscription tier (0 = Free, 1 = Plus, 2 = Pro, 3 = Clinical)."""
    current_user.subscription_tier = payload.subscription_tier
    db.commit()
    db.refresh(current_user)
    return {"status": "success", "subscription_tier": current_user.subscription_tier}
