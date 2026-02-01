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
        # 1. Try JSON content from environment variable (Best for Render/Cloud)
        service_account_json = os.getenv("FIREBASE_SERVICE_ACCOUNT_JSON")
        cred = None
        
        if service_account_json:
            import json
            try:
                cred_dict = json.loads(service_account_json)
                cred = credentials.Certificate(cred_dict)
                print("Firebase credentials loaded from environment variable.")
            except json.JSONDecodeError as e:
                print(f"Error decoding FIREBASE_SERVICE_ACCOUNT_JSON: {e}")
        
        # 2. Fallback to file path (Best for Local Dev)
        if not cred:
            cred_path = os.getenv("FIREBASE_SERVICE_ACCOUNT_PATH")
            if cred_path:
                # Resolve path relative to project root
                if not os.path.isabs(cred_path):
                    config_dir = os.path.dirname(os.path.abspath(__file__)) 
                    app_dir = os.path.dirname(config_dir)
                    backend_dir = os.path.dirname(app_dir)
                    project_root = os.path.dirname(backend_dir)
                    
                    test_path_backend = os.path.join(backend_dir, cred_path)
                    test_path_root = os.path.join(project_root, cred_path)
                    test_path_cwd = os.path.abspath(cred_path)
                    
                    if os.path.exists(test_path_root):
                        cred_path = test_path_root
                    elif os.path.exists(test_path_backend):
                        cred_path = test_path_backend
                    elif os.path.exists(test_path_cwd):
                        cred_path = test_path_cwd
                    elif os.path.exists(os.path.join(backend_dir, os.path.basename(cred_path))):
                        cred_path = os.path.join(backend_dir, os.path.basename(cred_path))
                
                if os.path.exists(cred_path):
                    try:
                        cred = credentials.Certificate(cred_path)
                        print(f"Firebase credentials loaded from file: {cred_path}")
                    except Exception as e:
                        print(f"Error loading credential file: {e}")
                else:
                     print(f"Firebase service account file not found at: {cred_path}")

        if not cred:
             print("Failed to load Firebase credentials (checked env var and file path).")
             return None
            
        try:
            storage_bucket = os.getenv("FIREBASE_STORAGE_BUCKET")
            if storage_bucket:
                firebase_admin.initialize_app(cred, {
                    'storageBucket': storage_bucket
                })
            else:
                firebase_admin.initialize_app(cred)
            print("Firebase Admin SDK initialized successfully.")
        except Exception as e:
            print(f"Failed to initialize Firebase Admin SDK: {e}")
            return None

    return firebase_admin.get_app()
