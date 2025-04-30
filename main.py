# expense-tracker/main.py
import os
import subprocess
import time

print("--- Expense Tracker Main Connector ---")
print("This script coordinates frontend and backend services.")

def start_frontend():
    """Start the frontend development server"""
    os.chdir('frontend')
    print("Starting frontend server...")
    return subprocess.Popen(
        ['npm', 'run', 'dev'],
        stdout=None,  # Show output in console
        stderr=None,  # Show errors in console
        shell=True
    )

def start_backend():
    """Start the backend FastAPI server"""
    os.chdir('backend')
    print("Starting backend server...")
    return subprocess.Popen(
        ['uvicorn', 'app.main:app'],
        stdout=None,  # Show output in console
        stderr=None,  # Show errors in console
        shell=True
    )

def start_dashboard():
    """Start the Streamlit dashboard"""
    os.chdir('dashboard')
    print("Starting Streamlit dashboard...")
    return subprocess.Popen(
        ['python', 'run_dashboard.py'],
        stdout=None,  # Show output in console
        stderr=None,  # Show errors in console
        shell=True
    )

if __name__ == "__main__":
    try:
        # Store current directory
        root_dir = os.getcwd()

        # Start backend
        os.chdir(root_dir)
        backend_process = start_backend()
        print("Backend started at http://127.0.0.1:8000")
        print("API documentation available at http://127.0.0.1:8000/docs")

        # Start frontend
        os.chdir(root_dir)
        frontend_process = start_frontend()
        print("Frontend started at http://localhost:5173")

        # Start dashboard
        os.chdir(root_dir)
        # dashboard_process = start_dashboard()
        # print("Dashboard started at http://localhost:8501")

        # print("\nPress Ctrl+C to stop all services...")

        # Keep the script running
        # while True:
            # time.sleep(1)

    except KeyboardInterrupt:
        print("\nShutting down services...")
        frontend_process.terminate()
        backend_process.terminate()
        # dashboard_process.terminate()
        print("Services stopped.")