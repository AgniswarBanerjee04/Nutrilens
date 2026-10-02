"""Authentication utilities: password hashing, JWT encoding/decoding, and user dependency."""

import os
from datetime import datetime, timedelta
from typing import Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, UserGoals, Meal
from app.schemas import TokenData

SECRET_KEY = os.getenv("SECRET_KEY", "nutrilens_super_secret_jwt_key_2025_luxury_dark_aesthetic_key")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 7 days

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login", auto_error=False)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plain password against a stored bcrypt hash."""
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    """Generate a secure bcrypt hash for a password."""
    return pwd_context.hash(password)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Encode user information into a signed JWT."""
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def get_current_user(
    token: Optional[str] = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> User:
    """FastAPI dependency to authenticate requests using JWT Bearer token or demo token."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    if not token:
        raise credentials_exception

    # Seamless instant demo token recognition
    if "demo_token" in token or token.startswith("nutrilens_demo_token"):
        demo_user = db.query(User).filter(User.email == "alexander@nutrilens.ai").first()
        if not demo_user:
            demo_user = User(
                id=9999,
                email="alexander@nutrilens.ai",
                name="Alexander Cole",
                password_hash=get_password_hash("demo_instant_access_2025")
            )
            db.add(demo_user)
            db.commit()
            db.refresh(demo_user)

            # Ensure demo user goals exist
            demo_goals = db.query(UserGoals).filter(UserGoals.user_id == demo_user.id).first()
            if not demo_goals:
                demo_goals = UserGoals(
                    user_id=demo_user.id,
                    target_calories=2350.0,
                    target_protein=175.0,
                    target_carbs=220.0,
                    target_fats=68.0
                )
                db.add(demo_goals)
                db.commit()

            # Ensure demo meals exist
            meal_count = db.query(Meal).filter(Meal.user_id == demo_user.id).count()
            if meal_count == 0:
                import json
                m1 = Meal(
                    user_id=demo_user.id,
                    food_summary="Moong Dal Chilla with Mint Chutney & Paneer Filling",
                    food_items_json=json.dumps([
                        "Sprouted Moong Batter Chillas (2 pcs)",
                        "Low-Fat Paneer & Jeera Filling (75g)",
                        "Pudina-Dhania Chutney (2 tbsp)",
                        "Desi Ghee Crisp Brush"
                    ]),
                    calories=460.0,
                    protein=32.0,
                    carbs=40.0,
                    fats=18.0,
                    cooking_method="Cast-Iron Tawa Griddled with Pure Desi Ghee",
                    hidden_fat_estimate_g=4.5,
                    glycemic_index_rating="Low",
                    hidden_fat_warnings_json=json.dumps([
                        "Desi ghee brushed on cast-iron tawa (~1 tbsp)",
                        "Slow complex carbs from whole sprouted moong"
                    ]),
                    glycemic_impact="Low",
                    image_url="https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=600&q=80"
                )
                m2 = Meal(
                    user_id=demo_user.id,
                    food_summary="Tandoori Murgh Tikka with Dal Tadka & Bajra Roti",
                    food_items_json=json.dumps([
                        "Clay Oven Tandoori Chicken Breast (180g)",
                        "Yellow Moong Dal Tadka (150g)",
                        "Whole Grain Bajra (Pearl Millet) Roti (1 pc)",
                        "Kachumber Salad with Saffron-Lemon Dressing"
                    ]),
                    calories=610.0,
                    protein=50.0,
                    carbs=46.0,
                    fats=22.0,
                    cooking_method="Clay Oven Tandoor-Roasted & Ghee-Tempered Tadka",
                    hidden_fat_estimate_g=6.5,
                    glycemic_index_rating="Low",
                    hidden_fat_warnings_json=json.dumps([
                        "Desi ghee tadka on dal (~1.5 tbsp hidden fat)",
                        "Tandoori butter basting glaze (~5g)"
                    ]),
                    glycemic_impact="Low",
                    image_url="https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?auto=format&fit=crop&w=600&q=80"
                )
                db.add(m1)
                db.add(m2)
                db.commit()
        return demo_user

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: int = payload.get("sub")
        email: str = payload.get("email")
        if user_id is None:
            raise credentials_exception
        token_data = TokenData(user_id=int(user_id), email=email)
    except JWTError:
        raise credentials_exception

    user = db.query(User).filter(User.id == token_data.user_id).first()
    if user is None:
        raise credentials_exception
    return user
