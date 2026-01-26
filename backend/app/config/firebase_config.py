import os
import firebase_admin
from firebase_admin import credentials
from dotenv import load_dotenv

load_dotenv()

def initialize_firebase():
    """
    Initialize Firebase Admin SDK using service account credentials.
    The path to the service account JSON file should be in the .env file.
    """
    if not firebase_admin._apps:
        cred_path = os.getenv("FIREBASE_SERVICE_ACCOUNT_PATH")
        
        if not cred_path:
            print("FIREBASE_SERVICE_ACCOUNT_PATH not found in environment variables.")
            return None
        
        # Resolve path relative to project root
        if not os.path.isabs(cred_path):
            # Start from this file: backend/app/config/firebase_config.py
            config_dir = os.path.dirname(os.path.abspath(__file__)) # backend/app/config
            app_dir = os.path.dirname(config_dir) # backend/app
            backend_dir = os.path.dirname(app_dir) # backend
            project_root = os.path.dirname(backend_dir) # project_root
            
            # Try relative to backend_dir first as that's where .env usually points
            test_path_backend = os.path.join(backend_dir, cred_path)
            # Try relative to project_root
            test_path_root = os.path.join(project_root, cred_path)
            # Try relative to current working directory
            test_path_cwd = os.path.abspath(cred_path)
            
            if os.path.exists(test_path_root):
                cred_path = test_path_root
            elif os.path.exists(test_path_backend):
                cred_path = test_path_backend
            elif os.path.exists(test_path_cwd):
                cred_path = test_path_cwd
            elif os.path.exists(os.path.join(backend_dir, os.path.basename(cred_path))):
                # Fallback: check if just the filename exists in backend_dir
                cred_path = os.path.join(backend_dir, os.path.basename(cred_path))
                
        if not os.path.exists(cred_path):
            print(f"Firebase service account key not found at: {cred_path}")
            return None
            
        try:
            cred = credentials.Certificate(cred_path)
            firebase_admin.initialize_app(cred)
            print("Firebase Admin SDK initialized successfully.")
        except Exception as e:
            print(f"Failed to initialize Firebase Admin SDK: {e}")
            return None

    return firebase_admin.get_app()
