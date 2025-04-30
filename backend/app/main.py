from fastapi import FastAPI, Depends, HTTPException, Query, status, Response, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
import os
import pymysql
import base64
from io import BytesIO
# Import pandas for data manipulation
try:
    import pandas as pd
    from io import StringIO, BytesIO
    from fastapi.responses import StreamingResponse
    EXPORT_AVAILABLE = True
except ImportError as e:
    import sys
    print(f"Error importing pandas: {e}")
    print(f"Python path: {sys.path}")
    EXPORT_AVAILABLE = False
import logging
import sys

from app import crud, schemas
from app.database import get_db

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)

app = FastAPI(title="Budget Tracker API")

# Configure CORS
origins = [
    "http://localhost:5173",  # Vite default port
    "http://localhost:3000",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize database on startup
@app.on_event("startup")
async def startup_event():
    logger.info("Initializing database on startup...")
    if init_database():
        logger.info("Database initialized successfully.")
        # Create tables
        from app.database import engine
        from app import models
        models.Base.metadata.create_all(bind=engine)
        logger.info("Database tables created or verified.")
    else:
        logger.error("Failed to initialize database.")

@app.get("/")
def read_root():
    return {"message": "Welcome to Budget Tracker API"}

@app.post("/transactions/", response_model=schemas.Transaction, status_code=status.HTTP_201_CREATED)
def create_transaction(transaction: schemas.TransactionCreate, db: Session = Depends(get_db)):
    logger.info(f"Processing transaction: {transaction.reason}, Amount: {transaction.amount}, Date: {transaction.date}")
    try:
        # Always create a new transaction
        result = crud.create_transaction(db=db, transaction=transaction)
        logger.info(f"New transaction created successfully with ID: {result.id}")
        return result
    except Exception as e:
        logger.error(f"Error processing transaction: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error processing transaction: {str(e)}")

@app.get("/transactions/date/{date}", response_model=List[schemas.Transaction])
def read_transactions_by_date_string(date: str, db: Session = Depends(get_db)):
    try:
        # Convert date string to date object
        transaction_date = datetime.strptime(date, "%Y-%m-%d").date()
        transactions = crud.find_transactions_by_date(db, transaction_date)
        return transactions
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD")
    except Exception as e:
        logger.error(f"Error getting transactions by date: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error getting transactions: {str(e)}")

@app.post("/transactions/upload/", response_model=schemas.Transaction, status_code=status.HTTP_201_CREATED)
async def create_transaction_with_file(
    file: UploadFile = File(...),
    date: str = Form(...),
    reason: str = Form(...),
    amount: float = Form(...),
    mode: Optional[str] = Form(None),
    transaction_type: Optional[str] = Form(None),
    gateway: Optional[str] = Form(None),
    vendor: Optional[str] = Form(None),
    category: Optional[str] = Form(None),
    category2: Optional[str] = Form(None),
    split_details: Optional[str] = Form(None),
    comments: Optional[str] = Form(None),
    ignore: Optional[bool] = Form(False),
    db: Session = Depends(get_db)
):
    logger.info(f"Processing transaction with file: {reason}, Amount: {amount}, Date: {date}, File: {file.filename}")
    try:
        # Convert date string to date object
        transaction_date = datetime.strptime(date, "%Y-%m-%d").date()

        # Read file content
        file_content = await file.read()

        # Create transaction object
        transaction = schemas.TransactionCreate(
            date=transaction_date,
            reason=reason,
            amount=amount,
            mode=mode,
            transaction_type=transaction_type,
            gateway=gateway,
            vendor=vendor,
            category=category,
            category2=category2,
            split_details=split_details,
            comments=comments,
            documents=file.filename,
            ignore=ignore
        )

        # Create transaction with file content
        result = crud.create_transaction_with_file(db=db, transaction=transaction, file_content=file_content)
        logger.info(f"New transaction with file created successfully with ID: {result.id}")

        return result
    except Exception as e:
        logger.error(f"Error processing transaction with file: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error processing transaction with file: {str(e)}")

# Database initialization function
def init_database():
    # MySQL connection parameters
    DB_USER = os.getenv("DB_USER", "root")
    DB_PASSWORD = os.getenv("DB_PASSWORD", "")
    DB_HOST = os.getenv("DB_HOST", "localhost")
    DB_PORT = int(os.getenv("DB_PORT", "3306"))
    DB_NAME = os.getenv("DB_NAME", "budget_tracker")

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
        logger.error(f"Error initializing database: {str(e)}")
        return False

@app.get("/transactions/", response_model=List[schemas.Transaction])
def read_transactions(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    transactions = crud.get_transactions(db, skip=skip, limit=limit)
    return transactions

@app.get("/transactions/{transaction_id}", response_model=schemas.Transaction)
def read_transaction(transaction_id: int, db: Session = Depends(get_db)):
    db_transaction = crud.get_transaction(db, transaction_id=transaction_id)
    if db_transaction is None:
        raise HTTPException(status_code=404, detail="Transaction not found")
    return db_transaction

@app.put("/transactions/{transaction_id}", response_model=schemas.Transaction)
def update_transaction(transaction_id: int, transaction: schemas.TransactionUpdate, db: Session = Depends(get_db)):
    db_transaction = crud.get_transaction(db, transaction_id=transaction_id)
    if db_transaction is None:
        raise HTTPException(status_code=404, detail="Transaction not found")

    updated_transaction = crud.update_transaction(db, transaction_id=transaction_id, transaction=transaction)
    return updated_transaction

@app.delete("/transactions/{transaction_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_transaction(transaction_id: int, db: Session = Depends(get_db)):
    db_transaction = crud.get_transaction(db, transaction_id=transaction_id)
    if db_transaction is None:
        raise HTTPException(status_code=404, detail="Transaction not found")

    crud.delete_transaction(db, transaction_id=transaction_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)

@app.get("/transactions/{transaction_id}/document")
def download_document(transaction_id: int, db: Session = Depends(get_db)):
    db_transaction = crud.get_transaction(db, transaction_id=transaction_id)
    if db_transaction is None:
        raise HTTPException(status_code=404, detail="Transaction not found")

    if db_transaction.documents is None:
        raise HTTPException(status_code=404, detail="No document found for this transaction")

    # Get the file content from the database
    file_content = crud.get_transaction_document(db, transaction_id)
    if not file_content:
        raise HTTPException(status_code=404, detail="Document content not found")

    # Determine the file type based on the filename
    filename = db_transaction.documents
    content_type = "application/octet-stream"  # Default content type

    if filename.lower().endswith(".pdf"):
        content_type = "application/pdf"
    elif filename.lower().endswith((".jpg", ".jpeg")):
        content_type = "image/jpeg"
    elif filename.lower().endswith(".png"):
        content_type = "image/png"

    return StreamingResponse(
        BytesIO(file_content),
        media_type=content_type,
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )



@app.put("/transactions/{transaction_id}", response_model=schemas.Transaction)
def update_transaction(transaction_id: int, transaction: schemas.TransactionUpdate, db: Session = Depends(get_db)):
    db_transaction = crud.update_transaction(db, transaction_id=transaction_id, transaction=transaction)
    if db_transaction is None:
        raise HTTPException(status_code=404, detail="Transaction not found")
    return db_transaction

@app.delete("/transactions/{transaction_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_transaction(transaction_id: int, db: Session = Depends(get_db)):
    success = crud.delete_transaction(db, transaction_id=transaction_id)
    if not success:
        raise HTTPException(status_code=404, detail="Transaction not found")
    return {"detail": "Transaction deleted successfully"}

@app.get("/transactions/year/{year}", response_model=List[schemas.Transaction])
def read_transactions_by_year(year: int, db: Session = Depends(get_db)):
    transactions = crud.get_transactions_by_year(db, year=year)
    return transactions

@app.get("/transactions/year/{year}/month/{month}", response_model=List[schemas.Transaction])
def read_transactions_by_month(year: int, month: int, db: Session = Depends(get_db)):
    if month < 1 or month > 12:
        raise HTTPException(status_code=400, detail="Month must be between 1 and 12")
    transactions = crud.get_transactions_by_month(db, year=year, month=month)
    return transactions

@app.get("/transactions/year/{year}/month/{month}/day/{day}", response_model=List[schemas.Transaction])
def read_transactions_by_date(year: int, month: int, day: int, db: Session = Depends(get_db)):
    try:
        datetime(year, month, day)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date")

    transactions = crud.get_transactions_by_date(db, year=year, month=month, day=day)
    return transactions

# Budget endpoints
@app.post("/budgets/", response_model=schemas.Budget, status_code=status.HTTP_201_CREATED)
def create_budget(budget: schemas.BudgetCreate, db: Session = Depends(get_db)):
    logger.info(f"Creating budget for {budget.year}-{budget.month}: {budget.amount}")
    try:
        result = crud.create_budget(db=db, budget=budget)
        logger.info(f"Budget created/updated successfully with ID: {result.id}")
        return result
    except Exception as e:
        logger.error(f"Error creating budget: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error creating budget: {str(e)}")

@app.get("/budgets/", response_model=List[schemas.Budget])
def read_budgets(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    budgets = crud.get_budgets(db, skip=skip, limit=limit)
    return budgets

@app.get("/budgets/{budget_id}", response_model=schemas.Budget)
def read_budget(budget_id: int, db: Session = Depends(get_db)):
    db_budget = crud.get_budget(db, budget_id=budget_id)
    if db_budget is None:
        raise HTTPException(status_code=404, detail="Budget not found")
    return db_budget

@app.get("/budgets/year/{year}/month/{month}", response_model=schemas.Budget)
def read_budget_by_month(year: int, month: int, db: Session = Depends(get_db)):
    if month < 1 or month > 12:
        raise HTTPException(status_code=400, detail="Month must be between 1 and 12")
    db_budget = crud.get_budget_by_month(db, year=year, month=month)
    if db_budget is None:
        raise HTTPException(status_code=404, detail="Budget not found for this month")
    return db_budget

@app.put("/budgets/{budget_id}", response_model=schemas.Budget)
def update_budget(budget_id: int, budget: schemas.BudgetUpdate, db: Session = Depends(get_db)):
    db_budget = crud.update_budget(db, budget_id=budget_id, budget=budget)
    if db_budget is None:
        raise HTTPException(status_code=404, detail="Budget not found")
    return db_budget

@app.delete("/budgets/{budget_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_budget(budget_id: int, db: Session = Depends(get_db)):
    success = crud.delete_budget(db, budget_id=budget_id)
    if not success:
        raise HTTPException(status_code=404, detail="Budget not found")
    return {"detail": "Budget deleted successfully"}

@app.get("/budget-summary/year/{year}/month/{month}", response_model=schemas.MonthlyBudgetSummary)
def get_monthly_budget_summary(year: int, month: int, db: Session = Depends(get_db)):
    if month < 1 or month > 12:
        raise HTTPException(status_code=400, detail="Month must be between 1 and 12")
    summary = crud.get_monthly_budget_summary(db, year=year, month=month)
    return summary

@app.get("/export/csv")
def export_to_csv(
    year: Optional[int] = Query(None, description="Filter by year"),
    month: Optional[int] = Query(None, description="Filter by month"),
    day: Optional[int] = Query(None, description="Filter by day"),
    db: Session = Depends(get_db)
):
    # Check if export is available
    if not EXPORT_AVAILABLE:
        logger.error("CSV export is not available. Required module (pandas) is not installed.")
        raise HTTPException(
            status_code=500,
            detail="CSV export is not available. Please install required package: pip install pandas"
        )

    try:
        logger.info(f"CSV export requested - Year: {year}, Month: {month}, Day: {day}")

        # Get transactions based on filters
        if year and month and day:
            logger.info(f"Getting transactions for date {year}-{month}-{day}")
            try:
                datetime(year, month, day)
            except ValueError:
                raise HTTPException(status_code=400, detail="Invalid date")
            transactions = crud.get_transactions_by_date(db, year=year, month=month, day=day)
            filename = f"{year}_{month:02d}_{day:02d}.csv"
        elif year and month:
            logger.info(f"Getting transactions for year {year}, month {month}")
            transactions = crud.get_transactions_by_month(db, year=year, month=month)
            filename = f"{year}_{month:02d}.csv"
        elif year:
            logger.info(f"Getting transactions for year {year}")
            transactions = crud.get_transactions_by_year(db, year=year)
            filename = f"{year}.csv"
        else:
            logger.info("Getting all transactions")
            transactions = crud.get_transactions(db, limit=1000)
            filename = "all_transactions.csv"

        logger.info(f"Found {len(transactions)} transactions")

        # Convert to DataFrame
        data = []
        for t in transactions:
            # Create document link if document exists
            document_link = f"http://127.0.0.1:8000/transactions/{t.id}/document" if t.documents is not None else ""

            # Format amount with backslash if transaction is ignored
            amount = f"\\{t.amount}" if t.ignore else t.amount

            data.append({
                "Date": t.date,
                "Reason": t.reason,
                "Amount": amount,
                "Mode": t.mode,
                "Transaction Type": t.transaction_type,
                "Gateway": t.gateway,
                "Vendor": t.vendor,
                "Category": t.category,
                "Category2": t.category2,
                "Split Details": t.split_details,
                "Comments": t.comments,
                "Document Link": document_link,
                "Ignored": "Yes" if t.ignore else "No"
            })

        logger.info("Creating DataFrame")
        df = pd.DataFrame(data)

        # Create CSV file
        logger.info("Creating CSV file")
        csv_content = df.to_csv(index=False)

        # Convert to bytes for streaming response
        csv_bytes = csv_content.encode('utf-8')

        logger.info(f"CSV file created successfully: {filename}")

        # Return CSV file as a downloadable response
        return StreamingResponse(
            BytesIO(csv_bytes),
            media_type="text/csv",
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )
    except Exception as e:
        logger.error(f"Error generating CSV file: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error generating CSV file: {str(e)}")

# Keep the old Excel endpoint for backward compatibility, but redirect to CSV
@app.get("/export/excel")
def export_to_excel(
    year: Optional[int] = Query(None, description="Filter by year"),
    month: Optional[int] = Query(None, description="Filter by month"),
    day: Optional[int] = Query(None, description="Filter by day"),
    db: Session = Depends(get_db)
):
    logger.info("Excel export requested, redirecting to CSV export")
    return export_to_csv(year=year, month=month, day=day, db=db)
