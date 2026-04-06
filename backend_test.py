import requests
import sys
import json
from datetime import datetime
import uuid

class MatrimonyAPITester:
    def __init__(self, base_url="https://satnami-unions.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.session = requests.Session()
        self.tests_run = 0
        self.tests_passed = 0
        self.admin_token = None
        self.test_user_id = None
        self.test_user_token = None

    def run_test(self, name, method, endpoint, expected_status, data=None, files=None, use_admin=False):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}
        
        # Use admin token if specified
        if use_admin and self.admin_token:
            headers['Authorization'] = f'Bearer {self.admin_token}'
        elif self.test_user_token:
            headers['Authorization'] = f'Bearer {self.test_user_token}'

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        
        try:
            if method == 'GET':
                response = self.session.get(url, headers=headers)
            elif method == 'POST':
                if files:
                    # Remove Content-Type for file uploads
                    headers.pop('Content-Type', None)
                    response = self.session.post(url, files=files, headers=headers)
                else:
                    response = self.session.post(url, json=data, headers=headers)
            elif method == 'PUT':
                response = self.session.put(url, json=data, headers=headers)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    return success, response.json()
                except:
                    return success, {}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                try:
                    error_detail = response.json()
                    print(f"   Error: {error_detail}")
                except:
                    print(f"   Response: {response.text}")
                return False, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_admin_login(self):
        """Test admin login and get token"""
        print("\n=== Testing Admin Authentication ===")
        success, response = self.run_test(
            "Admin Login",
            "POST",
            "auth/login",
            200,
            data={"email": "admin@satnamimatrimony.com", "password": "Admin@123"}
        )
        if success and 'id' in response:
            # Extract token from cookies
            cookies = self.session.cookies
            if 'access_token' in cookies:
                self.admin_token = cookies['access_token']
                print(f"✅ Admin token obtained")
                return True
        return False

    def test_user_registration(self):
        """Test user registration"""
        print("\n=== Testing User Registration ===")
        timestamp = datetime.now().strftime('%H%M%S')
        test_email = f"test_user_{timestamp}@example.com"
        
        success, response = self.run_test(
            "User Registration",
            "POST",
            "auth/register",
            200,
            data={
                "email": test_email,
                "password": "TestPass123!",
                "name": f"Test User {timestamp}",
                "phone": f"98765{timestamp}",
                "gender": "Male",
                "date_of_birth": "1995-01-01"
            }
        )
        if success and 'id' in response:
            self.test_user_id = response['id']
            # Extract token from cookies
            cookies = self.session.cookies
            if 'access_token' in cookies:
                self.test_user_token = cookies['access_token']
                print(f"✅ Test user created with ID: {self.test_user_id}")
                return True
        return False

    def test_user_login(self):
        """Test user login"""
        print("\n=== Testing User Login ===")
        # First logout to clear session
        self.session.post(f"{self.base_url}/auth/logout")
        
        timestamp = datetime.now().strftime('%H%M%S')
        test_email = f"test_user_{timestamp}@example.com"
        
        success, response = self.run_test(
            "User Login",
            "POST",
            "auth/login",
            200,
            data={"email": test_email, "password": "TestPass123!"}
        )
        return success

    def test_get_current_user(self):
        """Test get current user"""
        print("\n=== Testing Get Current User ===")
        success, response = self.run_test(
            "Get Current User",
            "GET",
            "auth/me",
            200
        )
        return success

    def test_profile_update(self):
        """Test profile update"""
        print("\n=== Testing Profile Update ===")
        success, response = self.run_test(
            "Profile Update",
            "PUT",
            "profile",
            200,
            data={
                "height": "175",
                "weight": "70",
                "marital_status": "Never Married",
                "caste": "Test Caste",
                "mother_tongue": "Hindi",
                "education": "Bachelor's Degree",
                "occupation": "Software Engineer",
                "income": "5-7 Lakhs",
                "city": "Mumbai",
                "state": "Maharashtra",
                "about": "Test profile description"
            }
        )
        return success

    def test_profile_search(self):
        """Test profile search"""
        print("\n=== Testing Profile Search ===")
        success, response = self.run_test(
            "Get Profiles",
            "GET",
            "profiles",
            200
        )
        if success:
            print(f"   Found {len(response)} profiles")
        
        # Test advanced search
        success2, response2 = self.run_test(
            "Advanced Search",
            "POST",
            "profiles/search",
            200,
            data={
                "gender": "Female",
                "marital_status": "Never Married",
                "city": "Mumbai"
            }
        )
        return success and success2

    def test_get_profile_by_id(self):
        """Test get profile by ID"""
        print("\n=== Testing Get Profile by ID ===")
        if not self.test_user_id:
            print("❌ No test user ID available")
            return False
            
        success, response = self.run_test(
            "Get Profile by ID",
            "GET",
            f"profiles/{self.test_user_id}",
            200
        )
        return success

    def test_messaging(self):
        """Test messaging functionality"""
        print("\n=== Testing Messaging ===")
        if not self.test_user_id:
            print("❌ No test user ID available")
            return False
            
        # Test send message (to admin)
        success1, response1 = self.run_test(
            "Send Message",
            "POST",
            "messages",
            200,
            data={
                "receiver_id": "admin_id_placeholder",
                "content": "Test message from API test"
            }
        )
        
        # Test get conversations
        success2, response2 = self.run_test(
            "Get Conversations",
            "GET",
            "conversations",
            200
        )
        
        return success1 and success2

    def test_premium_order_creation(self):
        """Test premium order creation"""
        print("\n=== Testing Premium Order Creation ===")
        success, response = self.run_test(
            "Create Premium Order",
            "POST",
            "premium/create-order",
            200,
            data={
                "plan": "monthly",
                "amount": 99900
            }
        )
        return success

    def test_logout(self):
        """Test logout"""
        print("\n=== Testing Logout ===")
        success, response = self.run_test(
            "Logout",
            "POST",
            "auth/logout",
            200
        )
        return success

def main():
    print("🚀 Starting Matrimony API Tests")
    print("=" * 50)
    
    tester = MatrimonyAPITester()
    
    # Test sequence
    tests = [
        ("Admin Login", tester.test_admin_login),
        ("User Registration", tester.test_user_registration),
        ("Get Current User", tester.test_get_current_user),
        ("Profile Update", tester.test_profile_update),
        ("Profile Search", tester.test_profile_search),
        ("Get Profile by ID", tester.test_get_profile_by_id),
        ("Messaging", tester.test_messaging),
        ("Premium Order Creation", tester.test_premium_order_creation),
        ("Logout", tester.test_logout)
    ]
    
    failed_tests = []
    
    for test_name, test_func in tests:
        try:
            result = test_func()
            if not result:
                failed_tests.append(test_name)
        except Exception as e:
            print(f"❌ {test_name} failed with exception: {e}")
            failed_tests.append(test_name)
    
    # Print results
    print("\n" + "=" * 50)
    print("📊 TEST RESULTS")
    print("=" * 50)
    print(f"Tests passed: {tester.tests_passed}/{tester.tests_run}")
    print(f"Success rate: {(tester.tests_passed/tester.tests_run)*100:.1f}%")
    
    if failed_tests:
        print(f"\n❌ Failed tests: {', '.join(failed_tests)}")
        return 1
    else:
        print("\n✅ All tests passed!")
        return 0

if __name__ == "__main__":
    sys.exit(main())