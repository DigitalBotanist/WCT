from typing import Union
from fastapi import FastAPI, File, UploadFile, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from typing import List
from contextlib import asynccontextmanager
from backend.app.database import Base, engine, SessionLocal
from backend.app.models import User, Base
from backend.app.jwt_utils import create_access_token, decode_access_token
from backend.app.security import hash_password, verify_password
import httpx
from pydantic import BaseModel

class UserCreate(BaseModel):
    email: str
    password: str

# Base.metadata.create_all(bind=engine)
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    Base.metadata.create_all(bind=engine)
    print("Tables and model ready!")
    
    yield  # <-- FastAPI runs app here
    
    # Shutdown (optional cleanup)
    print("Shutting down...")

app = FastAPI(lifespan=lifespan)
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

# Dependency: get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.post("/signup")
def signup(user: UserCreate, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == user.email).first():
        raise HTTPException(status_code=400, detail="Email already exists")
    hashed_pwd = hash_password(user.password)
    new_user = User(email=user.email, password=hashed_pwd)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return {"msg": "User created successfully"}

@app.post("/login")
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    # Use form_data.username, not email
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = create_access_token({"sub": user.email})
    return {"access_token": token, "token_type": "bearer"}

@app.get("/me")
def read_me(token: str = Depends(oauth2_scheme)):
    try:
        payload = decode_access_token(token)
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    return {"email": payload.get("sub")}

@app.post("/classify/")
async def upload_file(file: UploadFile = File(...)):
    contents = await file.read()
    async with httpx.AsyncClient() as client:
        files = {"file": (file.filename, contents, file.content_type)}
        response = await client.post("http://localhost:8001/predict/", files=files)

    return response.json()
    return {"prediction": predication}

