from fastapi import APIRouter, HTTPException, Header
from contextlib import asynccontextmanager
from pydantic import BaseModel, EmailStr
from pydantic_settings import SettingsConfigDict
from .. import db as db_module
from ..config import settings
from ..security import create_jwt, verify_jwt

@asynccontextmanager
async def lifespan_users(router: APIRouter):
    # Sembrar admin en arranque si hay DB y credenciales
    if db_module.client is not None and db_module.db_users is not None:
        admin_email = settings.ADMIN_EMAIL.strip() if settings.ADMIN_EMAIL else ""
        admin_password = settings.ADMIN_PASSWORD.strip() if settings.ADMIN_PASSWORD else ""
        if admin_email and admin_password:
            users = db_module.db_users["usuarios"]
            exists = await users.find_one({"email": admin_email})
            if not exists:
                await users.insert_one({
                    "nombre": "Admin",
                    "apellido": "",
                    "email": admin_email,
                    "telefono": "",
                    "password": admin_password,
                    "role": "admin"
                })
    yield

router = APIRouter(prefix="/api/users", tags=["users"], lifespan=lifespan_users)


class Direccion(BaseModel):
    fullText: str | None = None
    street: str | None = None
    number: str | None = None
    comuna: str | None = None
    city: str | None = None
    region: str | None = None
    country: str | None = None
    postalCode: str | None = None
    lat: float | None = None
    lng: float | None = None
    placeId: str | None = None


class RegisterPayload(BaseModel):
    nombre: str
    apellido: str
    email: EmailStr
    telefono: str
    password: str
    direccion: Direccion | None = None
    model_config = SettingsConfigDict(extra="ignore")


class LoginPayload(BaseModel):
    email: EmailStr
    password: str


# La siembra automática ahora ocurre en lifespan_users


@router.post("/seed-admin")
async def seed_admin_endpoint():
    # Endpoint idempotente para crear el usuario admin leyendo settings.
    # Útil en desarrollo si se actualiza .env sin reiniciar el servidor.
    if db_module.client is None or db_module.db_users is None:
        raise HTTPException(status_code=500, detail="DB no inicializada")
    admin_email = settings.ADMIN_EMAIL.strip() if settings.ADMIN_EMAIL else ""
    admin_password = settings.ADMIN_PASSWORD.strip() if settings.ADMIN_PASSWORD else ""
    if not admin_email or not admin_password:
        raise HTTPException(status_code=400, detail="ADMIN_EMAIL/ADMIN_PASSWORD no configurados")
    users = db_module.db_users["usuarios"]
    exists = await users.find_one({"email": admin_email})
    if not exists:
        await users.insert_one({
            "nombre": "Admin",
            "apellido": "",
            "email": admin_email,
            "telefono": "",
            "password": admin_password,
            "role": "admin"
        })
    return {"ok": True}


@router.post("/register")
async def register(payload: RegisterPayload):
    if db_module.client is None or db_module.db_users is None:
        raise HTTPException(status_code=500, detail="DB no inicializada")
    users = db_module.db_users["usuarios"]
    exists = await users.find_one({"email": payload.email})
    if exists:
        raise HTTPException(status_code=400, detail="Ya existe un usuario con este correo")
    doc = payload.model_dump()
    doc["role"] = "user"
    await users.insert_one(doc)
    return {"ok": True}


@router.post("/login")
async def login(payload: LoginPayload):
    # Si no hay DB, permitir login de desarrollo con ADMIN_EMAIL/ADMIN_PASSWORD
    if db_module.client is None or db_module.db_users is None:
        admin_email = (settings.ADMIN_EMAIL or "").strip()
        admin_password = (settings.ADMIN_PASSWORD or "").strip()
        if admin_email and admin_password:
            if payload.email == admin_email and payload.password == admin_password:
                secret = settings.ADMIN_PASSWORD or "todobaratisimo_dev_secret"
                token = create_jwt({"sub": admin_email, "role": "admin"}, secret, expires_in_seconds=60*60*8)
                return {
                    "user": {"nombre": "Admin", "apellido": "", "email": admin_email},
                    "isAdmin": True,
                    "token": token,
                }
            # Credenciales proporcionadas pero incorrectas: responder como 401
            raise HTTPException(status_code=401, detail="Correo o contraseña incorrectos")
        # Sin credenciales admin configuradas en settings, la DB no inicializada impide login
        raise HTTPException(status_code=500, detail="DB no inicializada")
    users = db_module.db_users["usuarios"]
    u = await users.find_one({"email": payload.email, "password": payload.password}, {"_id": 0})
    if not u:
        raise HTTPException(status_code=401, detail="Correo o contraseña incorrectos")
    is_admin = u.get("role") == "admin"
    # Generar JWT con claims mínimos
    secret = settings.ADMIN_PASSWORD or "todobaratisimo_dev_secret"
    token = create_jwt({
        "sub": u["email"],
        "role": u.get("role", "user"),
    }, secret, expires_in_seconds=60*60*8)  # 8h
    return {
        "user": {"nombre": u.get("nombre", ""), "apellido": u.get("apellido", ""), "email": u["email"]},
        "isAdmin": is_admin,
        "token": token,
    }


@router.get("")
async def list_users(authorization: str | None = Header(default=None)):
    """Lista usuarios registrados (oculta password)."""
    if db_module.client is None or db_module.db_users is None:
        raise HTTPException(status_code=500, detail="DB no inicializada")
    # Verificar JWT (solo admin puede listar)
    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(status_code=401, detail="Autorización requerida")
    token = authorization.split(" ", 1)[1]
    payload = verify_jwt(token, settings.ADMIN_PASSWORD or "todobaratisimo_dev_secret")
    if not payload or payload.get("role") != "admin":
        raise HTTPException(status_code=403, detail="No autorizado")
    users = db_module.db_users["usuarios"]
    try:
        cursor = users.find({}, {"_id": 0, "password": 0})
        items = [doc async for doc in cursor]
        return items
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al listar usuarios: {e}")


@router.delete("/{email}")
async def delete_user(email: EmailStr, authorization: str | None = Header(default=None)):
    """Elimina un usuario por email."""
    if db_module.client is None or db_module.db_users is None:
        raise HTTPException(status_code=500, detail="DB no inicializada")
    # Verificar JWT (solo admin)
    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(status_code=401, detail="Autorización requerida")
    token = authorization.split(" ", 1)[1]
    payload = verify_jwt(token, settings.ADMIN_PASSWORD or "todobaratisimo_dev_secret")
    if not payload or payload.get("role") != "admin":
        raise HTTPException(status_code=403, detail="No autorizado")
    users = db_module.db_users["usuarios"]
    try:
        res = await users.delete_one({"email": str(email)})
        return {"deleted": res.deleted_count}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al eliminar usuario: {e}")
