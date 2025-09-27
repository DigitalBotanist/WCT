import base64
import re
from PIL import Image
from io import BytesIO
from datetime import datetime

def save_base64_image(base64_string: str, save_dir: str = ".") -> str:
    # Extract MIME type and data
    match = re.match(r"data:(image/\w+);base64,(.+)", base64_string)
    if not match:
        raise ValueError("Invalid base64 image string")

    mime_type, b64_data = match.groups()
    extension = mime_type.split("/")[1]  # e.g., "jpeg", "png", "webp"

    # Decode and open image
    image_data = base64.b64decode(b64_data)
    image = Image.open(BytesIO(image_data))

    # Save with timestamp and correct extension
    filename = f"{datetime.utcnow().strftime('%Y%m%d%H%M%S%f')}.{extension}"
    filepath = f"{save_dir}/{filename}"
    image.save(filepath)

    return filepath
