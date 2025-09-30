from fastapi import Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import ConversationMessage

class ConversationManager:
    _instance = None

    def __init__(self, db_session: Session):
        if ConversationManager._instance is not None:
            raise Exception("Use `get_instance()` to access the singleton instance.")

        self.db_session = db_session
        ConversationManager._instance = self

    @classmethod
    def get_conversation_manager(cls, db: Session = Depends(get_db)):
        if cls._instance is None: 
            cls._instance = cls(db)
        return cls._instance

    def get_all_session_messages(self, session_id):
        """
        get all message of a session 
        """
        messages = self.db_session.query(ConversationMessage).filter(ConversationMessage.session_id == session_id).all()
        return messages

    def save_message(self, session_id, content, role="system", agent_type="system"): 
        """
        save the system messages in the database 
        """

        print("saving message")
        new_message = ConversationMessage(session_id = session_id, role=role, content=content, agent_type=agent_type)
        self.db_session.add(new_message)
        self.db_session.commit()
        self.db_session.refresh(new_message)
