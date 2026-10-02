"""NutriLens FastAPI Main Application.

Entry point for the NutriLens backend service.
Provides:
- CORS middleware for seamless local and cloud frontend communication
- Automated SQLite table provisioning
- Routers for Authentication, Meals/Vision AI, and Macro Goals
- Health status inspection
"""

import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.routers import auth, meals, goals


from sqlalchemy import text


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifecycle event handler: creates tables on startup and migrates schema."""
    # Ensure database tables exist
    Base.metadata.create_all(bind=engine)

    # Migrate any missing columns in existing SQLite table
    try:
        with engine.begin() as conn:
            existing_cols = [row[1] for row in conn.execute(text("PRAGMA table_info(meals)"))]
            if "cooking_method" not in existing_cols:
                conn.execute(text("ALTER TABLE meals ADD COLUMN cooking_method VARCHAR(100) DEFAULT 'Ghee-Tempered Tadka & Griddled'"))
            if "hidden_fat_estimate_g" not in existing_cols:
                conn.execute(text("ALTER TABLE meals ADD COLUMN hidden_fat_estimate_g FLOAT DEFAULT 0.0"))
            if "glycemic_index_rating" not in existing_cols:
                conn.execute(text("ALTER TABLE meals ADD COLUMN glycemic_index_rating VARCHAR(50) DEFAULT 'Medium'"))
            if "hidden_fat_warnings_json" not in existing_cols:
                conn.execute(text("ALTER TABLE meals ADD COLUMN hidden_fat_warnings_json TEXT"))
            if "glycemic_impact" not in existing_cols:
                conn.execute(text("ALTER TABLE meals ADD COLUMN glycemic_impact VARCHAR(50) DEFAULT 'Medium'"))
            if "fiber_g" not in existing_cols:
                conn.execute(text("ALTER TABLE meals ADD COLUMN fiber_g FLOAT DEFAULT 0.0"))
            if "sodium_mg" not in existing_cols:
                conn.execute(text("ALTER TABLE meals ADD COLUMN sodium_mg FLOAT DEFAULT 0.0"))
            if "net_carbs" not in existing_cols:
                conn.execute(text("ALTER TABLE meals ADD COLUMN net_carbs FLOAT DEFAULT 0.0"))

            user_cols = [row[1] for row in conn.execute(text("PRAGMA table_info(users)"))]
            if "subscription_tier" not in user_cols:
                conn.execute(text("ALTER TABLE users ADD COLUMN subscription_tier INTEGER DEFAULT 0"))
    except Exception as e:
        # Tables might not be created yet or already updated
        pass

    yield


app = FastAPI(
    title="NutriLens AI API",
    description="Vision-based nutrition and macronutrient tracking platform with Gemini Vision AI.",
    version="1.0.0",
    lifespan=lifespan
)

# CORS configuration
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "*"  # Allows access from Vercel deployments and preview URLs
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Routers
app.include_router(auth.router)
app.include_router(meals.router)
app.include_router(goals.router)


@app.get("/", tags=["Health"])
def root():
    return {
        "app": "NutriLens API",
        "status": "online",
        "docs": "/docs",
        "version": "1.0.0"
    }


@app.get("/api/health", tags=["Health"])
def health_check():
    return {"status": "healthy", "service": "nutrilens-backend"}
