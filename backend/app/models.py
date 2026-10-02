"""SQLAlchemy database models for NutriLens.

Defines:
- User: Core user account with authentication credentials.
- UserGoals: Nutritional and caloric targets configured per user.
- Meal: Visual meal log records capturing nutritional breakdown and image asset.
"""

from datetime import datetime
from sqlalchemy import (
    Column,
    Integer,
    String,
    Float,
    DateTime,
    ForeignKey,
    Text,
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class User(Base):
    """Stores user authentication credentials, profile, and links to goals and meals."""
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    name = Column(String(100), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # 1-to-1 relationship with UserGoals
    goals = relationship(
        "UserGoals",
        back_populates="user",
        uselist=False,
        cascade="all, delete-orphan"
    )

    # 1-to-many relationship with Meals (ordered by recent timestamp)
    meals = relationship(
        "Meal",
        back_populates="user",
        cascade="all, delete-orphan",
        order_by="desc(Meal.timestamp)"
    )

    def __repr__(self) -> str:
        return f"<User(id={self.id}, email='{self.email}', name='{self.name}')>"


class UserGoals(Base):
    """Stores customized macro and calorie targets linked directly to a User."""
    __tablename__ = "user_goals"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        unique=True,
        index=True
    )
    target_calories = Column(Float, nullable=False, default=2000.0)
    target_protein = Column(Float, nullable=False, default=150.0)  # grams
    target_carbs = Column(Float, nullable=False, default=200.0)    # grams
    target_fats = Column(Float, nullable=False, default=65.0)      # grams
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False
    )

    # Relationship back to User
    user = relationship("User", back_populates="goals")

    def __repr__(self) -> str:
        return (
            f"<UserGoals(user_id={self.user_id}, "
            f"cal={self.target_calories}, p={self.target_protein}g, "
            f"c={self.target_carbs}g, f={self.target_fats}g)>"
        )


class Meal(Base):
    """Stores individual visual meal logs, macro calculations, and timestamps."""
    __tablename__ = "meals"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    image_url = Column(Text, nullable=True)
    food_summary = Column(String(255), nullable=False)
    food_items_json = Column(Text, nullable=True)  # JSON-encoded array of food names
    calories = Column(Float, nullable=False, default=0.0)
    protein = Column(Float, nullable=False, default=0.0)  # grams
    carbs = Column(Float, nullable=False, default=0.0)    # grams
    fats = Column(Float, nullable=False, default=0.0)     # grams
    fiber_g = Column(Float, nullable=True, default=0.0)   # dietary fiber in grams
    sodium_mg = Column(Float, nullable=True, default=0.0) # sodium in milligrams
    net_carbs = Column(Float, nullable=True, default=0.0) # net carbs (carbs - fiber) in grams
    cooking_method = Column(String(100), nullable=True, default="Ghee-Tempered Tadka & Griddled")
    hidden_fat_estimate_g = Column(Float, nullable=True, default=0.0)
    glycemic_index_rating = Column(String(50), nullable=True, default="Medium")
    hidden_fat_warnings_json = Column(Text, nullable=True)  # JSON-encoded array of warnings
    glycemic_impact = Column(String(50), nullable=True, default="Medium")
    timestamp = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        index=True,
        nullable=False
    )

    # Relationship back to User
    user = relationship("User", back_populates="meals")

    def __repr__(self) -> str:
        return (
            f"<Meal(id={self.id}, user_id={self.user_id}, "
            f"summary='{self.food_summary}', cal={self.calories})>"
        )
