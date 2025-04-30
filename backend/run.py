import uvicorn
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Get port and host from environment variables
API_PORT = int(os.getenv("API_PORT", "8000"))
API_HOST = os.getenv("API_HOST", "127.0.0.1")

if __name__ == "__main__":
    print(f"Starting server at {API_HOST}:{API_PORT}")
    print("Database will be initialized automatically on startup if needed.")
    uvicorn.run("app.main:app", host=API_HOST, port=API_PORT, reload=True, log_level="info")
