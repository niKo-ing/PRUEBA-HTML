from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr
from pydantic_settings import SettingsConfigDict
from .. import db as db_module
from ..config import settings

router = APIRouter(prefix="/api/users", tags=["users"])


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


@router.on_event("startup")
async def seed_admin():
    if db_module.client is None or db_module.db_users is None:
        return
    admin_email = settings.ADMIN_EMAIL.strip() if settings.ADMIN_EMAIL else ""
    admin_password = settings.ADMIN_PASSWORD.strip() if settings.ADMIN_PASSWORD else ""
    if not admin_email or not admin_password:
        return
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
    if db_module.client is None or db_module.db_users is None:
        raise HTTPException(status_code=500, detail="DB no inicializada")
    users = db_module.db_users["usuarios"]
    u = await users.find_one({"email": payload.email, "password": payload.password}, {"_id": 0})
    if not u:
        raise HTTPException(status_code=401, detail="Correo o contraseña incorrectos")
    is_admin = u.get("role") == "admin"
    return {"user": {"nombre": u.get("nombre", ""), "apellido": u.get("apellido", ""), "email": u["email"]}, "isAdmin": is_admin}
