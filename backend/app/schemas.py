"""Pydantic request and response validation schemas for NutriLens."""

from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, EmailStr, Field


# --- Auth & User Schemas ---

class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6, description="Minimum 6 characters")
    name: str = Field(..., min_length=2, max_length=100)


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    id: int
    email: EmailStr
    name: str
    subscription_tier: int = 0
    created_at: datetime

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


class TokenData(BaseModel):
    user_id: Optional[int] = None
    email: Optional[str] = None


# --- User Goals Schemas ---

class UserGoalsBase(BaseModel):
    target_calories: float = Field(default=2000.0, ge=500.0, le=10000.0)
    target_protein: float = Field(default=150.0, ge=0.0, le=1000.0)
    target_carbs: float = Field(default=200.0, ge=0.0, le=1000.0)
    target_fats: float = Field(default=65.0, ge=0.0, le=500.0)


class UserGoalsUpdate(UserGoalsBase):
    pass


class UserGoalsOut(UserGoalsBase):
    id: int
    user_id: int
    updated_at: datetime

    class Config:
        from_attributes = True


# --- Meal Schemas ---

class MealAnalysisResponse(BaseModel):
    """Structured response from the 20-Year Indian Clinical Dietitian Gemini Vision AI endpoint."""
    food_items: List[str] = Field(
        ...,
        description="Array of identified Indian/regional dishes"
    )
    total_calories: float = Field(..., description="Estimated total energy in kcal")
    protein_g: float = Field(..., description="Estimated protein in grams")
    carbs_g: float = Field(..., description="Estimated carbohydrates in grams")
    fats_g: float = Field(..., description="Estimated fats in grams")
    fiber_g: float = Field(default=0.0, description="Estimated dietary fiber in grams")
    sodium_mg: float = Field(default=0.0, description="Estimated sodium in milligrams")
    net_carbs: float = Field(default=0.0, description="Calculated net carbohydrates (carbs - fiber) in grams")
    hidden_fat_warnings: List[str] = Field(
        default_factory=list,
        description="String array of suspected hidden cooking fats (e.g. ghee in tadka, heavy cream, rogan)"
    )
    glycemic_impact: str = Field(
        default="Medium",
        description="Glycemic impact classification ('Low', 'Medium', or 'High')"
    )
    cooking_method: Optional[str] = Field(
        default="Clay Oven Tandoor & Tadka",
        description="Identified cooking method and preparation style"
    )
    hidden_fat_estimate_g: Optional[float] = Field(
        default=0.0,
        description="Estimated hidden cooking fats in grams"
    )
    glycemic_index_rating: Optional[str] = Field(
        default="Medium",
        description="Glycemic index classification"
    )


class MealCreate(BaseModel):
    image_url: Optional[str] = None
    food_summary: str
    food_items: Optional[List[str]] = None
    calories: float
    protein: float
    carbs: float
    fats: float
    fiber_g: Optional[float] = 0.0
    sodium_mg: Optional[float] = 0.0
    net_carbs: Optional[float] = 0.0
    hidden_fat_warnings: Optional[List[str]] = None
    glycemic_impact: Optional[str] = "Medium"
    cooking_method: Optional[str] = "Ghee-Tempered Tadka & Griddled"
    hidden_fat_estimate_g: Optional[float] = 0.0
    glycemic_index_rating: Optional[str] = "Medium"
    timestamp: Optional[datetime] = None


class MealOut(BaseModel):
    id: int
    user_id: int
    image_url: Optional[str] = None
    food_summary: str
    food_items: Optional[List[str]] = None
    calories: float
    protein: float
    carbs: float
    fats: float
    fiber_g: Optional[float] = 0.0
    sodium_mg: Optional[float] = 0.0
    net_carbs: Optional[float] = 0.0
    hidden_fat_warnings: Optional[List[str]] = Field(default_factory=list)
    glycemic_impact: Optional[str] = "Medium"
    cooking_method: Optional[str] = "Ghee-Tempered Tadka & Griddled"
    hidden_fat_estimate_g: Optional[float] = 0.0
    glycemic_index_rating: Optional[str] = "Medium"
    timestamp: datetime

    class Config:
        from_attributes = True


class DashboardSummary(BaseModel):
    """Daily aggregated macro intake vs targets."""
    date: str
    goals: UserGoalsBase
    consumed_calories: float
    consumed_protein: float
    consumed_carbs: float
    consumed_fats: float
    recent_meals: List[MealOut]


# --- Macro-Balancer Schemas ---

class MacroBalancerRequest(BaseModel):
    dietary_preference: Optional[str] = Field(
        default=None,
        description="Optional dietary preference (e.g. 'Vegetarian', 'High-Protein', 'Pescatarian', 'Keto')"
    )


class RecipeMacroAlignment(BaseModel):
    calories: float
    protein_g: float
    carbs_g: float
    fats_g: float
    protein_deficit_filled_pct: Optional[float] = 100.0
    explanation: Optional[str] = None


class RecipeIngredient(BaseModel):
    name: str
    quantity: str
    macro_focus: Optional[str] = None


class RecipeOut(BaseModel):
    recipe_title: str
    tagline: str
    prep_time_minutes: int
    cook_time_minutes: int
    difficulty: str = "Easy"
    cooking_method: str = "Pan-Seared"
    glycemic_index_rating: str = "Low"
    macro_alignment: RecipeMacroAlignment
    ingredients: List[RecipeIngredient]
    instructions: List[str]
    chef_metabolic_tip: Optional[str] = None


class MacroBalancerResponse(BaseModel):
    status: str
    is_unbalanced: bool
    goals: dict
    consumed: dict
    deficits: dict
    recipe: Optional[RecipeOut] = None
    message: Optional[str] = None


# --- Subscription & AI Food Trainer Schemas ---

class SubscriptionTierUpdate(BaseModel):
    subscription_tier: int = Field(..., ge=0, le=3)


class AICoachChatMessage(BaseModel):
    sender: str
    text: str


class AICoachChatRequest(BaseModel):
    message: str
    history: Optional[List[AICoachChatMessage]] = None
    sleep_hours: Optional[float] = None
    sleep_quality: Optional[str] = None
    subscription_tier: int = 1


class AICoachChatResponse(BaseModel):
    reply: str
    suggested_meal: Optional[str] = None
    metabolic_focus: Optional[str] = None
    glycemic_recommendation: Optional[str] = None

