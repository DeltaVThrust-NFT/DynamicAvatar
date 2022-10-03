from fastapi import APIRouter
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from dynamic_nft_avatars.router import router as effect_router

router = APIRouter(prefix="/api")
router.include_router(effect_router)
app = FastAPI(title="DynamicAvatar")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type", "Accept", "Origin"],
)

app.include_router(router)
