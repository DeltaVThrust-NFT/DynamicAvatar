import json
import logging
import sys
import traceback
from io import BytesIO
from typing import List
from typing import Union

from fastapi import APIRouter
from fastapi import File
from fastapi import Form
from fastapi import HTTPException
from fastapi import Response
from fastapi import UploadFile
from fastapi import responses
from pydantic import BaseModel

from dynamic_nft_avatars.base_effect_router import fetch_contents
from dynamic_nft_avatars.base_effect_router import generate_content
from dynamic_nft_avatars.base_effect_router import response_content
from dynamic_nft_avatars.data_store import DataStore
from dynamic_nft_avatars.data_store import DataStoreException

router = APIRouter(prefix="/api/effects")
ds = DataStore()


class DynamicAvatarPayload(BaseModel):
    original_url: str
    modificator_urls: List[str]


@router.post("/applyEffect")
async def apply_effect(effect_payload: DynamicAvatarPayload):
    contents = await fetch_contents(
        [effect_payload.original_url] + effect_payload.modificator_urls
    )

    transformed = await generate_content(contents)

    res = response_content(transformed)
    return res


@router.post("/storage")
async def storage_post(file: UploadFile = File(...), file_type: str = Form(...),
                       file_id: Union[int, None] = Form(None)):
    try:
        file_id = await ds.post_data(file.file.read(), file_type, file_id)
        logging.info("[Info] data post")
        response_stream = BytesIO(bytes(str(file_id), 'utf-8'))
        res = responses.StreamingResponse(
            response_stream,
            media_type='text/plain'
        )
    except Exception as e:
        logging.error(traceback.format_exc())
        logging.error(sys.exc_info()[2])
        raise HTTPException(status_code=400, detail=f"[Error] Failed to store file. {str(e)}")
    logging.info("[Info] Responding")

    return res


@router.get("/storage/{file_id}")
async def storage_post(file_id):
    try:
        data, data_type = await ds.get_data(file_id)
        if data_type == 'application/json':
            data = json.dumps(data)
        return Response(content=data, media_type=data_type)
    except DataStoreException as e:
        logging.error(traceback.format_exc())
        logging.error(sys.exc_info()[2])
        raise HTTPException(status_code=400, detail=f"[Error] Failed to store file. {str(e)}")
