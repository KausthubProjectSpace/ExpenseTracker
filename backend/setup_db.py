import os
import logging
import sys
from dotenv import load_dotenv
import pymysql
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

# MySQL connection parameters
DB_USER = os.getenv("DB_USER", "root")
DB_PASSWORD = os.getenv("DB_PASSWORD", "")
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = int(os.getenv("DB_PORT", "3306"))
DB_NAME = os.getenv("DB_NAME", "budget_tracker")

def create_database():
    """Create the database if it doesn't exist"""
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
                logger.info(f"Creating database '{DB_NAME}'...")
                cursor.execute(f"CREATE DATABASE {DB_NAME}")
                logger.info(f"Database '{DB_NAME}' created successfully!")
            else:
                logger.info(f"Database '{DB_NAME}' already exists.")

        connection.close()
        return True
    except Exception as e:
        logger.error(f"Error creating database: {str(e)}")
        return False

def create_tables():
    """Create all tables in the database"""
    try:
        # Import models here to avoid circular imports
        from app.database import engine
        from app import models

        # Create tables
        logger.info("Creating database tables...")
        models.Base.metadata.create_all(bind=engine)
        logger.info("Tables created successfully!")
        return True
    except Exception as e:
        logger.error(f"Error creating tables: {str(e)}")
        return False

def setup_database():
    """Set up the database and create tables"""
    if create_database():
        if create_tables():
            logger.info("Database setup completed successfully!")
            return True
        else:
            logger.error("Failed to create tables.")
            return False
    else:
        logger.error("Failed to create database.")
        return False

def migrate_database():
    """Run database migrations"""
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
            # Check if transactions table exists
            cursor.execute("SHOW TABLES LIKE 'transactions'")
            if cursor.fetchone():
                logger.info("Transactions table exists, checking columns...")

                # Get existing columns
                cursor.execute("DESCRIBE transactions")
                columns = [row[0] for row in cursor.fetchall()]

                # Add missing columns
                missing_columns = []

                if 'category2' not in columns:
                    missing_columns.append("ADD COLUMN `category2` VARCHAR(100)")

                if 'documents' not in columns:
                    missing_columns.append("ADD COLUMN `documents` VARCHAR(255)")

                if 'documents_content' not in columns:
                    missing_columns.append("ADD COLUMN `documents_content` LONGBLOB")

                if 'ignore' not in columns:
                    missing_columns.append("ADD COLUMN `ignore` BOOLEAN DEFAULT FALSE")

                # Execute ALTER TABLE if there are missing columns
                if missing_columns:
                    alter_query = f"ALTER TABLE transactions {', '.join(missing_columns)}"
                    logger.info(f"Executing: {alter_query}")
                    cursor.execute(alter_query)
                    logger.info("Table structure updated successfully!")
                else:
                    logger.info("All required columns already exist.")
            else:
                logger.info("Transactions table doesn't exist. Run the application to create it.")

        connection.close()
        return True
    except Exception as e:
        logger.error(f"Error migrating database: {str(e)}")
        return False

if __name__ == "__main__":
    logger.info("Setting up database...")
    if setup_database():
        logger.info("Running database migrations...")
        if migrate_database():
            logger.info("Database setup and migration completed successfully!")
        else:
            logger.error("Database migration failed.")
    else:
        logger.error("Database setup failed.")
