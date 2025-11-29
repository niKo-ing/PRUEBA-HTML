from motor.motor_asyncio import AsyncIOMotorClient
from .config import settings

client: AsyncIOMotorClient | None = None
db_main = None
db_users = None
db = None


async def connect():
    global client, db, db_main, db_users
    try:
        client = AsyncIOMotorClient(
            settings.MONGO_URI,
            maxPoolSize=50,
            serverSelectionTimeoutMS=5000,
            tls=True,
            retryWrites=True,
            appname="todobaratisimo-api",
        )
        await client.admin.command("ping")
        db_main = client[settings.MONGO_DB]
        db_users = client[settings.MONGO_DB_USERS]
        db = db_main
    except Exception as e:
        print("Mongo connect error:", e)
        client = None
        db_main = None
        db_users = None
        db = None


async def disconnect():
    global client
    if client:
        client.close()
        client = None
        global db_main, db_users, db
        db_main = None
        db_users = None
        db = None

