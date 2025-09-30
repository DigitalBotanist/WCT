from fastapi import Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.jwt_utils import decode_access_token, create_access_token
from app.models import User

class UserManager:
    _instance = None 

    def __init__(self, db_session: Session):
        if UserManager._instance is not None:
            raise Exception("Use `get_instance()` to access the singleton instance.")

        self.db_session = db_session
        UserManager._instance = self

    @classmethod
    def get_user_manager(cls, db: Session = Depends(get_db)):
        if cls._instance is None: 
            cls._instance = cls(db)
        return cls._instance

    async def verify_token(self, token): 
        payload = decode_access_token(token)
        user_id = str(payload.get("sub"))
        if user_id is None: 
            return None 
        
        user = self.db_session.query(User).filter(User.id == user_id).first()
        if not user: 
            return None 
        
        return user

