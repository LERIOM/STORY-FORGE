from __future__ import annotations

from io import BytesIO
from pathlib import Path
import textwrap

from PIL import Image, ImageDraw, ImageFilter, ImageFont, ImageOps


class MockImageGeneratorAdapter:
    width = 1080
    height = 1920

    def generate(self, source_paths: list[Path], context_text: str) -> bytes:
        canvas = self._build_background(source_paths)
        draw = ImageDraw.Draw(canvas)
        font_title = ImageFont.load_default()
        font_body = ImageFont.load_default()

        gradient = Image.new("RGBA", canvas.size, (0, 0, 0, 0))
        overlay = ImageDraw.Draw(gradient)
        overlay.rectangle((0, 980, self.width, self.height), fill=(9, 13, 19, 170))
        canvas = Image.alpha_composite(canvas.convert("RGBA"), gradient)

        draw = ImageDraw.Draw(canvas)
        draw.text((72, 110), "Story Forge", fill=(250, 247, 242), font=font_body)
        draw.text((72, 1260), "Generated story", fill=(250, 247, 242), font=font_title)

        wrapped = textwrap.fill(context_text[:220], width=28)
        draw.multiline_text(
            (72, 1368),
            wrapped,
            fill=(230, 227, 221),
            font=font_body,
            spacing=16,
        )

        buffer = BytesIO()
        canvas.convert("RGB").save(buffer, format="PNG")
        return buffer.getvalue()

    def _build_background(self, source_paths: list[Path]) -> Image.Image:
        if not source_paths:
            return Image.new("RGBA", (self.width, self.height), color=(15, 17, 22, 255))

        first_image = Image.open(source_paths[0]).convert("RGB")
        fitted = ImageOps.fit(first_image, (self.width, self.height))
        blurred = fitted.filter(ImageFilter.GaussianBlur(radius=8))
        mixed = Image.blend(blurred, fitted, alpha=0.82)
        return mixed.convert("RGBA")
