"""
Migration script to add new fields to User table
"""

from sqlalchemy import text
from sqlalchemy.exc import ProgrammingError
from ..database import engine

def run_migration():
    """Run the migration to add new user fields"""
    
    # List of columns to add
    columns_to_add = [
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS email VARCHAR;",
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS full_name VARCHAR;",
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;",
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;",
        "ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;"
    ]
    
    with engine.connect() as connection:
        for sql in columns_to_add:
            try:
                connection.execute(text(sql))
                connection.commit()
                print(f"Executed: {sql}")
            except ProgrammingError as e:
                print(f"Error executing {sql}: {e}")
                # Continue with other columns even if one fails
                continue
    
    # Update existing admin user with default values if they don't have them
    update_admin_sql = """
    UPDATE users 
    SET 
        email = COALESCE(email, 'admin@example.com'),
        full_name = COALESCE(full_name, 'Administrator'),
        is_active = COALESCE(is_active, true),
        created_at = COALESCE(created_at, CURRENT_TIMESTAMP),
        updated_at = COALESCE(updated_at, CURRENT_TIMESTAMP)
    WHERE username = 'admin';
    """
    
    with engine.connect() as connection:
        try:
            connection.execute(text(update_admin_sql))
            connection.commit()
            print("Updated admin user with default values")
        except ProgrammingError as e:
            print(f"Error updating admin user: {e}")

if __name__ == "__main__":
    run_migration()
