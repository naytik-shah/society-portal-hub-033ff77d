#!/usr/bin/env python3
import urllib.request
import json

# Test login endpoint
url = "http://localhost:5000/login"
headers = {
    "Content-Type": "application/json",
    "Origin": "http://localhost:8081"
}
data = {
    "username": "security1",
    "password": "pass123",
    "role": "Security"
}

print("Testing login endpoint...")
print(f"URL: {url}")
print(f"Headers: {headers}")
print(f"Data: {data}")

try:
    req = urllib.request.Request(url, data=json.dumps(data).encode('utf-8'), headers=headers, method='POST')
    with urllib.request.urlopen(req) as response:
        resp_data = json.loads(response.read().decode('utf-8'))
        print(f"\nStatus Code: {response.status}")
        print(f"Response Headers (CORS-related):")
        for k, v in response.headers.items():
            if 'access-control' in k.lower() or 'cors' in k.lower():
                print(f"  {k}: {v}")
        print(f"\nResponse Body:")
        print(json.dumps(resp_data, indent=2))
except urllib.error.HTTPError as e:
    print(f"HTTP Error {e.code}")
    try:
        resp_data = json.loads(e.read().decode('utf-8'))
        print(json.dumps(resp_data, indent=2))
    except:
        print(e.read().decode('utf-8'))
except Exception as e:
    print(f"Error: {e}")
