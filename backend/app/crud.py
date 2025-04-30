from sqlalchemy.orm import Session
from datetime import datetime
import app.models as models
import app.schemas as schemas

def get_transaction(db: Session, transaction_id: int):
    return db.query(models.Transaction).filter(models.Transaction.id == transaction_id).first()

def update_transaction(db: Session, transaction_id: int, transaction: schemas.TransactionUpdate):
    """Update an existing transaction"""
    # Get the transaction
    db_transaction = get_transaction(db, transaction_id)
    if not db_transaction:
        return None

    # Update the transaction fields
    for key, value in transaction.model_dump(exclude_unset=True).items():
        setattr(db_transaction, key, value)

    try:
        db.commit()
        db.refresh(db_transaction)
        return db_transaction
    except Exception as e:
        db.rollback()
        raise

def delete_transaction(db: Session, transaction_id: int):
    """Delete a transaction by ID"""
    db_transaction = get_transaction(db, transaction_id)
    if db_transaction:
        db.delete(db_transaction)
        db.commit()
        return True
    return False

def get_transactions(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Transaction).order_by(models.Transaction.date.desc()).offset(skip).limit(limit).all()

def get_transactions_by_year(db: Session, year: int):
    start_date = datetime(year, 1, 1).date()
    end_date = datetime(year, 12, 31).date()
    return db.query(models.Transaction).filter(
        models.Transaction.date >= start_date,
        models.Transaction.date <= end_date
    ).order_by(models.Transaction.date.desc()).all()

def get_transactions_by_month(db: Session, year: int, month: int):
    # Calculate start date (first day of month)
    start_date = datetime(year, month, 1).date()

    # Calculate the last day of the month
    import calendar
    _, last_day = calendar.monthrange(year, month)
    end_date = datetime(year, month, last_day).date()

    return db.query(models.Transaction).filter(
        models.Transaction.date >= start_date,
        models.Transaction.date <= end_date
    ).order_by(models.Transaction.date.desc()).all()

def get_transactions_by_date(db: Session, year: int, month: int, day: int):
    # Create the specific date
    specific_date = datetime(year, month, day).date()

    return db.query(models.Transaction).filter(
        models.Transaction.date == specific_date
    ).order_by(models.Transaction.date.desc()).all()

def find_transactions_by_date(db: Session, date):
    """Find all transactions with the same date"""
    return db.query(models.Transaction).filter(
        models.Transaction.date == date
    ).all()

def get_transaction_by_id(db: Session, transaction_id: int):
    """Get a transaction by its ID"""
    return db.query(models.Transaction).filter(
        models.Transaction.id == transaction_id
    ).first()

def create_transaction(db: Session, transaction: schemas.TransactionCreate):
    print(f"Creating new transaction: {transaction}")

    # Create a new transaction
    db_transaction = models.Transaction(
        date=transaction.date,
        reason=transaction.reason,
        amount=transaction.amount,
        mode=transaction.mode,
        transaction_type=transaction.transaction_type,
        gateway=transaction.gateway,
        vendor=transaction.vendor,
        category=transaction.category,
        category2=transaction.category2,
        split_details=transaction.split_details,
        comments=transaction.comments,
        documents=transaction.documents,
        ignore=transaction.ignore
    )
    print(f"New transaction object created: {db_transaction.reason}, {db_transaction.amount}")
    try:
        db.add(db_transaction)
        print("Transaction added to session")
        db.commit()
        print("Transaction committed to database")
        db.refresh(db_transaction)
        print(f"Transaction refreshed, ID: {db_transaction.id}")
        return db_transaction
    except Exception as e:
        print(f"Error saving transaction: {str(e)}")
        db.rollback()
        raise

