"""
Quick test script to verify Django API endpoints are working correctly.
Tests registration, login, and CORS headers.
"""
import requests
import json

BASE_URL = "http://localhost:8000"

def test_cors():
    """Test CORS preflight request"""
    print("=" * 60)
    print("Testing CORS Preflight...")
    print("=" * 60)
    
    response = requests.options(
        f"{BASE_URL}/api/auth/register/",
        headers={
            "Origin": "http://localhost:5173",
            "Access-Control-Request-Method": "POST",
            "Access-Control-Request-Headers": "Content-Type, Authorization"
        }
    )
    
    print(f"Status Code: {response.status_code}")
    print(f"CORS Headers:")
    for header in ['Access-Control-Allow-Origin', 'Access-Control-Allow-Methods', 
                   'Access-Control-Allow-Headers', 'Access-Control-Allow-Credentials']:
        print(f"  {header}: {response.headers.get(header, 'NOT SET')}")
    print()

def test_registration():
    """Test user registration endpoint"""
    print("=" * 60)
    print("Testing Registration API...")
    print("=" * 60)
    
    user_data = {
        "username": "testuser789",
        "email": "testuser789@example.com",
        "password": "TestPass123!",
        "password2": "TestPass123!",
        "first_name": "Test",
        "last_name": "User"
    }
    
    response = requests.post(
        f"{BASE_URL}/api/auth/register/",
        json=user_data,
        headers={
            "Content-Type": "application/json",
            "Origin": "http://localhost:5173"
        }
    )
    
    print(f"Status Code: {response.status_code}")
    print(f"Response:")
    try:
        print(json.dumps(response.json(), indent=2))
    except:
        print(response.text)
    print()
    
    return response.status_code == 201, response.json() if response.status_code == 201 else None

def test_login(username, password):
    """Test login endpoint"""
    print("=" * 60)
    print("Testing Login API...")
    print("=" * 60)
    
    response = requests.post(
        f"{BASE_URL}/api/auth/login/",
        json={"username": username, "password": password},
        headers={
            "Content-Type": "application/json",
            "Origin": "http://localhost:5173"
        }
    )
    
    print(f"Status Code: {response.status_code}")
    print(f"Response:")
    try:
        data = response.json()
        # Don't print full tokens, just show they exist
        if 'access' in data:
            data['access'] = data['access'][:20] + "..."
        if 'refresh' in data:
            data['refresh'] = data['refresh'][:20] + "..."
        print(json.dumps(data, indent=2))
    except:
        print(response.text)
    print()

if __name__ == "__main__":
    print("\nDjango API Integration Test\n")
    
    # Test CORS
    test_cors()
    
    # Test Registration
    success, user_data = test_registration()
    
    if success:
        print("[SUCCESS] Registration successful!")
        # Test Login with the registered user
        test_login("testuser789", "TestPass123!")
    else:
        print("[FAILED] Registration failed!")
    
    print("=" * 60)
    print("Test Complete")
    print("=" * 60)
