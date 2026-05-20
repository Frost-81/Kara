"""
Firebase Integration Helper Module
Provides utility functions for Firebase Firestore, Realtime Database, and Storage operations
"""

import logging
import firebase_admin
from firebase_admin import credentials, db, storage, auth, firestore
from typing import Dict, Any, List, Optional
from datetime import datetime

logger = logging.getLogger(__name__)

class FirebaseHelper:
    """Helper class for Firebase operations"""
    
    def __init__(self):
        """Initialize Firebase helper"""
        try:
            self.app = firebase_admin.get_app()
            self.firestore_client = firestore.client()
            self.realtime_db = db
            self.storage_bucket = storage.bucket()
            self.auth = auth
            logger.info("Firebase helper initialized successfully")
        except ValueError:
            logger.warning("Firebase not initialized")
            self.firestore_client = None
            self.realtime_db = None
    
    # ============== Firestore Operations ==============
    
    async def add_document(self, collection: str, data: Dict[str, Any], doc_id: Optional[str] = None) -> str:
        """Add a document to Firestore"""
        try:
            if doc_id:
                self.firestore_client.collection(collection).document(doc_id).set(data)
                return doc_id
            else:
                doc_ref = self.firestore_client.collection(collection).add(data)
                return doc_ref[1].id
        except Exception as e:
            logger.error(f"Error adding document to {collection}: {str(e)}")
            raise
    
    async def get_document(self, collection: str, doc_id: str) -> Optional[Dict]:
        """Get a single document from Firestore"""
        try:
            doc = self.firestore_client.collection(collection).document(doc_id).get()
            if doc.exists:
                return doc.to_dict()
            return None
        except Exception as e:
            logger.error(f"Error getting document from {collection}: {str(e)}")
            raise
    
    async def get_all_documents(self, collection: str, filters: Optional[Dict] = None) -> List[Dict]:
        """Get all documents from a collection with optional filters"""
        try:
            query = self.firestore_client.collection(collection)
            
            if filters:
                for field, value in filters.items():
                    query = query.where(field, "==", value)
            
            docs = query.stream()
            return [doc.to_dict() for doc in docs]
        except Exception as e:
            logger.error(f"Error getting documents from {collection}: {str(e)}")
            raise
    
    async def update_document(self, collection: str, doc_id: str, data: Dict[str, Any]) -> bool:
        """Update a document in Firestore"""
        try:
            self.firestore_client.collection(collection).document(doc_id).update(data)
            return True
        except Exception as e:
            logger.error(f"Error updating document in {collection}: {str(e)}")
            raise
    
    async def delete_document(self, collection: str, doc_id: str) -> bool:
        """Delete a document from Firestore"""
        try:
            self.firestore_client.collection(collection).document(doc_id).delete()
            return True
        except Exception as e:
            logger.error(f"Error deleting document from {collection}: {str(e)}")
            raise
    
    # ============== Realtime Database Operations ==============
    
    async def set_realtime_data(self, path: str, data: Dict[str, Any]) -> bool:
        """Set data in Firebase Realtime Database"""
        try:
            self.realtime_db.reference(path).set(data)
            return True
        except Exception as e:
            logger.error(f"Error setting data at {path}: {str(e)}")
            raise
    
    async def get_realtime_data(self, path: str) -> Optional[Any]:
        """Get data from Firebase Realtime Database"""
        try:
            return self.realtime_db.reference(path).get().val()
        except Exception as e:
            logger.error(f"Error getting data from {path}: {str(e)}")
            raise
    
    async def update_realtime_data(self, path: str, data: Dict[str, Any]) -> bool:
        """Update data in Firebase Realtime Database"""
        try:
            self.realtime_db.reference(path).update(data)
            return True
        except Exception as e:
            logger.error(f"Error updating data at {path}: {str(e)}")
            raise
    
    # ============== Storage Operations ==============
    
    async def upload_file(self, local_path: str, destination_path: str) -> str:
        """Upload a file to Firebase Storage"""
        try:
            blob = self.storage_bucket.blob(destination_path)
            blob.upload_from_filename(local_path)
            return f"gs://{self.storage_bucket.name}/{destination_path}"
        except Exception as e:
            logger.error(f"Error uploading file: {str(e)}")
            raise
    
    async def download_file(self, source_path: str, local_path: str) -> bool:
        """Download a file from Firebase Storage"""
        try:
            blob = self.storage_bucket.blob(source_path)
            blob.download_to_filename(local_path)
            return True
        except Exception as e:
            logger.error(f"Error downloading file: {str(e)}")
            raise
    
    async def delete_file(self, path: str) -> bool:
        """Delete a file from Firebase Storage"""
        try:
            self.storage_bucket.delete_blob(path)
            return True
        except Exception as e:
            logger.error(f"Error deleting file: {str(e)}")
            raise
    
    # ============== Authentication Operations ==============
    
    async def create_user(self, email: str, password: str, display_name: str = "") -> str:
        """Create a new user in Firebase Auth"""
        try:
            user = self.auth.create_user(
                email=email,
                password=password,
                display_name=display_name
            )
            return user.uid
        except Exception as e:
            logger.error(f"Error creating user: {str(e)}")
            raise
    
    async def verify_token(self, token: str) -> Optional[Dict]:
        """Verify a Firebase token"""
        try:
            decoded = self.auth.verify_id_token(token)
            return decoded
        except Exception as e:
            logger.error(f"Error verifying token: {str(e)}")
            raise

# Initialize Firebase helper
firebase_helper = None

def init_firebase_helper():
    """Initialize the Firebase helper"""
    global firebase_helper
    try:
        firebase_helper = FirebaseHelper()
        return firebase_helper
    except Exception as e:
        logger.error(f"Failed to initialize Firebase helper: {str(e)}")
        return None

def get_firebase_helper() -> Optional[FirebaseHelper]:
    """Get the Firebase helper instance"""
    return firebase_helper
