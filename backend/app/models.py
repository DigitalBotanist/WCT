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


class ConversationMessage(Base):
    __tablename__ = "conversation_messages"
    
    id = Column(String, primary_key=True)
    session_id = Column(UUID(as_uuid=True), ForeignKey('chat_sessions.id'), index=True)
    role = Column(String)  # user, assistant, system
    agent_type = Column(String)  # classifier, migration_analyzer, llm_writer, system
    content = Column(Text)
    meta_data = Column(JSON)  
    timestamp = Column(DateTime, default=datetime.now, index=True)
    
    # Relationships
    session = relationship("ChatSession", back_populates="messages")

    def __repr__(self):
        return f"<ConversationMessage(id={self.id}, session_id={self.session_id}, role={self.role})>"
