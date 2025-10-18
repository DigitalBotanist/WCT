
from dotenv import load_dotenv
import os
import httpx

from app.models.agent import Agent
from app.models.graph import Result

GEMINI_KEY_4 = os.getenv("GEMINI_KEY_4")

class GeminiLLM4(Agent):
    def __init__(self):
        super().__init__("GeneralLLM", "general llm agent")

    async def process(self, task=None, history=None):
        url = (
            "https://generativelanguage.googleapis.com/"
            f"v1beta/models/gemini-2.5-flash:generateContent?key={GEMINI_KEY}"
        ) 
        
        # Handle both string and dictionary task formats
        if isinstance(task, dict):
            prompt_text = task.get('prompt', '')
        else:
            prompt_text = str(task) if task else ''
        
        body = {
            "contents": [{"parts": [{"text": prompt_text}]}],
            "generationConfig": {"temperature": 0.2}
        }
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(url, json=body, timeout=30.0)
                
                if response.status_code == 200:
                    data = response.json()
                    
                    # Return structured response
                    result = Result(True, '') 
                    
                    # Extract the text from Gemini response
                    if 'candidates' in data and len(data['candidates']) > 0:
                        text_parts = data['candidates'][0]['content']['parts']
                        response_text = ''.join(part['text'] for part in text_parts)
                        result.content = response_text
                    else:
                        result.content = "No response generated from Gemini"
                        result.success = False

                    return result
                    
                else:
                    # If the response status code is not 200, return a Result with failure
                    result = Result(False, f"HTTP {response.status_code}")
                    result.details = response.text
                    return result
        except httpx.TimeoutException:
            # Handle timeout error
            result = Result(False, 'Request timeout')
            result.details = 'The request took too long to complete'
            return result

        except httpx.RequestError as e:
            # Handle general request error
            result = Result(False, 'Request failed')
            result.details = str(e)
            return result

        except Exception as e:
            # Catch any other unexpected errors
            result = Result(False, 'Unexpected error')
            result.details = str(e)
            return result
