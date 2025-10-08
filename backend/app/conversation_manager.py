from fastapi import Depends
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import desc
import logging

from app.database import get_db
from app.models.database_models import ConversationMessage, Attachments, TempAttachments
from app.utils import image_to_base64

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
        logging.debug(f"querying all conversation messages, session_id: {session_id}")
        messages = self.db_session.query(ConversationMessage).\
            options(joinedload(ConversationMessage.attachments)).\
            filter(ConversationMessage.session_id == session_id).\
            order_by(ConversationMessage.timestamp).all()
        logging.debug(f"got messages: {messages is not None}")
        
        return messages 

    def save_message(self, session_id, content, role="system", agent_type="system", attachments_paths=None): 
        """
        save the system messages in the database 
        """

        logging.debug("saving message")
        new_message = ConversationMessage(session_id = session_id, role=role, content=content, agent_type=agent_type)
        self.db_session.add(new_message)
        self.db_session.commit()
        self.db_session.refresh(new_message)


        return new_message
    
    def save_attachments(self, message_id, attachemnts_paths: list, type):
        logging.debug("saving attachment")
        for attachment_path in attachemnts_paths:
            attachment = Attachments(message_id=message_id, path=attachment_path, type=type)
            self.db_session.add(attachment)
            self.db_session.commit()
    
    def save_temp_csv(self, user_id, filepath): 
        logging.debug("saving temp attachment")
        attachment = TempAttachments(path=filepath, type="csv", user_id=user_id)
        self.db_session.add(attachment)
        self.db_session.commit()
        self.db_session.refresh(attachment)

        return attachment 

    def save_csv_attachment(self, message_id, attachment_id):
        logging.debug("getting csv from the temp attachemtns")
        temp = self.db_session.query(TempAttachments).filter(TempAttachments.id == attachment_id).first()

        if not temp: 
            return None

        logging.debug(f"got attachment : {temp}")


        logging.debug("saving the attachment")
        attachment = Attachments(id=temp.id, message_id=message_id, path=temp.path, type=temp.type)
        self.db_session.add(attachment)
        self.db_session.commit()

        return attachment
        
    def get_attachment(self, attachment_id):
        logging.debug("getting attachment")
        attachment = self.db_session.query(Attachments).filter(Attachments.id == attachment_id).first()

        if (attachment.type == 'img'):
            img = image_to_base64(attachment.path)
            return img

    def get_image(self, filename):
        logging.debug("getting image")
        filepath = f'uploads/img/{filename}' 
        img = image_to_base64(filepath)
        return img
