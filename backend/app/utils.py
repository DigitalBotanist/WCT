import base64
import re
from PIL import Image
from io import BytesIO
from datetime import datetime
import mimetypes

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
    filename = f"{datetime.now().strftime('%Y%m%d%H%M%S%f')}.{extension}"
    filepath = f"{save_dir}/{filename}"
    image.save(filepath)

    return filepath

def image_to_base64(image_path: str) -> str:
    # Open the image file
    with open(image_path, "rb") as image_file:
        image_data = image_file.read()

    # Guess the MIME type based on file extension
    mime_type, _ = mimetypes.guess_type(image_path)
    
    # If mime type can't be determined, assume 'image/jpeg'
    if not mime_type:
        mime_type = "image/jpeg"

    # Encode the image data to base64
    base64_data = base64.b64encode(image_data).decode("utf-8")

    # Return as a data URL
    return f"data:{mime_type};base64,{base64_data}"
