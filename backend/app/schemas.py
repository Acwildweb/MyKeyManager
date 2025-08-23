from pydantic import BaseModel, Field, validator
from datetime import datetime
from typing import Optional
import re

class CategoryCreate(BaseModel):
    name: str
    icon: Optional[str] = None

class CategoryRead(CategoryCreate):
    id: int
    class Config:
        orm_mode = True

class LicenseBase(BaseModel):
    category_id: int
    product_name: str
    edition: Optional[str] = None
    vendor: Optional[str] = None
    version: Optional[str] = None
    iso_url: Optional[str] = None
    
    @validator('iso_url')
    def validate_url(cls, v):
        if v is not None and v.strip():
            # Semplice validazione URL
            url_pattern = re.compile(
                r'^https?://'  # http:// or https://
                r'(?:(?:[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?\.)+[A-Z]{2,6}\.?|'  # domain...
                r'localhost|'  # localhost...
                r'\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})'  # ...or ip
                r'(?::\d+)?'  # optional port
                r'(?:/?|[/?]\S+)$', re.IGNORECASE)
            if not url_pattern.match(v):
                raise ValueError('URL non valido')
        return v

class LicenseCreate(LicenseBase):
    license_key: str = Field(min_length=5)

class LicenseUpdate(BaseModel):
    product_name: Optional[str] = None
    edition: Optional[str] = None
    vendor: Optional[str] = None
    version: Optional[str] = None
    iso_url: Optional[str] = None
    license_key: Optional[str] = None

class LicenseRead(LicenseBase):
    id: int
    license_key: str
    last_used_at: Optional[datetime]
    created_at: datetime
    updated_at: datetime
    class Config:
        orm_mode = True

class UserCreate(BaseModel):
    username: str
    password: str
    email: Optional[str] = None
    full_name: Optional[str] = None

class UserUpdate(BaseModel):
    username: Optional[str] = None
    email: Optional[str] = None
    full_name: Optional[str] = None
    password: Optional[str] = None
    is_active: Optional[bool] = None

class SMTPSettings(BaseModel):
    smtp_host: Optional[str] = None
    smtp_port: Optional[int] = None
    smtp_username: Optional[str] = None
    smtp_password: Optional[str] = None
    smtp_from: Optional[str] = None
    smtp_use_tls: Optional[bool] = True

class UserSMTPUpdate(BaseModel):
    smtp_host: Optional[str] = None
    smtp_port: Optional[int] = None
    smtp_username: Optional[str] = None
    smtp_password: Optional[str] = None
    smtp_from: Optional[str] = None
    smtp_use_tls: Optional[bool] = None

class UserRead(BaseModel):
    id: int
    username: str
    email: Optional[str] = None
    full_name: Optional[str] = None
    is_active: bool
    created_at: datetime
    updated_at: datetime
    smtp_host: Optional[str] = None
    smtp_port: Optional[int] = None
    smtp_username: Optional[str] = None
    smtp_from: Optional[str] = None
    smtp_use_tls: Optional[bool] = None
    class Config:
        orm_mode = True

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

class LoginRequest(BaseModel):
    username: str  # Può essere username o email
    password: str

class LicenseUseRequest(BaseModel):
    iso_download: bool = True

class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str
