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

def migrate_database():
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
                print("Transactions table exists, checking columns...")

                # Get existing columns
                cursor.execute("DESCRIBE transactions")
                columns = [row[0] for row in cursor.fetchall()]

                # Add missing columns
                missing_columns = []

                if 'mode' not in columns:
                    missing_columns.append("ADD COLUMN `mode` VARCHAR(50)")

                if 'transaction_type' not in columns:
                    missing_columns.append("ADD COLUMN `transaction_type` VARCHAR(50)")

                if 'gateway' not in columns:
                    missing_columns.append("ADD COLUMN `gateway` VARCHAR(100)")

                if 'vendor' not in columns:
                    missing_columns.append("ADD COLUMN `vendor` VARCHAR(100)")

                if 'category' not in columns:
                    missing_columns.append("ADD COLUMN `category` VARCHAR(100)")

                if 'category2' not in columns:
                    missing_columns.append("ADD COLUMN `category2` VARCHAR(100)")

                if 'documents' not in columns:
                    missing_columns.append("ADD COLUMN `documents` LONGBLOB")

                if 'ignore' not in columns:
                    missing_columns.append("ADD COLUMN `ignore` BOOLEAN DEFAULT FALSE")

                if 'documents_content' not in columns:
                    missing_columns.append("ADD COLUMN `documents_content` LONGBLOB")
                else:
                    # Convert existing documents column to LONGBLOB if it's not already
                    cursor.execute("SHOW COLUMNS FROM transactions WHERE Field = 'documents'")
                    column_info = cursor.fetchone()
                    if column_info and 'blob' not in column_info[1].lower():
                        print(f"Converting documents column from {column_info[1]} to LONGBLOB...")
                        missing_columns.append("MODIFY COLUMN `documents` LONGBLOB")

                # Execute ALTER TABLE if there are missing columns
                if missing_columns:
                    alter_query = f"ALTER TABLE transactions {', '.join(missing_columns)}"
                    print(f"Executing: {alter_query}")
                    cursor.execute(alter_query)
                    print("Table structure updated successfully!")
                else:
                    print("All required columns already exist.")
            else:
                print("Transactions table doesn't exist. Run the application to create it.")

        connection.close()
        return True
    except Exception as e:
        print(f"Error migrating database: {str(e)}")
        return False

if __name__ == "__main__":
    print("Migrating database schema...")
    if migrate_database():
        print("Database migration completed successfully!")
    else:
        print("Failed to migrate database.")
