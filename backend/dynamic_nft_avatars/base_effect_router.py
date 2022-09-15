import asyncio
import logging
from io import BytesIO

import requests
from aiohttp import ClientSession
from aiohttp import ClientTimeout
from fastapi import HTTPException
from fastapi import responses

from dynamic_nft_avatars.data_store import DataStore
from dynamic_nft_avatars.dynamic_nft_avatar_effect_service import DynamicNFTAvatarEffectService
from ipfs.service import IPFSServiceException
from ipfs.service import get_ipfs_service
from settings import IPFS_SERVICE

ipfs_service = get_ipfs_service(200, IPFS_SERVICE)
service = DynamicNFTAvatarEffectService()


class LoadContentError(Exception):
    pass


class GenerationImageError(Exception):
    pass


class ResponseError(Exception):
    pass


async def generate_content(contents, params=None):
    logging.info("[Info] Generating content")
    try:
        transformed = await service.transform(contents, params)
    except Exception:
        raise GenerationImageError("[Error] Failed to generate image")
    return transformed


async def fetch_contents(content_urls):
    logging.info("[Info] Fetching content")
    image_contents = await asyncio.gather(
        *[fetch_content(content_url) for content_url in content_urls],
    )
    return image_contents


async def fetch_content(content_url: str, timeout: float = 20) -> bytes:
    logging.info(f"[Info] Fetching {content_url}")
    try:
        extracted_cid = ipfs_service.extract_cid(content_url)
        if extracted_cid is not None:
            logging.info(f"[Info] Getting cid {extracted_cid}")
            file = ''
            if content_url[-5:] == '/file':
                file = '/file'
            return await ipfs_service.cat(extracted_cid + file)
        elif 'ipfs' in content_url:
            logging.info("[Info] by http client")
            async with ClientSession(timeout=ClientTimeout(timeout)) as session:
                resp = await session.get(content_url)
                return await resp.read()
        elif 'https://gendev.donft.io/api/effects/storage' in content_url:
            ds = DataStore()
            data = await ds.get_data(content_url.split('/')[-1])
            return data[0]
        else:
            return requests.get(content_url).content

    except Exception:
        raise LoadContentError("[Error] Didn't load file from " + content_url)


async def upload_content(content):
    logging.info("[Info] Uploading content")
    try:
        ipfs_url = await ipfs_service.add(content)
    except Exception:
        raise IPFSServiceException("[Error] IPFS service error")
    return ipfs_url


def response_content(content, ipfs_url=''):
    logging.info("[Info] Responding")
    try:
        response_stream = BytesIO(content)
        res = responses.StreamingResponse(
            response_stream,
            media_type="image/jpeg",
            headers={"ContentUrl": f"ipfs://{ipfs_url}", "Access-Control-Expose-Headers": "ContentUrl"}
        )
    except Exception:
        raise ResponseError('[Error] Failed to send result')
    return res
