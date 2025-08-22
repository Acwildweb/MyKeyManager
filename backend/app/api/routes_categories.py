from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import schemas, models
from ..database import get_db
from ..deps import get_current_user

router = APIRouter()

@router.post('/', response_model=schemas.CategoryRead)
def create_category(data: schemas.CategoryCreate, db: Session = Depends(get_db), user=Depends(get_current_user)):
    cat = models.Category(name=data.name, icon=data.icon)
    db.add(cat)
    db.commit()
    db.refresh(cat)
    return cat

@router.get('/', response_model=list[schemas.CategoryRead])
def list_categories(db: Session = Depends(get_db), user=Depends(get_current_user)):
    return db.query(models.Category).all()

@router.put('/{category_id}', response_model=schemas.CategoryRead)
def update_category(category_id: int, data: schemas.CategoryCreate, db: Session = Depends(get_db), user=Depends(get_current_user)):
    cat = db.query(models.Category).filter(models.Category.id == category_id).first()
    if not cat:
        raise HTTPException(status_code=404, detail="Category not found")
    
    cat.name = data.name
    if data.icon:
        cat.icon = data.icon
    
    db.commit()
    db.refresh(cat)
    return cat

@router.delete('/{category_id}')
def delete_category(category_id: int, db: Session = Depends(get_db), user=Depends(get_current_user)):
    cat = db.query(models.Category).filter(models.Category.id == category_id).first()
    if not cat:
        raise HTTPException(status_code=404, detail="Category not found")
    
    db.delete(cat)
    db.commit()
    return {"message": "Category deleted successfully"}
