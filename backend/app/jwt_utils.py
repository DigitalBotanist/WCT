# jwt_utils.py
from datetime import datetime, timedelta
from jose import jwt, JWTError
from dotenv import load_dotenv
from sqlalchemy.orm import Session
import os 

from app.models import User

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY") 
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30000

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.now() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def decode_access_token(token: str):
    try: 
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError: 
        return None

async def verify_user(token: str, db_session: Session): 
    """
    verify if the user is in the database 
    and return user object 
    or return None
    """ 
    payload = decode_access_token(token)
    user_id = str(payload.get("sub"))
    if user_id is None: 
        return None 
    
    user = db_session.query(User).filter(User.id == user_id).first()
    if not user: 
        return None 
    
    return user
