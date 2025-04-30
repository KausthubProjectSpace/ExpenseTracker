# Budget Tracker Backend

This is the backend API for the Budget Tracker application, built with FastAPI and SQLAlchemy.

## Setup

1. Create a virtual environment:
   ```
   python -m venv venv
   ```

2. Activate the virtual environment:
   - Windows: `venv\Scripts\activate`
   - Mac/Linux: `source venv/bin/activate`

3. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

4. Run the application:
   ```
   python run.py
   ```

The API will be available at http://127.0.0.1:8000

## API Documentation

Once the server is running, you can access the interactive API documentation at:
- Swagger UI: http://127.0.0.1:8000/docs
- ReDoc: http://127.0.0.1:8000/redoc

## API Endpoints

- `GET /`: Welcome message
- `POST /transactions/`: Create a new transaction
- `GET /transactions/`: List all transactions
- `GET /transactions/{transaction_id}`: Get a specific transaction
- `PUT /transactions/{transaction_id}`: Update a transaction
- `DELETE /transactions/{transaction_id}`: Delete a transaction
- `GET /transactions/year/{year}`: Get transactions for a specific year
- `GET /transactions/year/{year}/month/{month}`: Get transactions for a specific month
- `GET /transactions/year/{year}/month/{month}/day/{day}`: Get transactions for a specific day
- `GET /export/excel`: Export transactions to Excel (with optional year/month filters)
