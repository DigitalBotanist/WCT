from typing import Any
from fastapi import Depends

from app.agents.image_classifer_agent import ImageClassifierAgent
from app.message_router.message_router import MessageRouter
from app.utils import save_base64_image
from app.conversation_manager import ConversationManager

class Orchestrator: 
    _instance = None 
    def __init__(self, conversation_manager: ConversationManager): 
        if Orchestrator._instance is not None: 
            raise Exception("Use `get_instance()` to access the singleton instance.")

        self.agent = {
            'animal_classification': ImageClassifierAgent(url="http://localhost:8001")
        } 

        self.router = MessageRouter()
        self.conversation_manager = conversation_manager
        Orchestrator._instance = self

    @classmethod
    def get_orchestrator(cls, conversation_manager: ConversationManager = Depends(ConversationManager.get_conversation_manager)):
        if cls._instance is None:
            cls._instance = cls(conversation_manager)
        return cls._instance

    async def orchestrate_agents(self, websocket, session_id, user_id, data, image_data: Any = None):
                # Get conversation history
        # history = self.conversation_manager.get_history(session_id)
        
        # Save user message
        # self.conversation_manager.save_message(session_id, "user", "input", user_input)

        self.conversation_manager.save_message(session_id=session_id, content=data.get("content"), role="user", agent_type="user")
     
        intent, max_prob = self.router.classify_intent(data.get("content"))
        if max_prob < 0.3:
            response = {
                "type": "message",
                "content": "Sorry message is not clear"
                } 
        elif (intent == 'greeting'):
            response = {
                "type": "message",
                "content": "Hello how can i help you?"
                }

        elif (intent == 'animal_classification'):
            image_data = data.get('image')
            if not image_data:
                response = {
                    "type": "message",
                    "content": f"No image is attached"
                }

             
            if isinstance(image_data, str) and image_data.startswith("data:image/"):
                print("saving image")
                try:
                    filepath = save_base64_image(image_data, save_dir="uploads")
                    response = {
                        "type": "image_received",
                        "content": "Image received and processed"
                    }

                    agent_response = await self.agent[intent].process(task="classify", image_path=filepath, history={})

                    response = {
                        "type": "message",
                        "content": f"This animal is: {agent_response['label']}"
                    }
                except Exception as e:
                    response = {
                        "type": "error",
                        "content": f"Failed to process image: {str(e)}"
                    }
        else:
            response = {
                "type": "message",
                "content": "Sorry I can't understand"
            }               


        if not response: 
            return; 
    
        await websocket.send_json(response) 

        self.conversation_manager.save_message(session_id=session_id, content=response["content"])
        
            


