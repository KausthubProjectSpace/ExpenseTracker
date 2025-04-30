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

### Backend Setup

1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Create a virtual environment:
   ```
   python -m venv venv
   ```

3. Activate the virtual environment:
   - Windows: `venv\Scripts\activate`
   - Mac/Linux: `source venv/bin/activate`

4. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

5. Configure the database:
   - Edit the `.env` file with your MySQL credentials:
     ```
     DB_USER=root
     DB_PASSWORD=your_password
     DB_HOST=localhost
     DB_PORT=3306
     DB_NAME=budget_tracker
     API_PORT=8000
     API_HOST=127.0.0.1
     ```

6. Set up the database:
   ```
   python setup_db.py
   ```

7. Run the backend server (this will also create the tables):
   ```
   python run.py
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```
   cd frontend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Run the development server:
   ```
   npm run dev
   ```

### Running the Full Application

You can run both the frontend and backend together using:
```
python main.py
```

## Usage

1. Set your monthly budget on the welcome screen
2. Add transactions with detailed information
3. Monitor your spending against your budget
4. Export your data to CSV for further analysis

## Troubleshooting

If you encounter any issues with circular imports or database initialization:

1. Make sure you've set up the database first:
   ```
   python setup_db.py
   ```

2. Then run the application:
   ```
   python run.py
   ```

3. If you still have issues, try running the frontend and backend separately:
   - Backend: `cd backend && python run.py`
   - Frontend: `cd frontend && npm run dev`

## License

MIT
