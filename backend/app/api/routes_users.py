from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from .. import models, schemas
from ..database import get_db
from ..deps import get_current_user
from ..security import get_password_hash, verify_password

router = APIRouter()

@router.get("/me", response_model=schemas.UserRead)
def get_current_user_profile(current_user: models.User = Depends(get_current_user)):
    """Get current user profile"""
    return current_user

@router.put("/me", response_model=schemas.UserRead)
def update_current_user_profile(
    user_update: schemas.UserUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Update current user profile"""
    # Verifica se lo username è già in uso da un altro utente
    if user_update.username and user_update.username != current_user.username:
        existing_user = db.query(models.User).filter(
            models.User.username == user_update.username,
            models.User.id != current_user.id
        ).first()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username già in uso"
            )
    
    # Verifica se l'email è già in uso da un altro utente
    if user_update.email and user_update.email != current_user.email:
        existing_user = db.query(models.User).filter(
            models.User.email == user_update.email,
            models.User.id != current_user.id
        ).first()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email già in uso"
            )
    
    # Aggiorna i campi se forniti
    if user_update.username:
        current_user.username = user_update.username
    if user_update.email:
        current_user.email = user_update.email
    if user_update.full_name:
        current_user.full_name = user_update.full_name
    if user_update.password:
        current_user.password_hash = get_password_hash(user_update.password)
    if user_update.is_active is not None:
        current_user.is_active = user_update.is_active
    
    db.commit()
    db.refresh(current_user)
    return current_user

@router.post("/change-password")
def change_password(
    current_password: str,
    new_password: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Change user password"""
    # Verifica la password attuale
    if not verify_password(current_password, current_user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password attuale non corretta"
        )
    
    # Aggiorna la password
    current_user.password_hash = get_password_hash(new_password)
    db.commit()
    
    return {"message": "Password aggiornata con successo"}

@router.get("/me/smtp", response_model=schemas.SMTPSettings)
def get_smtp_settings(current_user: models.User = Depends(get_current_user)):
    """Get current user SMTP settings"""
    return schemas.SMTPSettings(
        smtp_host=current_user.smtp_host,
        smtp_port=current_user.smtp_port,
        smtp_username=current_user.smtp_username,
        smtp_password=None,  # Non restituire mai la password per sicurezza
        smtp_from=current_user.smtp_from,
        smtp_use_tls=current_user.smtp_use_tls
    )

@router.put("/me/smtp")
def update_smtp_settings(
    smtp_update: schemas.UserSMTPUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Update current user SMTP settings"""
    # Aggiorna i campi SMTP se forniti
    if smtp_update.smtp_host is not None:
        current_user.smtp_host = smtp_update.smtp_host
    if smtp_update.smtp_port is not None:
        current_user.smtp_port = smtp_update.smtp_port
    if smtp_update.smtp_username is not None:
        current_user.smtp_username = smtp_update.smtp_username
    if smtp_update.smtp_password is not None:
        current_user.smtp_password = smtp_update.smtp_password
    if smtp_update.smtp_from is not None:
        current_user.smtp_from = smtp_update.smtp_from
    if smtp_update.smtp_use_tls is not None:
        current_user.smtp_use_tls = smtp_update.smtp_use_tls
    
    db.commit()
    db.refresh(current_user)
    
    return {"message": "Impostazioni SMTP aggiornate con successo"}

@router.delete("/me/smtp")
def reset_smtp_settings(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Reset SMTP settings to default (use system settings)"""
    current_user.smtp_host = None
    current_user.smtp_port = None
    current_user.smtp_username = None
    current_user.smtp_password = None
    current_user.smtp_from = None
    current_user.smtp_use_tls = True
    
    db.commit()
    
    return {"message": "Impostazioni SMTP resettate alle impostazioni di sistema"}

@router.post("/me/smtp/test")
def test_smtp_connection(
    smtp_test: schemas.UserSMTPUpdate,
    current_user: models.User = Depends(get_current_user)
):
    """Test SMTP connection with provided settings without sending email"""
    import smtplib
    from ..config import get_settings
    
    settings = get_settings()
    
    # Usa i parametri forniti o quelli dell'utente o di sistema come fallback
    smtp_host = smtp_test.smtp_host or current_user.smtp_host or settings.SMTP_HOST
    smtp_port = smtp_test.smtp_port or current_user.smtp_port or settings.SMTP_PORT
    smtp_username = smtp_test.smtp_username or current_user.smtp_username or settings.SMTP_USERNAME
    smtp_password = smtp_test.smtp_password or current_user.smtp_password or settings.SMTP_PASSWORD
    smtp_use_tls = smtp_test.smtp_use_tls if smtp_test.smtp_use_tls is not None else (
        current_user.smtp_use_tls if current_user.smtp_use_tls is not None else True
    )
    
    if not smtp_host:
        return {
            "success": False,
            "message": "Host SMTP richiesto per il test",
            "details": "Specificare almeno l'host SMTP per testare la connessione"
        }
    
    try:
        # Test della connessione SMTP
        with smtplib.SMTP(smtp_host, smtp_port, timeout=10) as server:
            # Test TLS se abilitato
            if smtp_use_tls:
                server.starttls()
            
            # Test autenticazione se fornita
            if smtp_username and smtp_password:
                server.login(smtp_username, smtp_password)
                auth_status = "✅ Autenticazione riuscita"
            else:
                auth_status = "⚠️ Nessuna autenticazione testata"
            
            return {
                "success": True,
                "message": "Test connessione SMTP riuscito!",
                "details": {
                    "host": smtp_host,
                    "port": smtp_port,
                    "tls": "✅ TLS abilitato" if smtp_use_tls else "⚠️ TLS disabilitato",
                    "authentication": auth_status,
                    "status": "Connessione stabilita con successo"
                }
            }
            
    except smtplib.SMTPAuthenticationError:
        return {
            "success": False,
            "message": "Errore di autenticazione SMTP",
            "details": "Username o password non corretti. Verifica le credenziali."
        }
    except smtplib.SMTPConnectError as e:
        return {
            "success": False,
            "message": "Errore di connessione SMTP",
            "details": f"Impossibile connettersi al server {smtp_host}:{smtp_port}. Dettagli: {str(e)}"
        }
    except smtplib.SMTPServerDisconnected:
        return {
            "success": False,
            "message": "Disconnessione server SMTP",
            "details": "Il server SMTP ha chiuso la connessione inaspettatamente."
        }
    except Exception as e:
        return {
            "success": False,
            "message": "Errore durante il test SMTP",
            "details": f"Errore imprevisto: {str(e)}"
        }
