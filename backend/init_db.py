import os
import sys
from dotenv import load_dotenv
import pymysql

# Load environment variables
load_dotenv()

# MySQL connection parameters
DB_USER = os.getenv("DB_USER", "root")
DB_PASSWORD = os.getenv("DB_PASSWORD", "")
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = int(os.getenv("DB_PORT", "3306"))
DB_NAME = os.getenv("DB_NAME", "budget_tracker")

def create_database():
    try:
        # Connect to MySQL server without specifying a database
        connection = pymysql.connect(
            host=DB_HOST,
            user=DB_USER,
            password=DB_PASSWORD,
            port=DB_PORT
        )
        
        with connection.cursor() as cursor:
            # Check if database exists
            cursor.execute(f"SHOW DATABASES LIKE '{DB_NAME}'")
            result = cursor.fetchone()
            
            if not result:
                print(f"Creating database '{DB_NAME}'...")
                cursor.execute(f"CREATE DATABASE {DB_NAME}")
                print(f"Database '{DB_NAME}' created successfully!")
            else:
                print(f"Database '{DB_NAME}' already exists.")
        
        connection.close()
        return True
    except Exception as e:
        print(f"Error creating database: {str(e)}")
        return False

def create_tables():
    try:
        # Connect to the database
        connection = pymysql.connect(
            host=DB_HOST,
            user=DB_USER,
            password=DB_PASSWORD,
            port=DB_PORT,
            database=DB_NAME
        )
        
        with connection.cursor() as cursor:
            # Create transactions table
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS transactions (
                id INT AUTO_INCREMENT PRIMARY KEY,
                date DATE NOT NULL,
                reason VARCHAR(255) NOT NULL,
                amount FLOAT NOT NULL,
                mode VARCHAR(50),
                transaction_type VARCHAR(50),
                gateway VARCHAR(100),
                vendor VARCHAR(100),
                category VARCHAR(100),
                split_details TEXT,
                comments TEXT,
                documents VARCHAR(255),
                created_at DATE
            )
            """)
            
            # Create budgets table
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS budgets (
                id INT AUTO_INCREMENT PRIMARY KEY,
                year INT NOT NULL,
                month INT NOT NULL,
                amount FLOAT NOT NULL,
                created_at DATE,
                updated_at DATE,
                UNIQUE KEY year_month_idx (year, month)
            )
            """)
            
            print("Tables created successfully!")
        
        connection.close()
        return True
    except Exception as e:
        print(f"Error creating tables: {str(e)}")
        return False

if __name__ == "__main__":
    print("Initializing database...")
    if create_database():
        if create_tables():
            print("Database initialization completed successfully!")
        else:
            print("Failed to create tables.")
    else:
        print("Failed to create database.")
