#!/usr/bin/env python3
"""
Script di migrazione per aggiungere i campi SMTP al modello User
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import engine
from sqlalchemy import text

def upgrade():
    """Aggiunge i campi SMTP alla tabella users"""
    
    # Lista delle colonne da aggiungere
    columns_to_add = [
        ("smtp_host", "VARCHAR(255)"),
        ("smtp_port", "INTEGER"),
        ("smtp_username", "VARCHAR(255)"),
        ("smtp_password", "VARCHAR(255)"),
        ("smtp_from", "VARCHAR(255)"),
        ("smtp_use_tls", "BOOLEAN DEFAULT true")
    ]
    
    with engine.connect() as conn:
        for column_name, column_type in columns_to_add:
            try:
                # Verifica se la colonna esiste già
                result = conn.execute(text(f"""
                    SELECT column_name 
                    FROM information_schema.columns 
                    WHERE table_name='users' AND column_name='{column_name}'
                """))
                
                if result.fetchone() is None:
                    # La colonna non esiste, aggiungila
                    conn.execute(text(f"ALTER TABLE users ADD COLUMN {column_name} {column_type}"))
                    print(f"✅ Aggiunta colonna {column_name}")
                else:
                    print(f"⚠️  Colonna {column_name} già esistente, saltata")
                    
            except Exception as e:
                print(f"❌ Errore aggiungendo colonna {column_name}: {e}")
        
        # Commit delle modifiche
        conn.commit()
        print("🎉 Migrazione completata con successo!")

def downgrade():
    """Rimuove i campi SMTP dalla tabella users"""
    
    columns_to_remove = [
        'smtp_host', 'smtp_port', 'smtp_username', 
        'smtp_password', 'smtp_from', 'smtp_use_tls'
    ]
    
    with engine.connect() as conn:
        for column_name in columns_to_remove:
            try:
                conn.execute(text(f"ALTER TABLE users DROP COLUMN IF EXISTS {column_name}"))
                print(f"✅ Rimossa colonna {column_name}")
            except Exception as e:
                print(f"❌ Errore rimuovendo colonna {column_name}: {e}")
        
        conn.commit()
        print("🗑️  Downgrade completato!")

if __name__ == "__main__":
    print("🚀 Avvio migrazione SMTP...")
    
    if len(sys.argv) > 1 and sys.argv[1] == "downgrade":
        downgrade()
    else:
        upgrade()
