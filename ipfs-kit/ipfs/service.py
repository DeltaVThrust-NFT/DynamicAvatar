import json
import logging
import re
from abc import ABC
from abc import abstractmethod
from enum import Enum
from typing import Any
from typing import Dict
from typing import Literal
from typing import Optional
from typing import Tuple
from typing import TypeVar

from aiohttp import ClientSession
from aiohttp import ClientTimeout


class IPFSServiceException(Exception):
    pass


BASE_IPFS_SERVICE_TYPE = TypeVar("BASE_IPFS_SERVICE_TYPE", bound="BaseIPFSService")


class BaseIPFSService(ABC):
    PINATA_ENDPOINT_REGEX = re.compile(r'pinata.cloud/ipfs/(?P<cid>\w+)')
    IPFS_ENDPOINT_REGEX = re.compile(r'ipfs.io/ipfs/(?P<cid>\w+)')

    @abstractmethod
    async def add(self, payload: bytes, only_hash: bool = False) -> str:
        pass

    @abstractmethod
    async def cat(self, ipfs_addr: str) -> bytes:
        pass

    @classmethod
    def extract_cid(cls, endpoint: str) -> Optional[str]:
        if endpoint.startswith('ipfs://'):
            return endpoint.replace('ipfs://', '')
        if res := cls.PINATA_ENDPOINT_REGEX.search(endpoint):
            return res.group('cid')
        if res := cls.IPFS_ENDPOINT_REGEX.search(endpoint):
            return res.group('cid')
        return None


class IPFSService(BaseIPFSService):

    def __init__(self, base_url: str, timeout: float = 5):
        self.base_url = base_url.rstrip("/") + "/"
        self.timeout = ClientTimeout(timeout)

    async def _make_request(
            self,
            ipfs_method: Literal["add", "cat", "get"],
            params: Dict,
            data: Optional[Dict] = None,
    ) -> bytes:
        async with ClientSession(timeout=self.timeout) as session:
            resp = await session.post(
                self.base_url + ipfs_method, params=params, data=data
            )
            if resp.status != 200:
                raise IPFSServiceException(
                    f"Request to ipfs {self.base_url} got unexpected status {resp.status}"
                )
            return await resp.read()

    async def add(self, payload: bytes, only_hash: bool = False) -> str:
        result = await self._make_request(
            "add", {"only-hash": str(only_hash).lower()}, {"file": payload}
        )
        try:
            decoded = json.loads(result)
            return decoded["Hash"]
        except ValueError:
            raise IPFSServiceException(f"Got invalid json while adding file: {result}")
        except KeyError:
            raise IPFSServiceException(f"Hash key not found in response: {result}")

    async def cat(self, ipfs_addr: str) -> bytes:
        result = await self._make_request(
            "cat", {"arg": ipfs_addr.replace("ipfs://", "")}
        )
        return result


class BaseRestfulIPFSService(BaseIPFSService):

    def __init__(self, timeout: float = 5.0):
        self.timeout = ClientTimeout(timeout)

    async def _make_request(
            self,
            method: str,
            url: str,
            params: Dict = None,
            data: Dict = None,
            headers: Dict = None,
            hide_auth: bool = False,
    ) -> bytes:
        if not hide_auth:
            auth_dest, auth_info = self._get_authorization_info()
            if auth_dest == "params":
                if params is None:
                    params = auth_info
                else:
                    params.update(auth_info)
            elif auth_dest == "headers":
                if headers is None:
                    headers = auth_info
                else:
                    headers.update(auth_info)
            else:
                raise IPFSServiceException(f"Unknown destination for authorization {auth_dest}")
        async with ClientSession(timeout=self.timeout, headers=headers) as session:
            async with session.request(method, url, params=params, data=data) as resp:
                if resp.status != 200:
                    text = await resp.text()
                    raise IPFSServiceException(
                        f"Request to ipfs {method.upper()}:{url} got unexpected status {resp.status}:{text}"
                    )
                return await resp.read()

    async def get_meta_info(
            self,
            url: str,
            headers: Dict = None,
            hide_auth: bool = False,
            info_key='content-type'
    ):

        if not hide_auth:
            auth_dest, auth_info = self._get_authorization_info()
            if auth_dest == "headers":
                if headers is None:
                    headers = auth_info
                else:
                    headers.update(auth_info)
            else:
                raise IPFSServiceException(f"Unknown destination for authorization {auth_dest}")
        async with ClientSession(timeout=self.timeout, headers=headers) as session:
            async with session.head(url) as resp:
                info = resp.headers[info_key]
        return info

    @abstractmethod
    def _get_authorization_info(self) -> Tuple[Literal["params", "headers"], Dict[str, Any]]:
        pass


