from typing import Dict
import httpx
import logging

from app.models.remote_agent import RemoteAgent
from app.models.graph import Result
from app.models.database_models import Attachments

class MigrationAnalyzerAgent(RemoteAgent): 
    def __init__(self, url):
        super().__init__("MigrationAnalyzer", "analyzer migration pattern of animals", url)

    async def process(self, task: dict, history: Dict = None) -> Dict: 
        attachment: Attachments = task.get("csv")
        try: 
            async with httpx.AsyncClient() as client:
                with open(attachment.path, 'rb') as file: 
                    files = {
                        'file': (attachment.path, file, 'text/csv')  # Correct MIME type for CSV
                    }
                    response = await client.post(
                        f"{self.url}/process",
                        files=files
                    )
                    data = response.json()
                    logging.debug(f"migration analyzer api output: {data}")      
                    result = Result(success=True, content=(data.get("label")), data=data)
                    
        except Exception as err:
            logging.error(f"migration analyzer error: {err}")
            result = Result(success=False, content="Migration Analyzer: Error", )
        return result 


