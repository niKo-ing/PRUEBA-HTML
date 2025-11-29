import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import settings
from .db import connect, disconnect
from .routers.products import router as products_router
from .routers.ai import router as ai_router
from .routers.users import router as users_router
from .routers.health import router as health_router

app = FastAPI(title="Todobaratisimo API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup():
    try:
        await connect()
    except Exception:
        pass


@app.on_event("shutdown")
async def shutdown():
    await disconnect()


app.include_router(products_router)
app.include_router(ai_router)
app.include_router(users_router)
app.include_router(health_router)


if __name__ == "__main__":
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)

