import time
import pytest
from backend.security import create_jwt, verify_jwt

def test_jwt_create_and_verify():
    secret = "mysecret"
    payload = {"sub": "user@example.com", "role": "admin"}
    token = create_jwt(payload, secret, expires_in_seconds=60)
    
    decoded = verify_jwt(token, secret)
    assert decoded is not None
    assert decoded["sub"] == "user@example.com"
    assert decoded["role"] == "admin"
    assert "exp" in decoded

def test_jwt_expired():
    secret = "mysecret"
    payload = {"sub": "expired"}
    # Create a token that expired 1 second ago
    token = create_jwt(payload, secret, expires_in_seconds=-1)
    
    decoded = verify_jwt(token, secret)
    assert decoded is None

def test_jwt_invalid_signature():
    secret = "mysecret"
    payload = {"sub": "user"}
    token = create_jwt(payload, secret)
    
    # Try to verify with wrong secret
    decoded = verify_jwt(token, "wrongsecret")
    assert decoded is None

def test_jwt_malformed():
    secret = "mysecret"
    assert verify_jwt("not.enough.parts", secret) is None
    assert verify_jwt("part1.part2", secret) is None
    assert verify_jwt("part1.part2.part3.part4", secret) is None
    assert verify_jwt("invalidbase64@.payload.sig", secret) is None

def test_jwt_tampered_payload():
    secret = "mysecret"
    payload = {"sub": "user"}
    token = create_jwt(payload, secret)
    parts = token.split(".")
    
    # Tamper with the payload (middle part)
    # Just changing a character might make it invalid base64 or change the signature match
    # Let's replace payload with something valid base64 but different content
    import base64
    fake_payload = base64.urlsafe_b64encode(b'{"sub":"hacker"}').rstrip(b"=").decode("ascii")
    tampered_token = f"{parts[0]}.{fake_payload}.{parts[2]}"
    
    decoded = verify_jwt(tampered_token, secret)
    assert decoded is None
