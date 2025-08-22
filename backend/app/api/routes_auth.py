from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import schemas, security, models
from ..database import get_db
from ..config import get_settings

router = APIRouter()
settings = get_settings()

@router.post('/login', response_model=schemas.Token)
def login(data: schemas.UserCreate, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.username == data.username).first()
    if not user or not security.verify_password(data.password, user.password_hash):
        raise HTTPException(status_code=400, detail="Invalid credentials")
    token = security.create_access_token(sub=user.username)
    return {"access_token": token, "token_type": "bearer"}
