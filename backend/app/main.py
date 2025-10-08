from fastapi import FastAPI, File, UploadFile, Depends, HTTPException, Request, WebSocket, WebSocketDisconnect, Query, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from contextlib import asynccontextmanager
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from typing import Dict
import httpx
import asyncio
import base64
from io import BytesIO
from PIL import Image
import logging
import colorlog
import json

from app.database import Base, engine, SessionLocal, get_db
from app.models.database_models import User, Base
from app.jwt_utils import create_access_token, decode_access_token
from app.security import hash_password, verify_password
from app.schemas import CreateUser, TokenWithEmail
from app.session_manager import SessionManager, get_session_manager
from app.utils import save_base64_image
from app.orchestrator import Orchestrator
from app.conversation_manager import ConversationManager
from app.user_manager import UserManager
from app.models.graph import GraphState
from app.message_router.message_router import MessageRouter
from app.conversation_manager import ConversationManager
from app.input_formatter import InputFormatter



# 1. Setup colored logging first
handler = colorlog.StreamHandler()
handler.setFormatter(colorlog.ColoredFormatter(
    '%(log_color)s%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    log_colors={
        'DEBUG': 'cyan',
        'INFO': 'green', 
        'WARNING': 'yellow',
        'ERROR': 'red',
        'CRITICAL': 'bold_red',
    }
))

logging.basicConfig(level=logging.DEBUG, handlers=[handler])

# Your other noisy libraries
logging.getLogger('httpx').setLevel(logging.WARNING)
logging.getLogger('httpcore').setLevel(logging.WARNING)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    Base.metadata.create_all(bind=engine)
    logging.info("Tables and model ready!")
    
    yield  
    
    logging.info("Shutting down...")

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
    token = create_access_token({"sub": str(user.id), "email": user.email})
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
    token = create_access_token({"sub": str(user.id), "email": user.email})
    return TokenWithEmail(access_token=token, token_type="bearer", user=user.email)

@app.get("/conversation/{session_id}")
async def get_all_conversations(
    session_id, 
    token: str = Depends(oauth2_scheme), 
    user_manager: UserManager = Depends(UserManager.get_user_manager),
    conversation_manager: ConversationManager =Depends(ConversationManager.get_conversation_manager)
    ):
    """
    get all session conversations
    """
    user = await user_manager.verify_token(token=token)
    if not user: 
        raise HTTPException(status_code=403, detail="Token not found. permission denied")

    messages = conversation_manager.get_all_session_messages(session_id=session_id)
    if not messages:
        raise HTTPException(status_code=404, detail="Conversation not found")

    return [message.as_dict() for message in messages]

@app.delete("/chat_session/{session_id}")
async def get_all_conversations(
    session_id, 
    token: str = Depends(oauth2_scheme), 
    user_manager: UserManager = Depends(UserManager.get_user_manager),
    session_manager: SessionManager = Depends(get_session_manager)
    ):
    """
    get all session conversations
    """
    user = await user_manager.verify_token(token=token)
    if not user: 
        raise HTTPException(status_code=403, detail="Token not found. permission denied")


    if not session_manager.delete_chat_session(session_id=session_id):
        raise HTTPException(status_code=404, detail="Conversation not found")

    return  {"message": "Chat session deleted successfully."}


@app.get("/chat_sessions")
async def get_all_sessions(
    token: str = Depends(oauth2_scheme), 
    user_manager: UserManager = Depends(UserManager.get_user_manager),
    session_manager: SessionManager = Depends(get_session_manager)
    ):
    """
    return all the user sessions
    """

    user = await user_manager.verify_token(token=token)
    if not user: 
        raise HTTPException(status_code=403, detail="Token not found. permission denied")
    
    sessions = await session_manager.get_all_sessions(user.id)
    return [session.as_dict() for session in sessions]

@app.get("/attachment/{attachment_id}")
async def get_attachment(
    attachment_id: str,
    token: str = Depends(oauth2_scheme), 
    user_manager: UserManager = Depends(UserManager.get_user_manager),
    conversation_manager: ConversationManager =Depends(ConversationManager.get_conversation_manager),
    ):

    user = await user_manager.verify_token(token=token)
    if not user: 
        raise HTTPException(status_code=403, detail="Token not found. permission denied")
    return conversation_manager.get_attachment(attachment_id=attachment_id) 

@app.post("/attachment/csv")
async def get_attachment(
    file: UploadFile = File(...),
    token: str = Depends(oauth2_scheme), 
    user_manager: UserManager = Depends(UserManager.get_user_manager),
    conversation_manager: ConversationManager =Depends(ConversationManager.get_conversation_manager),
    input_formatter: InputFormatter = Depends(InputFormatter.get_input_formatter)
    ):

    user = await user_manager.verify_token(token=token)
    if not user: 
        raise HTTPException(status_code=403, detail="Token not found. permission denied")

    filepath = await input_formatter.process_csv(file) 
    attachment = conversation_manager.save_temp_csv(user.id, filepath)
    return {"id": attachment.id}

@app.get("/animal_img/{filename}")
async def get_attachment(
    filename: str,
    token: str = Depends(oauth2_scheme), 
    user_manager: UserManager = Depends(UserManager.get_user_manager),
    conversation_manager: ConversationManager =Depends(ConversationManager.get_conversation_manager),
    ):

    user = await user_manager.verify_token(token=token)
    if not user: 
        raise HTTPException(status_code=403, detail="Token not found. permission denied")
    return conversation_manager.get_image(filename=filename) 

