
from dotenv import load_dotenv
import os
import httpx

from app.models.agent import Agent

GEMINI_KEY = os.getenv("GEMINI_KEY")

class GeminiLLM(Agent):
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
                    result = {
                        'success': True,
                        'response': '',
                        'data': data  
                    }
                    
                    # Extract the text from Gemini response
                    if 'candidates' in data and len(data['candidates']) > 0:
                        text_parts = data['candidates'][0]['content']['parts']
                        response_text = ''.join(part['text'] for part in text_parts)
                        result['response'] = response_text
                    else:
                        result['response'] = "No response generated from Gemini"
                        result['success'] = False

                    return result
                    
                else:
                    return {
                        'success': False,
                        'error': f"HTTP {response.status_code}",
                        'details': response.text
                    }
                    
        except httpx.TimeoutException:
            return {
                'success': False,
                'error': 'Request timeout',
                'message': 'The request took too long to complete'
            }
        except httpx.RequestError as e:
            return {
                'success': False,
                'error': 'Request failed',
                'details': str(e)
            }
        except Exception as e:
            return {
                'success': False,
                'error': 'Unexpected error',
                'details': str(e)
            }