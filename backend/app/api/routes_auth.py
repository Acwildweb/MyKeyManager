from fastapi import APIRouter, Depends, HTTPException, Form
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from .. import schemas, security, models
from ..database import get_db
from ..config import get_settings

router = APIRouter()
settings = get_settings()

@router.post('/login', response_model=schemas.Token)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    """Login endpoint che accetta form data (standard OAuth2)"""
    # Cerca utente per username o email
    user = db.query(models.User).filter(
        (models.User.username == form_data.username) | 
        (models.User.email == form_data.username)
    ).first()
    
    if not user:
        raise HTTPException(
            status_code=400, 
            detail="Utente non trovato"
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=400, 
            detail="Utente disattivato"
        )
    
    if not security.verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=400, 
            detail="Password non corretta"
        )
    
    # Crea token
    token = security.create_access_token(sub=user.username)
    return {"access_token": token, "token_type": "bearer"}

@router.post('/login-json', response_model=schemas.Token)  
def login_json(
    login_data: schemas.LoginRequest,
    db: Session = Depends(get_db)
):
    """Login endpoint alternativo che accetta JSON"""
    # Cerca utente per username o email
    user = db.query(models.User).filter(
        (models.User.username == login_data.username) | 
        (models.User.email == login_data.username)
    ).first()
    
    if not user:
        raise HTTPException(
            status_code=400, 
            detail="Utente non trovato"
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=400, 
            detail="Utente disattivato"
        )
    
    if not security.verify_password(login_data.password, user.password_hash):
        raise HTTPException(
            status_code=400, 
            detail="Password non corretta"
        )
    
    # Crea token
    token = security.create_access_token(sub=user.username)
    return {"access_token": token, "token_type": "bearer"}