@app.websocket("/ws")
async def websocket_endpoint(
    websocket: WebSocket, 
    token: str | None = Query(default=None), 
    session_manager: SessionManager = Depends(get_session_manager),
    orchestrator: Orchestrator = Depends(Orchestrator.get_orchestrator),
    user_manager: UserManager = Depends(UserManager.get_user_manager),
    message_router: MessageRouter = Depends(MessageRouter.get_message_router),
    conversation_manager: ConversationManager = Depends(ConversationManager.get_conversation_manager),
    input_formatter: InputFormatter = Depends(InputFormatter.get_input_formatter)
):
    logging.debug("web socket starting")
    session_id = None 
    async def send_message(message):
        logging.debug(f"sending message: {message}")
        logging.debug(f"response: {message}")
        conversation_manager.save_message(session_id=session_id, content=message.get("content"))
        await websocket.send_json(message)
    async def send_status(message):
        logging.debug(f"sending status: {message}")
        logging.debug(f"response: {message}")
        await websocket.send_json(message)
    async def send_title(message):
        logging.debug(f"sending title: {message}")
        session_manager.save_title(session_id=session_id, title=message.get("content"))
        await websocket.send_json(message)

    async def send_animal(message: Dict):
        logging.debug(f"sending animal: {message}")
        content = message.get("animal")

        raw_json = content.replace("```json\n", "").replace("\n```", "")

        try:
            context = json.loads(raw_json)
        except json.JSONDecodeError as e:
            logging.error(f"Failed to parse JSON: {e}")

        img_name = image.split("/")[-1]
        context['image'] = img_name
        message['animal'] = context
        session_manager.save_context(session_id=session_id,context=context)
        await websocket.send_json(message)
         
    await websocket.accept()    # accept the connection 
    logging.info(f"web socket is connected")

    orchestrator.register_response_handler("message", send_message)
    orchestrator.register_response_handler("title", send_title)
    orchestrator.register_response_handler("animal", send_animal)
    orchestrator.register_response_handler("status", send_status)

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
    user: User | None = await user_manager.verify_token(token=token)
    logging.debug(f"socket user: {user}")
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
            logging.info(f"socket listenting....")
            data = await websocket.receive_json()
            logging.info(f"got socket message")
            logging.info(f"socket sessionid: {data.get('sessionId')}")
            logging.debug(f"message: {data}")

            if data.get("action") == "create_session":
                session_id = await session_manager.create_session(user.id, initial_context={
                    "initial_message": data.get("content", "")
                })
                websocket.state.session_id = session_id

                if session_id: 
                    await websocket.send_json({
                        'type': 'sessionId',
                        'content': str(session_id)
                    })
                else:
                    await websocket.send_json({
                        "type": "error",
                        "content": "Couldn't create session"
                    }) 

            elif data.get("action") == 'continue_session':
                session_id = data.get("sessionId")

                if not await session_manager.validate_session(session_id=session_id, user_id=user.id):
                    await websocket.send_json({
                        "type": "error",
                        "content": "Invalid session"
                    })
                    await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
                    return
                else: 
                    await websocket.send_json({
                        "type": "connection_status",
                        "content": "session_validated",
                    }) 
                    await websocket.send_json({
                        "type": "status",
                        "content": "done",
                    }) 
                websocket.state.session_id = session_id
                continue
            try: 
                session_id =  data.get("sessionId") or websocket.state.get("session_id") 
            except err: 
                await websocket.send_json({
                        "type": "error",
                        "content": "there is no session with session id"
                    })
                await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
            
            session = session_manager.get_session(session_id=session_id)
            message = conversation_manager.save_message(session_id=session_id, content=data.get("content"), role='user')  # save messages to the database 

            # checking if there are images 
            logging.debug(f"image in the user request: {data.get('image') is not None}")
            if data.get('image'): 
                image, error = input_formatter.process_image(data)
                if error: 
                    await websocket.send_json({
                        "type": "error",
                        "content": "Error while processing image"
                    })  
                
                conversation_manager.save_attachments(message_id=message.id, attachemnts_paths=[image], type="img")
            else:
                image = None
            
            # checking for csv
            if data.get('csv'):
                conversation_manager.save_csv_attachment(message_id=message.id, attachment_id=data.get('csv'))
                csv = data.get('csv')
            else: 
                csv = None


            if data.get("action") == "user_request": 
                session_id = data.get("sessionId")
                if not await session_manager.validate_session(session_id=session_id, user_id=user.id):
                    await websocket.send_json({
                        "type": "error",
                        "content": "Invalid session"
                    })
                    await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
                    return

            intent = message_router.classify_intent(data.get('content')) 
            state = GraphState(user_input=data, intent=intent, user_id=user.id)
            if image:
                state.image = image

            if csv: 
                state.csv = csv
            if session.title: 
                logging.debug(f"session title: {session.title}")
                state.title = session.title
            
            if session.context: 
                logging.debug(f"session context: {session.context}")
                state.context = session.context

            await orchestrator.run(state=state) 
    except WebSocketDisconnect:
        print("disconnect")



