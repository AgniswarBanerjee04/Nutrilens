"""Database configuration and session management for NutriLens."""

import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from typing import Generator

# SQLite database file stored locally in the backend directory
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./nutrilens.db")

# For SQLite, check_same_thread=False allows FastAPI threads to safely use connections
connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(
    DATABASE_URL,
    connect_args=connect_args,
    echo=False
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db() -> Generator:
    """Dependency yields a database session for requests and closes it cleanly."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
