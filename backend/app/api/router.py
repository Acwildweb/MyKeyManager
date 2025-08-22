from fastapi import APIRouter
from . import routes_auth, routes_categories, routes_licenses, routes_users

api_router = APIRouter()

# Health check endpoint
@api_router.get("/health")
async def health_check():
    return {"status": "healthy", "message": "MyKeyManager API is running"}

api_router.include_router(routes_auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(routes_categories.router, prefix="/categories", tags=["categories"])
api_router.include_router(routes_licenses.router, prefix="/licenses", tags=["licenses"])
api_router.include_router(routes_users.router, prefix="/users", tags=["users"])
