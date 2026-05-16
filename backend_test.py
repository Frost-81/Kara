#!/usr/bin/env python3
"""
Backend API Testing for Kara Business Service
Testing all endpoints: /api/, /api/contact, /api/chat, /api/appointment
"""

import requests
import sys
import json
from datetime import datetime
import uuid
import time

class KaraBusinessAPITester:
    def __init__(self, base_url="https://blog-105.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.tests_run = 0
        self.tests_passed = 0
        self.session_id = None

    def log_test(self, name, success, details=""):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name} - PASSED")
        else:
            print(f"❌ {name} - FAILED: {details}")
        return success

    def test_root_endpoint(self):
        """Test GET /api/"""
        try:
            response = requests.get(f"{self.api_url}/", timeout=10)
            success = response.status_code == 200
            if success:
                data = response.json()
                success = "message" in data and "Kara Business" in data["message"]
                details = f"Response: {data}"
            else:
                details = f"Status: {response.status_code}, Response: {response.text[:200]}"
            return self.log_test("Root API endpoint", success, details)
        except Exception as e:
            return self.log_test("Root API endpoint", False, str(e))

    def test_contact_form(self):
        """Test POST /api/contact"""
        try:
            contact_data = {
                "name": "Test User",
                "email": "test@example.com",
                "phone": "+33 6 12 34 56 78",
                "message": "Test message for property management services",
                "property_type": "apartment"
            }
            
            response = requests.post(
                f"{self.api_url}/contact", 
                json=contact_data,
                timeout=10,
                headers={"Content-Type": "application/json"}
            )
            
            success = response.status_code == 200
            if success:
                data = response.json()
                success = all(key in data for key in ["id", "status", "message"])
                success = success and data["status"] == "success"
                details = f"Response: {data}"
            else:
                details = f"Status: {response.status_code}, Response: {response.text[:200]}"
                
            return self.log_test("Contact form submission", success, details)
        except Exception as e:
            return self.log_test("Contact form submission", False, str(e))

    def test_contact_form_validation(self):
        """Test POST /api/contact with invalid data"""
        try:
            # Test with missing required fields
            invalid_data = {
                "name": "Test",
                "email": "invalid-email"  # Invalid email format
            }
            
            response = requests.post(
                f"{self.api_url}/contact", 
                json=invalid_data,
                timeout=10,
                headers={"Content-Type": "application/json"}
            )
            
            # Should return 422 for validation error
            success = response.status_code == 422
            details = f"Status: {response.status_code} (expected 422 for validation error)"
                
            return self.log_test("Contact form validation", success, details)
        except Exception as e:
            return self.log_test("Contact form validation", False, str(e))

    def test_chatbot_french(self):
        """Test POST /api/chat - French language functionality"""
        try:
            chat_data = {
                "message": "Bonjour, pouvez-vous m'aider avec mes questions sur la gestion immobilière?",
                "session_id": None,
                "language": "fr"
            }
            
            response = requests.post(
                f"{self.api_url}/chat", 
                json=chat_data,
                timeout=30,  # AI requests take longer
                headers={"Content-Type": "application/json"}
            )
            
            success = response.status_code == 200
            if success:
                data = response.json()
                success = all(key in data for key in ["response", "session_id"])
                success = success and isinstance(data["response"], str) and len(data["response"]) > 0
                if success:
                    self.session_id = data["session_id"]  # Store for follow-up test
                details = f"Response length: {len(data.get('response', ''))}, Session ID: {data.get('session_id', 'None')[:8]}..."
            else:
                details = f"Status: {response.status_code}, Response: {response.text[:200]}"
                
            return self.log_test("AI Chatbot - French response", success, details)
        except Exception as e:
            return self.log_test("AI Chatbot - French response", False, str(e))

    def test_chatbot_english(self):
        """Test POST /api/chat - English language functionality"""
        try:
            chat_data = {
                "message": "Hello, can you help me with property management questions?",
                "session_id": None,
                "language": "en"
            }
            
            response = requests.post(
                f"{self.api_url}/chat", 
                json=chat_data,
                timeout=30,  # AI requests take longer
                headers={"Content-Type": "application/json"}
            )
            
            success = response.status_code == 200
            if success:
                data = response.json()
                success = all(key in data for key in ["response", "session_id"])
                success = success and isinstance(data["response"], str) and len(data["response"]) > 0
                details = f"Response length: {len(data.get('response', ''))}, Session ID: {data.get('session_id', 'None')[:8]}..."
            else:
                details = f"Status: {response.status_code}, Response: {response.text[:200]}"
                
            return self.log_test("AI Chatbot - English response", success, details)
        except Exception as e:
            return self.log_test("AI Chatbot - English response", False, str(e))

    def test_chatbot_session_continuity(self):
        """Test POST /api/chat - session continuity"""
        if not self.session_id:
            return self.log_test("AI Chatbot - Session continuity", False, "Previous test failed, no session ID")
            
        try:
            chat_data = {
                "message": "Quels sont vos tarifs?",
                "session_id": self.session_id
            }
            
            response = requests.post(
                f"{self.api_url}/chat", 
                json=chat_data,
                timeout=30,
                headers={"Content-Type": "application/json"}
            )
            
            success = response.status_code == 200
            if success:
                data = response.json()
                success = data["session_id"] == self.session_id
                details = f"Session maintained: {success}"
            else:
                details = f"Status: {response.status_code}"
                
            return self.log_test("AI Chatbot - Session continuity", success, details)
        except Exception as e:
            return self.log_test("AI Chatbot - Session continuity", False, str(e))

    def test_appointment_booking(self):
        """Test POST /api/appointment"""
        try:
            appointment_data = {
                "name": "Jean Dupont",
                "email": "jean.dupont@example.com",
                "phone": "+33 6 12 34 56 78",
                "preferred_date": "2024-03-15",
                "preferred_time": "14:30",
                "property_address": "123 Rue de la Paix, Paris",
                "notes": "Interested in property management services"
            }
            
            response = requests.post(
                f"{self.api_url}/appointment", 
                json=appointment_data,
                timeout=10,
                headers={"Content-Type": "application/json"}
            )
            
            success = response.status_code == 200
            if success:
                data = response.json()
                success = all(key in data for key in ["id", "status", "message"])
                success = success and data["status"] == "success"
                details = f"Response: {data}"
            else:
                details = f"Status: {response.status_code}, Response: {response.text[:200]}"
                
            return self.log_test("Appointment booking", success, details)
        except Exception as e:
            return self.log_test("Appointment booking", False, str(e))

    def test_cors_headers(self):
        """Test CORS headers are properly configured"""
        try:
            response = requests.options(f"{self.api_url}/", timeout=10)
            
            # Check for CORS headers
            cors_headers = response.headers.get('Access-Control-Allow-Origin')
            success = cors_headers is not None
            details = f"CORS Origin header: {cors_headers}"
                
            return self.log_test("CORS configuration", success, details)
        except Exception as e:
            return self.log_test("CORS configuration", False, str(e))

    def run_all_tests(self):
        """Run all backend API tests"""
        print("🚀 Starting Kara Business Service Backend API Tests")
        print(f"📍 Testing against: {self.base_url}")
        print("=" * 60)
        
        # Basic connectivity
        self.test_root_endpoint()
        
        # Contact form functionality 
        self.test_contact_form()
        self.test_contact_form_validation()
        
        # AI Chatbot functionality
        print("\n🤖 Testing AI Chatbot (this may take a moment)...")
        self.test_chatbot_french()
        time.sleep(2)  # Brief pause between AI calls
        self.test_chatbot_english()
        time.sleep(2)  # Brief pause between AI calls
        self.test_chatbot_session_continuity()
        
        # Appointment booking
        self.test_appointment_booking()
        
        # Infrastructure
        self.test_cors_headers()
        
        # Results summary
        print("\n" + "=" * 60)
        print(f"📊 Test Results: {self.tests_passed}/{self.tests_run} tests passed")
        
        if self.tests_passed == self.tests_run:
            print("🎉 All tests PASSED! Backend is working correctly.")
            return True
        else:
            print(f"❌ {self.tests_run - self.tests_passed} tests FAILED. Check issues above.")
            return False

def main():
    tester = KaraBusinessAPITester()
    success = tester.run_all_tests()
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())