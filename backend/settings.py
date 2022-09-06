from enum import Enum
from pathlib import Path

import environs


class Environment(Enum):
    DEV = "DEV"
    STAGE = "STAGE"
    PROD = "PROD"


class ServiceEffect(Enum):
    ANIMATION = "ANIMATION"
    STYLE_TRANSFER = "STYLE_TRANSFER"
    CRYPTOPUNK = "CRYPTOPUNK"
    CRYPTOPUNK_CONSTRUCTOR = "CRYPTOPUNK_CONSTRUCTOR"
    CARICATURE = "CARICATURE"
    CIRCUS = "CIRCUS"
    FACE_ANIMATION = "FACE_ANIMATION"
    DYNAMIC_NFT_AVATAR = "DYNAMIC_NFT_AVATAR"


class IPFSServiceEnum(Enum):
    PINATA = "PINATA"
    NFT_STORAGE = "NFT_STORAGE"


PROJECT_DIR = Path(__file__).parent.parent.resolve()
BACKEND_DIR = PROJECT_DIR / "backend"
MODEL_DIR = PROJECT_DIR / "backend/models"

env = environs.Env()
env.read_env(BACKEND_DIR / ".env", recurse=False)

ENVIRONMENT = env.enum("ENVIRONMENT", type=Environment, ignore_case=True)
SERVICE_EFFECT = env.enum(
    "SERVICE_EFFECT",
    type=ServiceEffect,
    ignore_case=True,
    default=ServiceEffect.ANIMATION.value,
)

with open(BACKEND_DIR / "version.txt", "r") as f:
    PROJECT_VERSION = f.read().replace('/n', '')

HOST = env.str("HOST", "127.0.0.1")
PORT = env.int("PORT", 8000)
GRAPH_URL = env.str("GRAPH_URL")
WORKERS_NUM = env.int("WORKERS_NUM", 1)
WORKERS = env.int("WORKERS", 3)
MODEL_CHECKPOINT = str(MODEL_DIR / env.str("MODEL_CHECKPOINT", "vox-cpk.pth.tar"))
MODEL_CONFIG = str(
    BACKEND_DIR / env.str("MODEL_CONFIG", "first_order_model/config/vox-256.yaml")
)
EFFECTS_DIR = BACKEND_DIR / "static/effects"
MODEL_CPU = env.bool("MODEL_CPU", False)
MODEL_FIND_BEST_FRAME = env.bool("MODEL_FIND_BEST_FRAME", False)
MODEL_ADAPT_SCALE = env.bool("MODEL_ADAPT_SCALE", False)
MODEL_RELATIVE = env.bool("MODEL_RELATIVE", False)
PUBLIC_HOST = env.str("PUBLIC_HOST", "localhost")
IPFS_API_HOST = env.str("IPFS_API_HOST")
IPFS_API_TIMEOUT = env.float("IPFS_API_TIMEOUT", default=30.0)
PINATA_JWT_TOKEN = env("PINATA_JWT_TOKEN", default=None)
IPFS_SERVICE = env.enum("IPFS_SERVICE", type=IPFSServiceEnum, ignore_case=True, default="PINATA")
NFT_STORAGE_API_TOKEN = env("NFT_STORAGE_API_TOKEN", default=None)
MAILER_LITE_API_KEY = env("MAILERLITE_API_KEY")
ETH_NODE = env.str("ETH_NODE")
if SERVICE_EFFECT == ServiceEffect.FACE_ANIMATION:
    STYLE_ID = env.int("STYLE_ID")
    STYLE_MODE = env.str("STYLE_MODE")
