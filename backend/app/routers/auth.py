"""Authentication router: user registration, login, and profile retrieval."""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, UserGoals
from app.schemas import UserCreate, UserLogin, UserOut, Token
from app.auth import verify_password, get_password_hash, create_access_token, get_current_user

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    """Registers a new user, hashes their password, and creates default macro targets."""
    existing_user = db.query(User).filter(User.email == user_in.email.lower()).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists."
        )

    # Create user
    user = User(
        email=user_in.email.lower(),
        name=user_in.name.strip(),
        password_hash=get_password_hash(user_in.password)
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # Initialize default nutritional goals (2000 cal, 150g protein, 200g carbs, 65g fats)
    default_goals = UserGoals(
        user_id=user.id,
        target_calories=2000.0,
        target_protein=150.0,
        target_carbs=200.0,
        target_fats=65.0
    )
    db.add(default_goals)
    db.commit()

    # Generate JWT
    access_token = create_access_token(
        data={"sub": str(user.id), "email": user.email, "name": user.name}
    )

    return Token(
        access_token=access_token,
        token_type="bearer",
        user=UserOut.model_validate(user)
    )


@router.post("/login", response_model=Token)
def login(credentials: UserLogin, db: Session = Depends(get_db)):
    """Authenticates email and password, returning a signed JWT access token."""
    user = db.query(User).filter(User.email == credentials.email.lower()).first()
    if not user or not verify_password(credentials.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token = create_access_token(
        data={"sub": str(user.id), "email": user.email, "name": user.name}
    )

    return Token(
        access_token=access_token,
        token_type="bearer",
        user=UserOut.model_validate(user)
    )


@router.get("/me", response_model=UserOut)
def get_me(current_user: User = Depends(get_current_user)):
    """Returns the authenticated user's profile."""
    return UserOut.model_validate(current_user)


@router.post("/demo", response_model=Token)
def demo_login(db: Session = Depends(get_db)):
    """Provides instant demo credentials and ensures demo account and meals are initialized."""
    demo_user = get_current_user(token="nutrilens_demo_token_initial", db=db)
    access_token = create_access_token(
        data={"sub": str(demo_user.id), "email": demo_user.email, "name": demo_user.name}
    )
    return Token(
        access_token=access_token,
        token_type="bearer",
        user=UserOut.model_validate(demo_user)
    )

