"""
Migration script per aggiungere campi SMTP al modello User
"""
from sqlalchemy import Column, Integer, String, Boolean, MetaData, Table
from ..database import engine

def upgrade():
    """Aggiunge i campi SMTP alla tabella users"""
    metadata = MetaData()
    metadata.bind = engine
    
    # Carica la tabella esistente
    users_table = Table('users', metadata, autoload=True)
    
    # Definisci le nuove colonne
    smtp_columns = [
        Column('smtp_host', String(255), nullable=True),
        Column('smtp_port', Integer, nullable=True),
        Column('smtp_username', String(255), nullable=True),
        Column('smtp_password', String(255), nullable=True),
        Column('smtp_from', String(255), nullable=True),
        Column('smtp_use_tls', Boolean, default=True)
    ]
    
    # Aggiungi le colonne
    for column in smtp_columns:
        try:
            with engine.connect() as conn:
                # Costruisci il comando ALTER TABLE
                alter_sql = f"ALTER TABLE users ADD COLUMN {column.name} {column.type.compile(engine.dialect)}"
                if column.default is not None and column.name == 'smtp_use_tls':
                    alter_sql += " DEFAULT true"
                conn.execute(alter_sql)
                print(f"Aggiunta colonna {column.name}")
        except Exception as e:
            print(f"Errore aggiungendo colonna {column.name}: {e}")

def downgrade():
    """Rimuove i campi SMTP dalla tabella users"""
    smtp_columns = [
        'smtp_host', 'smtp_port', 'smtp_username', 
        'smtp_password', 'smtp_from', 'smtp_use_tls'
    ]
    
    for column_name in smtp_columns:
        try:
            with engine.connect() as conn:
                alter_sql = f"ALTER TABLE users DROP COLUMN {column_name}"
                conn.execute(alter_sql)
                print(f"Rimossa colonna {column_name}")
        except Exception as e:
            print(f"Errore rimuovendo colonna {column_name}: {e}")

if __name__ == "__main__":
    upgrade()
