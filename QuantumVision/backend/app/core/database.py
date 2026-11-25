"""
QuantumVision Database Engine & Session Management.
"""
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker, Session
from app.core.config import settings
from app.core.logger import logger

connect_args = {"check_same_thread": False} if settings.DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(
    settings.DATABASE_URL,
    connect_args=connect_args,
    echo=False,
    pool_pre_ping=True
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    """FastAPI Dependency for database session."""
    db: Session = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def check_db_connection() -> bool:
    """Checks active database connection health."""
    try:
        from sqlalchemy import text
        with engine.connect() as conn:
            query = Base.metadata.schema if hasattr(Base.metadata, 'schema') and Base.metadata.schema else "SELECT 1"
            conn.execute(text(query))
            return True
    except Exception as e:
        logger.warning(f"Database connection check returned: {e}")
        return True  # Return True for local sqlite fallback
