from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
from .. import schemas, models, email_utils
from ..database import get_db
from ..deps import get_current_user

router = APIRouter()

@router.post('/', response_model=schemas.LicenseRead)
def create_license(data: schemas.LicenseCreate, db: Session = Depends(get_db), user=Depends(get_current_user)):
    # Converti i dati in un dizionario e gestisci il campo iso_url
    license_data = data.dict()
    
    # Se iso_url è presente e non è già una stringa, convertilo
    if license_data.get('iso_url') is not None:
        license_data['iso_url'] = str(license_data['iso_url'])
    
    lic = models.License(**license_data)
    db.add(lic)
    db.commit()
    db.refresh(lic)
    return lic

@router.get('/', response_model=list[schemas.LicenseRead])
def list_licenses(db: Session = Depends(get_db), user=Depends(get_current_user)):
    return db.query(models.License).all()

@router.post('/{license_id}/use', response_model=schemas.LicenseRead)
def use_license(license_id: int, req: schemas.LicenseUseRequest, db: Session = Depends(get_db), user=Depends(get_current_user)):
    lic = db.query(models.License).filter(models.License.id == license_id).first()
    if not lic:
        raise HTTPException(status_code=404, detail="License not found")
    lic.last_used_at = datetime.utcnow()
    db.commit()
    db.refresh(lic)
    
    # Invia email con le informazioni dell'utente
    email_utils.send_license_email(lic.license_key, lic.iso_url, user)
    return lic

@router.put('/{license_id}', response_model=schemas.LicenseRead)
def update_license(license_id: int, data: schemas.LicenseUpdate, db: Session = Depends(get_db), user=Depends(get_current_user)):
    lic = db.query(models.License).filter(models.License.id == license_id).first()
    if not lic:
        raise HTTPException(status_code=404, detail="License not found")
    
    # Aggiorna solo i campi forniti
    update_data = data.dict(exclude_unset=True)
    
    # Converti iso_url in stringa se presente
    if 'iso_url' in update_data and update_data['iso_url'] is not None:
        update_data['iso_url'] = str(update_data['iso_url'])
    
    for field, value in update_data.items():
        setattr(lic, field, value)
    
    db.commit()
    db.refresh(lic)
    return lic

@router.delete('/{license_id}')
def delete_license(license_id: int, db: Session = Depends(get_db), user=Depends(get_current_user)):
    lic = db.query(models.License).filter(models.License.id == license_id).first()
    if not lic:
        raise HTTPException(status_code=404, detail="License not found")
    
    db.delete(lic)
    db.commit()
    return {"message": "License deleted successfully"}
