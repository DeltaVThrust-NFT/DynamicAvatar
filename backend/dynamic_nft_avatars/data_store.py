import os
from pathlib import Path
from typing import Any
from typing import Dict
from typing import Optional
from typing import Tuple

from dynamic_nft_avatars.file_managers import BaseFileManager
from dynamic_nft_avatars.file_managers import ImageManager
from dynamic_nft_avatars.file_managers import JSONManager

PATH_TO_DATA_STORE = Path('/backend/data_storage_dynamic_avatar')


class DataStore:
    _instance = None

    def __new__(cls, *args, **kwargs):
        if not isinstance(cls._instance, cls):
            cls._instance = object.__new__(cls, *args, **kwargs)
        return cls._instance

    def __init__(self):
        image_manager = ImageManager()
        json_manager = JSONManager()
        self._type2managers: Dict[str, BaseFileManager] = {
            'json': json_manager,
            'png': image_manager,
            'jpg': image_manager,
            'jpeg': image_manager,
            'gif': image_manager,
            'application/json': json_manager,
            'image/png': image_manager,
            'image/jpg': image_manager,
            'image/jpeg': image_manager,
            'image/gif': image_manager,
        }

    async def get_data(self, file_id) -> Tuple[Any, str]:
        file_name = self._get_file_name(file_id)

        try:
            file_manager = self._type2managers[file_name.split('.')[-1]]
        except KeyError:
            raise DataStoreException(f"Incorrect data type. Get {file_name}. "
                                     f"Valid types: [.jpg, .png, .jpeg, .gif, .json]")
        file = file_manager.read_file_from_path(PATH_TO_DATA_STORE / file_name)
        file_type = file_manager.get_content_type(file_name)

        return file, file_type

    async def post_data(self, file_payload: bytes, content_type: str, file_id: Optional[int]) -> int:
        f_id = self._get_file_id(file_id)
        file_name = str(f_id)
        try:
            file_manager = self._type2managers[content_type.lower()]
        except KeyError:
            raise DataStoreException(f"Incorrect data type. Get {file_name}. "
                                     f"Valid types: [.jpg, .png, .jpeg, .gif, .json]")
        file = file_manager.read_file_from_bytes(file_payload)
        file_type = content_type.split('/')[-1]
        self._try_removing_file(file_id)
        file_manager.save_file(file, PATH_TO_DATA_STORE / f"{file_name}.{file_type}")

        return f_id

    def _get_file_id(self, file_id: Optional[int]) -> int:
        f_id = None
        if file_id is None:
            if len(list(os.listdir(PATH_TO_DATA_STORE))) == 0:
                f_id = 0
            else:
                f_id = max(list(map(lambda n: int(n.split('.')[0]), list(os.listdir(PATH_TO_DATA_STORE))))) + 1
        else:
            for f_n in os.listdir(PATH_TO_DATA_STORE):
                if self._is_right_file(file_id, f_n):
                    f_id = file_id
            if f_id is None:
                raise DataStoreException(f"File not found from file id. Get {file_id}")
        return f_id

    def _try_removing_file(self, file_id: Optional[int]):
        if file_id is None:
            return
        for f_n in os.listdir(PATH_TO_DATA_STORE):
            if self._is_right_file(file_id, f_n):
                os.remove(PATH_TO_DATA_STORE / f_n)
                break

    def _get_file_name(self, file_id):
        file_name = None
        for f_n in os.listdir(PATH_TO_DATA_STORE):
            if self._is_right_file(file_id, f_n):
                file_name = f_n
                break
        if file_name is None:
            raise DataStoreException(f'File not found from file id. Get {file_id}')
        return file_name

    @staticmethod
    def _is_right_file(file_id: int, f_n: str) -> bool:
        return str(file_id) == f_n.split('.')[0]


class DataStoreException(Exception):
    pass
