import abc
import io
import json
import shutil
from pathlib import Path
from typing import Any
from typing import Union


class BaseFileManager(abc.ABC):
    @abc.abstractmethod
    def read_file_from_path(self, path):
        pass

    @abc.abstractmethod
    def save_file(self, file: Any, path_save: Union[str, Path]):
        pass

    @abc.abstractmethod
    def read_file_from_bytes(self, payload: bytes) -> Any:
        pass

    @abc.abstractmethod
    def get_content_type(self, file_name: str) -> str:
        pass

class JSONManager(BaseFileManager):
    def read_file_from_path(self, path):
        with open(path, mode='r') as f:
            file = json.load(f)
        return file

    def save_file(self, file: Any, path_save: Union[str, Path]):
        with open(path_save, "w") as f:
            json.dump(file, f)

    def read_file_from_bytes(self, payload: bytes) -> Any:
        return json.loads(payload)

    def get_content_type(self, file_name: str) -> str:
        return 'application/json'


class ImageManager(BaseFileManager):

    def read_file_from_path(self, path):
        with open(path, 'rb') as f:
            return f.read()

    def save_file(self, file: io.BytesIO, path_save: Union[str, Path]):
        with open(path_save, "wb") as f:
            shutil.copyfileobj(file, f)

    def read_file_from_bytes(self, payload: bytes) -> Any:
        return io.BytesIO(payload)

    def get_content_type(self, file_name: str) -> str:
        return 'image/gif'
