import smtplib
from email.message import EmailMessage
from .config import get_settings
from .models import User

settings = get_settings()

import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime
from .config import get_settings

def send_license_email(license_data: dict, user=None):
    """Invia email di notifica uso licenza"""
    settings = get_settings()
    msg = MIMEMultipart()
    msg["Subject"] = f"Licenza utilizzata: {license_data['product_name']}"
    
    # Utilizza le impostazioni SMTP dell'utente se disponibili, altrimenti quelle di sistema
    smtp_host = user.smtp_host if user and user.smtp_host else settings.SMTP_HOST
    smtp_port = user.smtp_port if user and user.smtp_port else settings.SMTP_PORT
    smtp_username = user.smtp_username if user and user.smtp_username else settings.SMTP_USERNAME
    smtp_password = user.smtp_password if user and user.smtp_password else settings.SMTP_PASSWORD
    smtp_from = user.smtp_from if user and user.smtp_from else settings.SMTP_FROM
    smtp_use_tls = user.smtp_use_tls if user and hasattr(user, 'smtp_use_tls') and user.smtp_use_tls is not None else True
    
    msg["From"] = smtp_from
    
    # Determina i destinatari
    recipients = [smtp_from]
    if user and user.email and user.email != smtp_from:
        recipients.append(user.email)
    
    msg["To"] = ", ".join(recipients)
    
    # Corpo del messaggio
    body = f"""
    Salve,
    
    È stata utilizzata una licenza nel sistema:
    
    Prodotto: {license_data['product_name']}
    Versione: {license_data.get('version', 'N/A')}
    Vendor: {license_data.get('vendor', 'N/A')}
    Categoria: {license_data.get('category_name', 'N/A')}
    Data utilizzo: {datetime.now().strftime('%d/%m/%Y %H:%M:%S')}
    
    {'Download ISO richiesto' if license_data.get('iso_download') else 'Nessun download ISO richiesto'}
    
    Cordiali saluti,
    Sistema di gestione licenze
    """
    
    msg.attach(MIMEText(body, "plain"))
    
    try:
        with smtplib.SMTP(smtp_host, smtp_port) as s:
            s.starttls()
            if smtp_username:
                s.login(smtp_username, smtp_password)
            s.send_message(msg, to_addrs=recipients)
        return True
    except Exception as e:
        print(f"Errore invio email: {e}")
        return False
