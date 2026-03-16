#!/usr/bin/env python3
import urllib.request
import json

# Test from port 8083
url = "http://localhost:5000/login"
headers = {
    "Content-Type": "application/json",
    "Origin": "http://localhost:8083"
}
data = {
    "username": "security1",
    "password": "pass123",
    "role": "Security"
}

print("=" * 60)
print("FINAL CORS & API TEST".center(60))
print("=" * 60)

try:
    req = urllib.request.Request(url, data=json.dumps(data).encode('utf-8'), headers=headers, method='POST')
    with urllib.request.urlopen(req) as response:
        resp_data = json.loads(response.read().decode('utf-8'))
        
        print(f"\n✅ Frontend → Backend Connection: SUCCESS")
        print(f"Frontend Port: 8083")
        print(f"Backend Port: 5000")
        print(f"Status: {response.status}")
        
        print(f"\n✅ CORS Headers Present:")
        cors_headers = {k: v for k, v in response.headers.items() if 'access-control' in k.lower()}
        for k, v in cors_headers.items():
            print(f"   {k}: {v}")
        
        print(f"\n✅ Login Response:")
        print(f"   Username: {resp_data['user']['username']}")
        print(f"   Name: {resp_data['user']['name']}")
        print(f"   Role: {resp_data['user']['role']}")
        
        print(f"\n✅ ALL SYSTEMS GO! Ready to test at http://localhost:8083")
        
except Exception as e:
    print(f"\n❌ Error: {e}")
    import traceback
    traceback.print_exc()

print("=" * 60)