def create_transaction_with_file(db: Session, transaction: schemas.TransactionCreate, file_content: bytes):
    print(f"Creating new transaction with file: {transaction}")

    # Create a new transaction
    db_transaction = models.Transaction(
        date=transaction.date,
        reason=transaction.reason,
        amount=transaction.amount,
        mode=transaction.mode,
        transaction_type=transaction.transaction_type,
        gateway=transaction.gateway,
        vendor=transaction.vendor,
        category=transaction.category,
        category2=transaction.category2,
        split_details=transaction.split_details,
        comments=transaction.comments,
        documents=transaction.documents,  # Store the filename
        documents_content=file_content,  # Store the file content
        ignore=transaction.ignore
    )
    print(f"New transaction object with file created: {db_transaction.reason}, {db_transaction.amount}")
    try:
        db.add(db_transaction)
        print("Transaction with file added to session")
        db.commit()
        print("Transaction with file committed to database")
        db.refresh(db_transaction)
        print(f"Transaction with file refreshed: ID {db_transaction.id}")
        return db_transaction
    except Exception as e:
        print(f"Error creating transaction with file: {str(e)}")
        db.rollback()
        raise

def get_transaction_document(db: Session, transaction_id: int):
    """Get the document content for a transaction"""
    transaction = get_transaction(db, transaction_id)
    if not transaction or not transaction.documents:
        return None

    # In a real implementation, you might have a separate table for documents
    # For now, we'll assume the document content is stored in the documents_content field
    return transaction.documents_content

def update_transaction(db: Session, transaction_id: int, transaction: schemas.TransactionUpdate):
    db_transaction = get_transaction(db, transaction_id)
    if db_transaction:
        # Use model_dump instead of dict (which is deprecated)
        update_data = transaction.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_transaction, key, value)
        db.commit()
        db.refresh(db_transaction)
    return db_transaction

def delete_transaction(db: Session, transaction_id: int):
    db_transaction = get_transaction(db, transaction_id)
    if db_transaction:
        db.delete(db_transaction)
        db.commit()
        return True
    return False

# Budget CRUD operations
def get_budget(db: Session, budget_id: int):
    return db.query(models.Budget).filter(models.Budget.id == budget_id).first()

def get_budget_by_month(db: Session, year: int, month: int):
    return db.query(models.Budget).filter(
        models.Budget.year == year,
        models.Budget.month == month
    ).first()

def get_budgets(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Budget).order_by(models.Budget.year.desc(), models.Budget.month.desc()).offset(skip).limit(limit).all()

def create_budget(db: Session, budget: schemas.BudgetCreate):
    # Check if a budget for this month already exists
    existing_budget = get_budget_by_month(db, budget.year, budget.month)

    if existing_budget:
        # Update the existing budget
        existing_budget.amount = budget.amount
        db.commit()
        db.refresh(existing_budget)
        return existing_budget
    else:
        # Create a new budget
        db_budget = models.Budget(
            year=budget.year,
            month=budget.month,
            amount=budget.amount
        )
        db.add(db_budget)
        db.commit()
        db.refresh(db_budget)
        return db_budget

def update_budget(db: Session, budget_id: int, budget: schemas.BudgetUpdate):
    db_budget = get_budget(db, budget_id)
    if db_budget:
        update_data = budget.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_budget, key, value)
        db.commit()
        db.refresh(db_budget)
    return db_budget

def delete_budget(db: Session, budget_id: int):
    db_budget = get_budget(db, budget_id)
    if db_budget:
        db.delete(db_budget)
        db.commit()
        return True
    return False

# Budget summary calculations
def get_monthly_budget_summary(db: Session, year: int, month: int):
    # Get the budget for the month
    budget = get_budget_by_month(db, year, month)
    budget_amount = budget.amount if budget else 0

    # Get all transactions for the month
    transactions = get_transactions_by_month(db, year, month)

    # Calculate total spent (debit) and earned (credit)
    spent = 0
    earned = 0
    for transaction in transactions:
        # Skip ignored transactions in calculations
        if transaction.ignore:
            continue

        if transaction.mode == 'DEBIT':
            spent += transaction.amount
        elif transaction.mode == 'CREDIT':
            earned += transaction.amount

    # Calculate remaining budget
    remaining = budget_amount - spent + earned

    return {
        "year": year,
        "month": month,
        "budget": budget_amount,
        "spent": spent,
        "earned": earned,
        "remaining": remaining,
        "transactions": transactions
    }
