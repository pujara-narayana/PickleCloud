import os
import logging
from fastapi import FastAPI, Depends, HTTPException, status, Request
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from pydantic import BaseModel, Field, EmailStr, ValidationError, validator
from typing import List, Optional

# --- LOGGING SETUP ---
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(name)s %(message)s"
)
logger = logging.getLogger(__name__)

# Import models (fixed import error)
from modules import Base, Post, Chat

# --- DATABASE SETUP ---
SQLALCHEMY_DATABASE_URL = "sqlite:///./database.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create tables automatically
Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# --- AUTHENTICATION SETUP ---
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# Dummy user database for demonstration
fake_users_db = {
    "user1": {
        "id": 1,
        "username": "ThisIsMyFavour",
        "full_name": "Rowley Favour",
        "email": "example@gmail.com",
        "hashed_password": "fakehashedsecret",
        "disabled": False,
        "skill_level": "intermediate",
        "location": "New York",
        "joined_at": "2023-01-01",
    }
}

def fake_decode_token(token: str):
    # In a real app, decode and verify the JWT token here
    user = fake_users_db.get("user1")
    return user

async def get_current_user(token: str = Depends(oauth2_scheme)):
    user = fake_decode_token(token)
    if not user:
        logger.warning("Authentication failed: Invalid token")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user

# --- Pydantic Schemas (Data Validation) ---
class PostCreate(BaseModel):
    content: str = Field(..., min_length=1, max_length=500)

class PostResponse(BaseModel):
    id: int
    username: str
    content: str
    likes: int
    createdAt: str

class AccountResponse(BaseModel):
    id: int
    Setting: str
    CurrentData: str

class FullAccountResponse(BaseModel):
    id: int
    username: str
    full_name: str
    email: EmailStr
    skill_level: str
    location: str
    joined_at: str

class MatchQueryParams(BaseModel):
    skill: str
    radius: int

    @validator('skill')
    def validate_skill(cls, v):
        allowed_skills = {"beginner", "intermediate", "advanced", "pro"}
        if v.lower() not in allowed_skills:
            raise ValueError(f"Skill must be one of {allowed_skills}")
        return v.lower()

    @validator('radius')
    def validate_radius(cls, v):
        if not isinstance(v, int) or v <= 0 or v > 100:
            raise ValueError("Radius must be a positive integer (1-100)")
        return v

# --- APP SETUP ---
app = FastAPI()

# Allow frontend to talk to backend (CORS)
# Restrict to trusted origins (fix insecure CORS)
TRUSTED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    # Add your production frontend domain(s) here
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=TRUSTED_ORIGINS,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
)

# --- API ROUTES (Logic for Tasks) ---

# TASK 1 & FEED: Get and Create Posts
@app.get("/api/posts", response_model=List[PostResponse])
def get_posts(db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    posts = db.query(Post).order_by(Post.id.desc()).all()
    logger.info(f"User '{current_user['username']}' fetched posts feed.")
    # Convert DB models to JSON response format
    return [
        {
            "id": p.id,
            "username": p.username,
            "content": p.content,
            "likes": p.likes,
            "createdAt": p.created_at
        }
        for p in posts
    ]

@app.post("/api/posts", response_model=PostResponse, status_code=201)
def create_post(
    post: PostCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    # Use authenticated user's username and current timestamp
    from datetime import datetime
    try:
        new_post = Post(
            username=current_user["username"],
            content=post.content,
            created_at=datetime.utcnow().isoformat() + "Z",
            likes=0
        )
        db.add(new_post)
        db.commit()
        db.refresh(new_post)
        logger.info(f"User '{current_user['username']}' created a new post (id={new_post.id}).")
        return PostResponse(
            id=new_post.id,
            username=new_post.username,
            content=new_post.content,
            likes=new_post.likes,
            createdAt=new_post.created_at
        )
    except Exception as e:
        db.rollback()
        logger.error(f"Error creating post: {e}")
        raise HTTPException(
            status_code=500,
            detail="An error occurred while creating the post."
        )

# TASK 2: Matchmaking Logic
@app.get("/api/matches")
def find_matches(
    skill: str = "",
    radius: int = 10,
    current_user: dict = Depends(get_current_user)
):
    # Validate input using Pydantic model
    try:
        params = MatchQueryParams(skill=skill, radius=radius)
    except ValidationError as ve:
        logger.warning(f"Invalid matchmaking params: {ve}")
        raise HTTPException(
            status_code=400,
            detail=ve.errors()
        )
    # LOGIC: This mimics the matchmaking algorithm
    logger.info(f"User '{current_user['username']}' searching for skill '{params.skill}' within {params.radius} miles.")
    # In the future, this will query the User table for people near that radius
    return {"status": "success", "message": "Match search started"}

# TASK 3: Chats
@app.get("/api/chats")
def get_chats(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    # Mock data if DB is empty
    if db.query(Chat).count() == 0:
        db.add(Chat(name="Doubles Crew", last_message="Same time Thursday?", timestamp="3m ago"))
        db.add(Chat(name="League Captain", last_message="Roster locked in.", timestamp="1h ago"))
        db.commit()
        logger.info("Initialized default chats in database.")

    chats = db.query(Chat).all()
    # Add a dummy messages list to satisfy the frontend expectation
    result = []
    for c in chats:
        result.append({
            "id": c.id,
            "name": c.name,
            "lastMessage": c.last_message,
            "timestamp": c.timestamp,
            "messages": [{"from": "them", "text": "Welcome to the chat!"}]
        })
    logger.info(f"User '{current_user['username']}' fetched chats.")
    return result

# ACCOUNT DATA
@app.get("/api/account", response_model=FullAccountResponse)
def get_account(current_user: dict = Depends(get_current_user)):
    # Return all relevant user fields
    logger.info(f"User '{current_user['username']}' fetched account data.")
    return FullAccountResponse(
        id=current_user["id"],
        username=current_user["username"],
        full_name=current_user["full_name"],
        email=current_user["email"],
        skill_level=current_user.get("skill_level", ""),
        location=current_user.get("location", ""),
        joined_at=current_user.get("joined_at", "")
    )

# --- SERVE FRONTEND ---
# Use absolute path for static files (fix FILE_PATH_ERROR)
frontend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "../frontend"))
if not os.path.isdir(frontend_dir):
    logger.error(f"Frontend directory '{frontend_dir}' does not exist.")
else:
    app.mount("/", StaticFiles(directory=frontend_dir, html=True), name="static")