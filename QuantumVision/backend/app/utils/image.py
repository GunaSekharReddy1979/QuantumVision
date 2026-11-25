"""
Image Processing and Decoding Utilities.
"""
import base64
import io
from typing import Optional, Tuple
from PIL import Image
import numpy as np

def decode_base64_to_image(base64_str: str) -> Optional[Image.Image]:
    """Decodes a base64 string to a PIL Image."""
    try:
        if "," in base64_str:
            base64_str = base64_str.split(",", 1)[1]
        img_bytes = base64.b64decode(base64_str)
        img = Image.open(io.BytesIO(img_bytes)).convert("RGB")
        return img
    except Exception:
        return None

def encode_image_to_base64(image: Image.Image, format: str = "JPEG") -> str:
    """Encodes PIL image to Base64 data URL string."""
    buffered = io.BytesIO()
    image.save(buffered, format=format)
    img_str = base64.b64encode(buffered.getvalue()).decode("utf-8")
    return f"data:image/{format.lower()};base64,{img_str}"

def compute_image_color_stats(image: Image.Image) -> dict:
    """Calculates red, green, blue mean intensities and variance for fast spectral analysis."""
    np_img = np.array(image)
    if np_img.ndim == 2:
        return {"r_mean": float(np.mean(np_img)), "g_mean": float(np.mean(np_img)), "b_mean": float(np.mean(np_img))}
    return {
        "r_mean": float(np.mean(np_img[:, :, 0])),
        "g_mean": float(np.mean(np_img[:, :, 1])),
        "b_mean": float(np.mean(np_img[:, :, 2])),
        "fire_hue_ratio": float(np.mean(np_img[:, :, 0]) / max(1.0, np.mean(np_img[:, :, 2]))),
        "flood_blue_ratio": float(np.mean(np_img[:, :, 2]) / max(1.0, np.mean(np_img[:, :, 0])))
    }
