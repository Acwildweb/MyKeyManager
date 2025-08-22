from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from .config import get_settings
from .api.router import api_router
from .database import Base, engine, SessionLocal
from .models import User
from .security import get_password_hash
from .rate_limit import limiter
from .security_headers import SecurityHeadersMiddleware
from slowapi.middleware import SlowAPIMiddleware

settings = get_settings()


app = FastAPI(title=settings.PROJECT_NAME)
app.add_middleware(CORSMiddleware,
    allow_origins=[o.strip() for o in settings.ALLOWED_ORIGINS.split(',')],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(SecurityHeadersMiddleware)
app.state.limiter = limiter
app.add_middleware(SlowAPIMiddleware)

def security_headers_middleware():  # lightweight custom headers
    async def _mw(request: Request, call_next):
        response: Response = await call_next(request)
        response.headers.setdefault("X-Frame-Options", "DENY")
        response.headers.setdefault("X-Content-Type-Options", "nosniff")
        response.headers.setdefault("Referrer-Policy", "no-referrer")
        # Basic CSP (frontend adds stricter headers in nginx)
        response.headers.setdefault(
            "Content-Security-Policy",
            "default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; style-src-elem 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; script-src 'self' https://unpkg.com; script-src-elem 'self' https://unpkg.com; object-src 'none'; frame-ancestors 'none'",
        )
        return response
    return _mw

app.middleware("http")(security_headers_middleware())

app.include_router(api_router, prefix=settings.API_V1_PREFIX)

# Create tables & default user (single-user system)
Base.metadata.create_all(bind=engine)

# Run migration for user table fields
def run_user_migration():
    """Run migration to add new user fields if they don't exist"""
    from sqlalchemy import text
    from sqlalchemy.exc import ProgrammingError
    
    # List of columns to add
    columns_to_add = [
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS email VARCHAR;",
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS full_name VARCHAR;", 
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;",
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;",
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;"
    ]
    
    with engine.connect() as connection:
        for sql in columns_to_add:
            try:
                connection.execute(text(sql))
                connection.commit()
                print(f"Migration executed: {sql}")
            except ProgrammingError as e:
                print(f"Migration error (may be expected if column exists): {e}")
                continue

run_user_migration()

def ensure_default_user():
    db = SessionLocal()
    try:
        username = "admin"
        password = "ChangeMe!123"
        user = db.query(User).filter(User.username == username).first()
        if not user:
            user = User(
                username=username, 
                password_hash=get_password_hash(password),
                email="admin@example.com",
                full_name="Administrator",
                is_active=True
            )
            db.add(user)
            db.commit()
        else:
            # Update existing user with default values for new fields if they're missing
            updated = False
            if not hasattr(user, 'email') or not user.email:
                user.email = "admin@example.com"
                updated = True
            if not hasattr(user, 'full_name') or not user.full_name:
                user.full_name = "Administrator"
                updated = True
            if not hasattr(user, 'is_active') or user.is_active is None:
                user.is_active = True
                updated = True
            
            if updated:
                db.commit()
                print("Updated existing admin user with new fields")
    finally:
        db.close()

ensure_default_user()

@app.get("/health")
async def health():
    return {"status": "ok"}
