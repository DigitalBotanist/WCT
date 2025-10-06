import httpx
from typing import Dict

from app.agents.agent import Agent

class RemoteAgent(Agent):
    def __init__(self, name, expertise, url):
        super().__init__(name, expertise)
        self.url = url

    async def process(self, task: str, context: Dict, history:Dict):
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.url}/process",
                json={"task": task, "context": context}
            )
        return response.json()