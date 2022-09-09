import io
from typing import Dict
from typing import List
from typing import Optional

import imageio
import numpy as np
from PIL import Image


class DynamicNFTAvatarEffectService:

    async def transform(self, contents: List, params: Optional[Dict] = None):
        result = self._perform_transformation(contents, params)
        return result

    def _perform_transformation(
            self, contents: List, params: Optional[Dict] = None,
    ) -> bytes:
        avatar = contents[0]
        avatar_image = self.load_img(avatar)
        for attribute in contents[1:]:
            attribute_image = self.load_img(attribute)
            avatar_image.paste(attribute_image, (0, 0), attribute_image)

        return imageio.imwrite("<bytes>", np.array(avatar_image), "png")

    @staticmethod
    def load_img(img: bytes) -> Image:
        img = Image.open(io.BytesIO(img)).convert("RGBA")
        return img
