import firebase_admin
from firebase_admin import credentials, auth, messaging
import os
import json
from dotenv import load_dotenv

load_dotenv()

class FirebaseService:
    _initialized = False
    
    @classmethod
    def initialize(cls):
        if not cls._initialized:
            try:
                firebase_creds = os.getenv("FIREBASE_CREDENTIALS")
                if firebase_creds:
                    cred = credentials.Certificate(json.loads(firebase_creds))
                else:
                    # Check if we have individual env variables
                    firebase_type = os.getenv("FIREBASE_TYPE")
                    if firebase_type:
                        cred = credentials.Certificate({
                            "type": firebase_type,
                            "project_id": os.getenv("FIREBASE_PROJECT_ID"),
                            "private_key_id": os.getenv("FIREBASE_PRIVATE_KEY_ID"),
                            "private_key": os.getenv("FIREBASE_PRIVATE_KEY", "").replace('\\n', '\n'),
                            "client_email": os.getenv("FIREBASE_CLIENT_EMAIL"),
                            "client_id": os.getenv("FIREBASE_CLIENT_ID"),
                            "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                            "token_uri": "https://oauth2.googleapis.com/token",
                            "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
                            "client_x509_cert_url": os.getenv("FIREBASE_CERT_URL")
                        })
                    else:
                        print("⚠️ Firebase credentials not configured. Skipping Firebase initialization.")
                        cls._initialized = True
                        return
                
                firebase_admin.initialize_app(cred)
                cls._initialized = True
                print("✅ Firebase initialized successfully")
            except Exception as e:
                print(f"⚠️ Firebase initialization failed: {e}")
                print("ℹ️ Continuing without Firebase (some features may be limited)")
                cls._initialized = True
    
    @staticmethod
    def send_otp_email(email: str, otp_code: str):
        """Send OTP via Firebase (Email)"""
        try:
            from app.services.email_service import EmailService
            return EmailService.send_otp_email(email, otp_code)
        except Exception as e:
            print(f"Firebase OTP error: {e}")
            return False
    
    @staticmethod
    def verify_id_token(id_token: str):
        """Verify Firebase ID token"""
        if not FirebaseService._initialized:
            return None
        try:
            decoded_token = auth.verify_id_token(id_token)
            return decoded_token
        except Exception as e:
            print(f"Token verification error: {e}")
            return None
    
    @staticmethod
    def create_user(email: str, password: str, display_name: str = None):
        """Create user in Firebase Auth"""
        if not FirebaseService._initialized:
            return None
        try:
            user = auth.create_user(
                email=email,
                password=password,
                display_name=display_name
            )
            return user
        except Exception as e:
            print(f"Firebase user creation error: {e}")
            return None
    
    @staticmethod
    def send_push_notification(token: str, title: str, body: str, data: dict = None):
        """Send push notification via Firebase Cloud Messaging"""
        if not FirebaseService._initialized:
            return None
        try:
            message = messaging.Message(
                notification=messaging.Notification(
                    title=title,
                    body=body
                ),
                data=data,
                token=token
            )
            response = messaging.send(message)
            return response
        except Exception as e:
            print(f"Push notification error: {e}")
            return None