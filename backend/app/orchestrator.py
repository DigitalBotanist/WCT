from typing import Any

from app.agents.image_classifer_agent import ImageClassifierAgent
from app.message_router.message_router import MessageRouter
from app.utils import save_base64_image

class Orchestrator: 
    _instance = None 
    def __init__(self): 
        if Orchestrator._instance is not None: 
            raise Exception("Use `get_instance()` to access the singleton instance.")

        self.agent = {
            'animal_classification': ImageClassifierAgent(url="http://localhost:8001")
        } 

        self.router = MessageRouter()
        Orchestrator._instance = self

    @classmethod
    def get_orchestrator(cls):
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    async def orchestrate_agents(self, websocket, session_id, user_id, data, image_data: Any = None):
                # Get conversation history
        # history = self.conversation_manager.get_history(session_id)
        
        # Save user message
        # self.conversation_manager.save_message(session_id, "user", "input", user_input)

        intent, max_prob = self.router.classify_intent(data.get("content"))
        if max_prob < 0.3:
            await websocket.send_json({
                "type": "message",
                "content": "Sorry I can't understand"
                }) 
            return 
        elif (intent == 'greeting'):
            await websocket.send_json({
                "type": "message",
                "content": "Hello how can i help you?"
                }) 
            return

        elif (intent == 'animal_classification'):
            image_data = data.get('image')
            if not image_data:
                await websocket.send_json({
                    "type": "message",
                    "content": f"No image is attached"
                })
                return

             
            if isinstance(image_data, str) and image_data.startswith("data:image/"):
                print("saving image")
                try:
                    filepath = save_base64_image(image_data, save_dir="uploads")
                    await websocket.send_json({
                        "type": "image_received",
                        "content": "Image received and processed"
                    })
                except Exception as e:
                    await websocket.send_json({
                        "type": "error",
                        "content": f"Failed to process image: {str(e)}"
                    })
            response = await self.agent[intent].process(task="classify", image_path=filepath, history={})

            await websocket.send_json({
                "type": "message",
                "content": f"This animal is: {response['label']}"
            }) 
        
            


