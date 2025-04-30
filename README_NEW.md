# Budget Tracker

A full-stack application for tracking personal finances, with a React frontend and FastAPI backend.

## Features

- Track income and expenses with detailed categorization
- Monthly budget tracking with remaining balance calculation
- Export data to CSV by year, month, or day
- Clean, modern UI with responsive design

## Setup Instructions

### Prerequisites

- Node.js and npm for the frontend
- Python 3.8+ for the backend
- MySQL database

### Configuration

1. Create a `.env` file in the backend directory with your MySQL credentials:
   ```
   DB_USER=root
   DB_PASSWORD=your_password
   DB_HOST=localhost
   DB_PORT=3306
   DB_NAME=budget_tracker
   API_PORT=8000
   API_HOST=127.0.0.1
   ```

### Running the Application

The application is designed to be started with a single command:

```
python main.py
```

This will:
1. Initialize the database if it doesn't exist
2. Create all required tables
3. Start the backend server
4. Start the frontend development server

## Usage

1. Set your monthly budget on the welcome screen
2. Add transactions with detailed information
3. Monitor your spending against your budget
4. Export your data to CSV for further analysis

## Transaction Form

The transaction form includes the following fields:
- Date: Automatically set based on your selection
- Reason: Description of the transaction
- Amount: Transaction amount
- Mode: CREDIT or DEBIT
- Transaction Type: CASH, UPI, or CARD
- Gateway: Options change based on transaction type
  - For CASH: No gateway options
  - For UPI: GPay, PhonePe, ICICI UPI, SBI UPI, Other UPI
  - For CARD: CREDIT, DEBIT
- Vendor: Where the transaction took place
- Category: Personal or Split
- Category-2: Food(Compulsory), Vegetables/Groceries, Travel, etc.
- Split Details: Details if the expense was split
- Comments: Additional notes
- Documents: Optional document reference

## Budget Tracking

The budget tracking feature shows:
- Current monthly budget
- Remaining amount (updates in real-time)

## License

MIT
