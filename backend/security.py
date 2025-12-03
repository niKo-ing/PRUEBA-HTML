import time
import hmac
import hashlib
import base64
import json
from typing import Any, Dict, Optional


# Implementación ligera de JWT HS256 para evitar dependencias nuevas.
# Formato: base64url(header).base64url(payload).base64url(signature)

def _b64url(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).rstrip(b"=").decode("ascii")

def _b64url_json(obj: Dict[str, Any]) -> str:
    return _b64url(json.dumps(obj, separators=(",", ":"), ensure_ascii=False).encode("utf-8"))

def _sign(message: bytes, secret: str) -> str:
    sig = hmac.new(secret.encode("utf-8"), message, hashlib.sha256).digest()
    return _b64url(sig)


def create_jwt(payload: Dict[str, Any], secret: str, expires_in_seconds: int = 60 * 60) -> str:
    now = int(time.time())
    body = dict(payload)
    body.setdefault("iat", now)
    body.setdefault("exp", now + expires_in_seconds)
    header = {"alg": "HS256", "typ": "JWT"}
    part_header = _b64url_json(header)
    part_payload = _b64url_json(body)
    signing_input = f"{part_header}.{part_payload}".encode("ascii")
    signature = _sign(signing_input, secret)
    return f"{part_header}.{part_payload}.{signature}"


def verify_jwt(token: str, secret: str) -> Optional[Dict[str, Any]]:
    try:
        parts = token.split(".")
        if len(parts) != 3:
            return None
        header_b64, payload_b64, signature_b64 = parts
        msg = f"{header_b64}.{payload_b64}".encode("ascii")
        expected_sig = _sign(msg, secret)
        if not hmac.compare_digest(signature_b64, expected_sig):
            return None
        # Decode payload with padding handling
        padding = "=" * (-len(payload_b64) % 4)
        payload_json = base64.urlsafe_b64decode((payload_b64 + padding).encode("ascii")).decode("utf-8")
        payload = json.loads(payload_json)
        exp = int(payload.get("exp", 0))
        if exp and int(time.time()) > exp:
            return None
        return payload
    except Exception:
        return None

