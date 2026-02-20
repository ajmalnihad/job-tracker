"""
Test file upload functionality
"""
import requests
from io import BytesIO

BASE_URL = "http://localhost:8000"


def create_test_pdf():
    """Create a minimal valid PDF file in memory"""
    # Minimal PDF content
    pdf_content = b"""%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj
2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj
3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
>>
endobj
4 0 obj
<<
/Length 44
>>
stream
BT
/F1 12 Tf
100 700 Td
(Test Resume) Tj
ET
endstream
endobj
xref
0 5
0000000000 65535 f
0000000009 00000 n
0000000058 00000 n
0000000115 00000 n
0000000214 00000 n
trailer
<<
/Size 5
/Root 1 0 R
>>
startxref
312
%%EOF"""
    return BytesIO(pdf_content)


def test_file_upload():
    """Test file upload with authentication"""
    print("=" * 60)
    print("Testing File Upload (requires authentication)...")
    print("=" * 60)
    
    # First, login to get a token
    login_response = requests.post(
        f"{BASE_URL}/api/auth/login/",
        json={"username": "testuser789", "password": "TestPass123!"}
    )
    
    if login_response.status_code != 200:
        print(f"Login failed with status {login_response.status_code}")
        return
    
    token = login_response.json()['access']
    print(f"Login successful, got token: {token[:20]}...")
    
    # Now test file upload
    pdf_file = create_test_pdf()
    
    files = {
        'file': ('test_resume.pdf', pdf_file, 'application/pdf')
    }
    
    data = {
        'title': 'Test Software Engineer Resume'
    }
    
    response = requests.post(
        f"{BASE_URL}/api/resumes/",
        files=files,
        data=data,
        headers={
            "Authorization": f"Bearer {token}",
            "Origin": "http://localhost:5173"
        }
    )
    
    print(f"\nFile Upload Status Code: {response.status_code}")
    print(f"Response:")
    try:
        import json
        result = response.json()
        print(json.dumps(result, indent=2))
        
        if response.status_code == 201:
            print(f"\n[SUCCESS] File uploaded successfully!")
            print(f"File URL: {result.get('file', 'N/A')}")
        else:
            print(f"\n[ERROR] Upload failed")
    except:
        print(response.text)
    
    print()


if __name__ == "__main__":
    print("\nFile Upload Integration Test\n")
    test_file_upload()
    print("=" * 60)
    print("Test Complete")
    print("=" * 60)
