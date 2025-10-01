from typing import Dict, Any
from fastapi import Depends
from sqlalchemy import desc
from sqlalchemy.orm import Session
from datetime import datetime

from app.database import get_db
from app.models import ChatSession, ConversationMessage

class SessionManager:
    def __init__(self, db_session: Session):
        self.db_session = db_session; 
    
    async def create_session(self, user_id:str, initial_context: Dict[str, Any] = None): 
        new_session = ChatSession(
            user_id=user_id,
            created_at=datetime.now(),
            status="active", 
            context=initial_context or {}
        )

        self.db_session.add(new_session)
        self.db_session.commit()

        # initial_message = ConversationMessage(
        #     session_id=new_session.id,
        #     role="user",
        #     content=initial_context['initial_message'],
        #     agent_type="user",
        #     timestamp=datetime.now()
        # )
        
        # self.db_session.add(initial_message)
        # self.db_session.commit()
        
        # logger.info(f"Created new session {session_id} for user {user_id}")

        return new_session.id

    async def validate_session(self, session_id: str, user_id: str): 
        # check if the session exists
        session = self.db_session.query(ChatSession).filter(
            ChatSession.id == session_id,
            ChatSession.user_id == user_id,
        ).first()

        # update the status
        if (session): 
            session.status = 'active'
            session.updated_at = datetime.now()
            self.db_session.commit()

        return session is not None 

    async def close_session(self, session_id: str, user_id: str):
        # check if the session exists
        session = self.db_session.query(ChatSession).filter(
            ChatSession.id == session_id,
            ChatSession.user_id == user_id,
        ).first()

        # update the status
        if (session): 
            session.status = 'close'
            session.updated_at = datetime.now()
            self.db_session.commit()
        else:
            print("session not found")

    async def get_all_sessions(self, user_id):
        return self.db_session.query(ChatSession).filter(ChatSession.user_id == user_id).order_by(desc(ChatSession.created_at)).all()

def get_session_manager(db: Session = Depends(get_db) ) -> SessionManager: 
    return SessionManager(db_session=db)