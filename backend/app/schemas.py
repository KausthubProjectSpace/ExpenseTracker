from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import date

class TransactionBase(BaseModel):
    date: date
    reason: str
    amount: float
    mode: Optional[str] = None  # CREDIT, DEBIT, CARD
    transaction_type: Optional[str] = None  # CASH, UPI, etc.
    gateway: Optional[str] = None  # CARD/Credit/DEBIT, UPI, etc.
    vendor: Optional[str] = None
    category: Optional[str] = None  # Primary category
    category2: Optional[str] = None  # Secondary category
    split_details: Optional[str] = None
    comments: Optional[str] = None
    documents: Optional[str] = None  # PDF or Screen shots
    ignore: Optional[bool] = False  # Flag to ignore transaction in calculations

class TransactionCreate(TransactionBase):
    pass

class Transaction(TransactionBase):
    id: int
    created_at: date

    class Config:
        orm_mode = True

class TransactionUpdate(BaseModel):
    date: Optional[date] = None
    reason: Optional[str] = None
    amount: Optional[float] = None
    mode: Optional[str] = None
    transaction_type: Optional[str] = None
    gateway: Optional[str] = None
    vendor: Optional[str] = None
    category: Optional[str] = None
    category2: Optional[str] = None
    split_details: Optional[str] = None
    comments: Optional[str] = None
    documents: Optional[str] = None
    ignore: Optional[bool] = None

class BudgetBase(BaseModel):
    year: int
    month: int
    amount: float

class BudgetCreate(BudgetBase):
    pass

class Budget(BudgetBase):
    id: int
    created_at: date
    updated_at: date

    class Config:
        orm_mode = True

class BudgetUpdate(BaseModel):
    amount: Optional[float] = None

class MonthlyBudgetSummary(BaseModel):
    year: int
    month: int
    budget: float
    spent: float
    remaining: float
    transactions: List[Transaction]
