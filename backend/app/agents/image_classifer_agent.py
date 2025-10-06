from typing import Dict
import httpx
import logging

from app.models.remote_agent import RemoteAgent
from app.models.graph import Result

class ImageClassifierAgent(RemoteAgent): 
    def __init__(self, url):
        super().__init__("AnimalClassifier", "Identifying animal species", url)

    async def process(self, task: dict, history: Dict = None) -> Dict: 
        image_path = task.get("image")
        try: 
            async with httpx.AsyncClient() as client:
                with open(image_path, 'rb') as image: 
                    files = {"file": (image_path.split('/')[-1], image, "image/jpeg")}
                    response = await client.post(
                        f"{self.url}/process",
                        files=files
                    )
                    data = response.json()
                    logging.debug(f"Image Classifer api output: {data}")      
                    result = Result(success=True, content=(data.get("label")), data=data)
                    
        except Exception as err:
            logging.error(f"image classification error: {err}")
            result = Result(success=False, content="Animal Classification: Error", )
        return result 


