import uvicorn

from app import app
from settings import HOST
from settings import PORT

if __name__ == "__main__":
    uvicorn.run(app, host=HOST, port=PORT)
