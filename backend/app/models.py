from sqlalchemy import Column, Integer, String, DateTime, JSON, Boolean, ForeignKey, Text
from sqlalchemy.orm import declarative_base, relationship
from sqlalchemy.dialects.postgresql import UUID
import uuid
from datetime import datetime

Base = declarative_base()

class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)  # UUID primary key
    email = Column(String, unique=True, index=True, nullable=False)
    password = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)

    # Relationships
    chat_sessions = relationship("ChatSession", back_populates="user")

    def __repr__(self):
        return f"<User(id={self.id}, email={self.email})>"

class ChatSession(Base):
    __tablename__ = "chat_sessions"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)    
    user_id = Column(UUID(as_uuid=True), ForeignKey('users.id'), nullable=False, index=True)
    created_at = Column(DateTime, default=datetime.now)
    closed_at = Column(DateTime, nullable=True)
    status = Column(String, default="active")  # active, closed, archived
    title = Column(String, nullable=True)  # Auto-generated from first message
    context = Column(JSON, default=dict)  # Session-specific context
    
    # Relationships
    user = relationship("User", back_populates="chat_sessions")
    messages = relationship("ConversationMessage", back_populates="session")

    def __repr__(self):
        return f"<ChatSession(id={self.id}, user_id={self.user_id}, status={self.status})>"

    def as_dict(self):
        """
        Convert the ChatSession model instance to a dictionary.
        """
        return {
            "id": str(self.id),  # Convert UUID to string for JSON compatibility
            "user_id": str(self.user_id),  # Convert UUID to string for JSON compatibility
            "title": self.title,
            "created_at": self.created_at.isoformat() if self.created_at else None,  # Serialize datetime to ISO string
            "closed_at": self.closed_at.isoformat() if self.closed_at else None,  # Serialize datetime to ISO string
            "status": self.status,
            "context": self.context,
        }



class ConversationMessage(Base):
    __tablename__ = "conversation_messages"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)    
    session_id = Column(UUID(as_uuid=True), ForeignKey('chat_sessions.id'), index=True)
    role = Column(String)  # user, assistant, system
    agent_type = Column(String)  # classifier, migration_analyzer, llm_writer, system
    content = Column(Text)
    meta_data = Column(JSON)  
    timestamp = Column(DateTime, default=datetime.now, index=True)
    
    # Relationships
    session = relationship("ChatSession", back_populates="messages")
    attachments = relationship("Attachments", back_populates="message")
    def __repr__(self):
        return f"<ConversationMessage(id={self.id}, session_id={self.session_id}, role={self.role})>"

    def as_dict(self):
        """
        Convert the SQLAlchemy model instance to a dictionary
        """
        return {
            "id": str(self.id),
            "session_id": str(self.session_id),  # Convert UUID to string for JSON compatibility
            "role": self.role,
            "agent_type": self.agent_type,
            "content": self.content,
            "meta_data": self.meta_data,
            "timestamp": self.timestamp.isoformat() if self.timestamp else None,  # Serialize datetime to ISO string
            "attachments": [attachment.to_dict() for attachment in self.attachments]
        }


class Attachments(Base):
    __tablename__ = "attachments"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    message_id = Column(UUID(as_uuid=True), ForeignKey('conversation_messages.id'), index=True, nullable=False)
    path = Column(String, nullable=False)
    type = Column(String, nullable=False)

    # relationships
    
    message = relationship("ConversationMessage", back_populates="attachments")

    def to_dict(self):
        return {
            "id": str(self.id),
            "path": self.path,
            "message_id": self.message_id,
            "type": self.type
        }
