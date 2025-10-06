from typing import Dict
import httpx

from app.agents.remote_agent import RemoteAgent

class ImageClassifierAgent(RemoteAgent): 
    def __init__(self, url):
        super().__init__("AnimalClassifier", "Identifying animal species", url)

    async def process(self, task: str, image_path: str, history: Dict) -> Dict: 
        async with httpx.AsyncClient() as client:
            with open(image_path, 'rb') as image: 
                files = {"file": (image_path.split('/')[-1], image, "image/jpeg")}
                response = await client.post(
                    f"{self.url}/process",
                    files=files
                )

        return response.json() 
