import mysql.connector
import os
from dotenv import load_dotenv
import uuid

load_dotenv()

def get_mysql_connection():
    """Get raw MySQL connection for utility operations"""
    # Parse DATABASE_URL
    db_url = os.getenv("DATABASE_URL")
    # Format: mysql+pymysql://user:pass@host:port/db
    # Extract parts
    import re
    pattern = r"mysql\+pymysql://([^:]+):([^@]+)@([^:]+):([^/]+)/(.+)"
    match = re.match(pattern, db_url)
    
    if match:
        user, password, host, port, database = match.groups()
    else:
        user, password, host, port, database = "root", "123456", "localhost", "3307", "fleetflow_db"
    
    return mysql.connector.connect(
        host=host,
        user=user,
        password=password,
        database=database,
        port=port
    )

def create_table_from_sql(sql_file_path):
    """Execute SQL file to create tables"""
    conn = get_mysql_connection()
    cursor = conn.cursor()
    
    with open(sql_file_path, 'r') as file:
        sql_script = file.read()
        
    # Split by semicolon and execute each statement
    statements = sql_script.split(';')
    for statement in statements:
        if statement.strip():
            try:
                cursor.execute(statement)
            except Exception as e:
                print(f"Error executing: {statement[:100]}...")
                print(f"Error: {e}")
    
    conn.commit()
    cursor.close()
    conn.close()
    print("Tables created successfully!")

def generate_uuid():
    """Generate UUID for MySQL"""
    return str(uuid.uuid4())

def execute_raw_query(query, params=None):
    """Execute raw SQL query"""
    conn = get_mysql_connection()
    cursor = conn.cursor(dictionary=True)
    
    try:
        if params:
            cursor.execute(query, params)
        else:
            cursor.execute(query)
        
        if query.strip().upper().startswith('SELECT'):
            result = cursor.fetchall()
        else:
            conn.commit()
            result = cursor.lastrowid
        
        return result
    finally:
        cursor.close()
        conn.close()

# Example usage
if __name__ == "__main__":
    # Test connection
    result = execute_raw_query("SELECT * FROM users LIMIT 5")
    print(result)