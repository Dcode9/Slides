"""Image synthesis client supporting AI generation and procedural aesthetic fallbacks."""

import os
import logging
from typing import Optional
import requests
from PIL import Image, ImageDraw, ImageFont

logger = logging.getLogger("slidecraft.ai.images")

class ImageGenerator:
    """Generates visual assets for presentation hero and gallery slides."""
    
    def __init__(self, output_dir: str = "output_presentations/generated_assets"):
        self.output_dir = output_dir
        os.makedirs(self.output_dir, exist_ok=True)

    def generate_image(self, prompt: str, filename: str = "hero_asset.png", width: int = 1200, height: int = 800) -> str:
        """Generate an image from prompt and return the local saved path."""
        target_path = os.path.join(self.output_dir, filename)
        
        # 1. Attempt OpenAI DALL-E 3 if key is set
        openai_key = os.getenv("OPENAI_API_KEY")
        if openai_key:
            try:
                res = requests.post(
                    "https://api.openai.com/v1/images/generations",
                    headers={"Authorization": f"Bearer {openai_key}"},
                    json={
                        "model": "dall-e-3",
                        "prompt": f"Minimalist professional presentation visual, high-tech cinematic, 8k resolution, elegant: {prompt}",
                        "n": 1,
                        "size": "1024x1024"
                    },
                    timeout=45
                )
                if res.status_code == 200:
                    img_url = res.json()["data"][0]["url"]
                    img_data = requests.get(img_url, timeout=30).content
                    with open(target_path, "wb") as f:
                        f.write(img_data)
                    logger.info(f"Generated DALL-E 3 image: {target_path}")
                    return target_path
            except Exception as e:
                logger.warning(f"DALL-E 3 generation failed: {e}. Falling back to procedural generator.")

        # 2. Procedural high-aesthetic generator (Pillow)
        # Creates a dark gradient abstract tech surface with subtle geometry
        img = Image.new("RGB", (width, height), color=(15, 23, 42))
        draw = ImageDraw.Draw(img)

        # Draw smooth vertical/diagonal gradient
        for y in range(height):
            ratio = y / height
            r = int(20 + 15 * ratio)
            g = int(27 + 20 * ratio)
            b = int(60 + 25 * ratio)
            draw.line([(0, y), (width, y)], fill=(r, g, b))

        # Add decorative circular glow accents
        draw.ellipse([width - 300, -100, width + 200, 400], fill=(45, 55, 120, 50))
        draw.ellipse([50, height - 250, 450, height + 150], fill=(25, 45, 85, 50))

        # Add a subtle grid pattern
        grid_step = 80
        for x in range(0, width, grid_step):
            draw.line([(x, 0), (x, height)], fill=(30, 41, 59), width=1)
        for y in range(0, height, grid_step):
            draw.line([(0, y), (width, y)], fill=(30, 41, 59), width=1)

        img.save(target_path, "PNG")
        logger.info(f"Created procedural asset: {target_path}")
        return target_path