class PinataIPFSService(BaseRestfulIPFSService):

    def __init__(self, api_token: str, timeout: float = 5.0):
        super(PinataIPFSService, self).__init__(timeout)
        self._api_token = api_token

    def _get_authorization_info(self) -> Tuple[Literal["params", "headers"], Dict[str, Any]]:
        return "headers", {"Authorization": f"Bearer {self._api_token}"}

    async def add(self, payload: bytes, only_hash: bool = False) -> str:
        resp = await self._make_request(
            "post",
            "https://api.pinata.cloud/pinning/pinFileToIPFS",
            data={
                "file": payload
            }
        )
        return json.loads(resp)["IpfsHash"]

    async def cat(self, ipfs_addr: str) -> bytes:
        cid = ipfs_addr.replace('ipfs://', '')
        if cid.startswith('Q'):  # V0 CID
            url = f"https://gateway.pinata.cloud/ipfs/{cid}"
        else:
            url = f"https://gateway.pinata.cloud/ipfs/{cid}/file"
        return await self._make_request("get", url)


class NTFStorageIPFSService(BaseRestfulIPFSService):

    def __init__(self, api_token: str, timeout: float = 5.0):
        super(NTFStorageIPFSService, self).__init__(timeout)
        self._dest_formfield_name = "file"
        self._api_token = api_token

    def _get_authorization_info(self) -> Tuple[Literal["params", "headers"], Dict[str, Any]]:
        return "headers", {"Authorization": f"Bearer {self._api_token}"}

    async def add(self, payload: bytes, only_hash: bool = False) -> str:
        logging.info("[Info] Uploading file to IPFS")
        resp = await self._make_request(
            "post",
            "https://api.nft.storage/upload",
            # headers={'content_type': 'application/octet-stream'},
            data={
                self._dest_formfield_name: payload
            }
        )
        # file_url = f"{json.loads(resp)["value"]["cid"]}/{self._dest_formfield_name}"
        # logging.info("cid is {file_url}")
        return f'{json.loads(resp)["value"]["cid"]}/{self._dest_formfield_name}'

    async def cat(self, ipfs_addr: str) -> bytes:
        cid = ipfs_addr.replace('ipfs://', '')
        if cid.startswith('Q') or cid.startswith('b'):  # V0 CID
            url = f"https://nftstorage.link/ipfs/{cid}"
        else:
            url = f"https://{cid}.ipfs.nftstorage.link/{self._dest_formfield_name}"
        logging.info(f"[Info] Getting file from {url}")
        return await self._make_request("get", url)


class IPFSServiceEnum(Enum):
    PINATA = "PINATA"
    NFT_STORAGE = "NFT_STORAGE"


_service_mapping = {
    IPFSServiceEnum.PINATA: PinataIPFSService,
    IPFSServiceEnum.NFT_STORAGE: NTFStorageIPFSService
}


def get_ipfs_service(ipfs_api_timeout, ipfs_service) -> BASE_IPFS_SERVICE_TYPE:
    logging.info("[Info] IPFS provider is {IPFS_SERVICE}")
    service_cls = _service_mapping[ipfs_service]
    return service_cls(ipfs_api_timeout)

# ipfs_service = get_ipfs_service()
