from fastapi import FastAPI, File, UploadFile, Depends, HTTPException, Request, WebSocket, WebSocketDisconnect, Query, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from contextlib import asynccontextmanager
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
import httpx
import asyncio

from app.database import Base, engine, SessionLocal, get_db
from app.models import User, Base
from app.jwt_utils import create_access_token, decode_access_token, get_current_user
from app.security import hash_password, verify_password
from app.schemas import CreateUser, TokenWithEmail

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    Base.metadata.create_all(bind=engine)
    print("Tables and model ready!")
    
    yield  
    
    print("Shutting down...")

app = FastAPI(lifespan=lifespan)
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

origins = [
    "http://localhost:5173",  # Vite dev server
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,      
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):

    # get error 
    first_error = exc.errors()[0]
    print(first_error)
    field = first_error.get("loc")[-1] 
    msg = first_error.get("msg")       
    
    if field == "email":
        error_message = "Invalid email address"
    elif field == "password":
        error_message = "Password must contain at least one number, one symbol, one capital letter, one lower case letter and should be longer than 8 characters"
    else:
        print(msg)
        error_message = msg

    return JSONResponse(status_code=400, content={"detail": {"error": error_message}})


@app.post("/signup")
def signup(user: CreateUser, db: Session = Depends(get_db)):
    # check if email already exist 
    if db.query(User).filter(User.email == user.email).first():
        raise HTTPException(status_code=400, detail={"error": "Email already exists"})

    # create password hash     
    hashed_pwd = hash_password(user.password)

    # create user
    new_user = User(email=user.email, password=hashed_pwd)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # create token 
    token = create_access_token({"sub": user.email})
    return TokenWithEmail(access_token=token, token_type="bearer", user=user.email)

@app.post("/login")
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    # get the user from the database 
    user = db.query(User).filter(User.email == form_data.username).first()

    if not user:
        raise HTTPException(status_code=401, detail={"error": "Email is not registered"})

    # check passwrod
    if not user or not verify_password(form_data.password, user.password):
        raise HTTPException(status_code=401, detail={"error": "Invalid Credentials"})
    
    # create token
    token = create_access_token({"sub": user.email})
    return TokenWithEmail(access_token=token, token_type="bearer", user=user.email)

@app.get("/me")
def read_me(token: str = Depends(oauth2_scheme)):
    try:
        payload = decode_access_token(token)
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    return {"email": payload.get("sub")}


@app.websocket("/ws")
async def websocket_endpoint(
    websocket: WebSocket, 
    token: str | None = Query(default=None)
):
    await websocket.accept()    # accept the connection 

    # check if the token exist 
    if not token:
        error_message = {
            "type": "error",
            "code": "missing_token",
            "message": "Token is required"
        }
        await websocket.send_json(error_message)
        await asyncio.sleep(0.1)
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return

    # check the user 
    user = await get_current_user(token=token)
    if not user: 
        #send error to the client
        error_message = {
            "type": "error", 
            "code": "authentication_failed", 
            "message": "Invalid or expired token"
        }
        await websocket.send_json(error_message)
        await asyncio.sleep(0.1)
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return 
    
    try:
        while True:
            data = await websocket.receive_json()

            if data.get("action") == "create_session":
                print("creating session")
           
    except WebSocketDisconnect:
        print("disconnect")





@app.post("/classify/")
async def upload_file(file: UploadFile = File(...)):
    contents = await file.read()
    async with httpx.AsyncClient() as client:
        files = {"file": (file.filename, contents, file.content_type)}
        response = await client.post("http://localhost:8001/predict/", files=files)

    return response.json()

