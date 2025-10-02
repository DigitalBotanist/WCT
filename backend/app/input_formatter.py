import uuid
import os
import base64
from typing import Dict, Any, List, Optional
from datetime import datetime
from pathlib import Path


from app.utils import save_base64_image

class InputFormatter:
    _instance = None 

    def __init__(self, upload_dir: str = "uploads"):
        if InputFormatter._instance is not None: 
            raise Exception("Use `get_instance()` to access the singleton instance.")
            
        self.upload_dir = Path(upload_dir)
        self.img_upload_dir = Path(upload_dir, 'img')
        self.upload_dir.mkdir(exist_ok=True)
        self.img_upload_dir.mkdir(exist_ok=True)

        InputFormatter._instance = self
  
    def process_image(self, raw_data: Dict[str, Any]):
        """Process and store image, return image filename, and isError: Boolean"""
        
        image_data = raw_data.get('image')
        if not image_data:
            return None, True
        if isinstance(image_data, str) and image_data.startswith("data:image/"):
            print("saving image")
            try:
                filepath = save_base64_image(image_data, save_dir=self.img_upload_dir)
                return filepath, True
            except Exception as e:
                return None, True
            
    @classmethod
    def get_input_formatter(cls):
        if cls._instance is None: 
            cls._instance = cls()
        return cls._instance 