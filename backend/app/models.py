from sqlalchemy import Column, Integer, String, Float, Date, Text, Boolean, LargeBinary
from sqlalchemy.sql import func
from app.database import Base
import datetime

class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    date = Column(Date, nullable=False, default=datetime.date.today)
    reason = Column(String, nullable=False)
    amount = Column(Float, nullable=False)
    mode = Column(String, nullable=True)  # CREDIT, DEBIT, CARD
    transaction_type = Column(String, nullable=True)  # CASH, UPI, etc.
    gateway = Column(String, nullable=True)  # CARD/Credit/DEBIT, UPI, etc.
    vendor = Column(String, nullable=True)
    category = Column(String, nullable=True)  # Primary category
    category2 = Column(String, nullable=True)  # Secondary category
    split_details = Column(Text, nullable=True)
    comments = Column(Text, nullable=True)
    documents = Column(String, nullable=True)  # Document filename or URL
    documents_content = Column(LargeBinary, nullable=True)  # Document content as binary data
    ignore = Column(Boolean, default=False)  # Flag to ignore transaction in calculations
    created_at = Column(Date, default=datetime.date.today)

class Budget(Base):
    __tablename__ = "budgets"

    id = Column(Integer, primary_key=True, index=True)
    year = Column(Integer, nullable=False)
    month = Column(Integer, nullable=False)
    amount = Column(Float, nullable=False)  # Initial budget amount
    created_at = Column(Date, default=datetime.date.today)
    updated_at = Column(Date, default=datetime.date.today, onupdate=datetime.date.today)
