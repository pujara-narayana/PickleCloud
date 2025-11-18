from fastapi import FastAPI, Depends
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from pydantic import BaseModel
from typing import List

# Import models
from models import Base, Post, Chat

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

# --- Pydantic Schemas (Data Validation) ---
class PostCreate(BaseModel):
    content: str

class PostResponse(BaseModel):
    id: int
    username: str
    content: str
    likes: int
    createdAt: str

# --- APP SETUP ---
app = FastAPI()

# Allow frontend to talk to backend (CORS)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- API ROUTES (Logic for Tasks) ---

# TASK 1 & FEED: Get and Create Posts
@app.get("/api/posts", response_model=List[PostResponse])
def get_posts(db: Session = Depends(get_db)):
    posts = db.query(Post).order_by(Post.id.desc()).all()
    # Convert DB models to JSON response format
    return [
        {"id": p.id, "username": p.username, "content": p.content, "likes": p.likes, "createdAt": p.created_at}
        for p in posts
    ]

@app.post("/api/posts")
def create_post(post: PostCreate, db: Session = Depends(get_db)):
    # Logic: In a real app, we'd get the logged-in user. Here we mock "You".
    new_post = Post(username="You", content=post.content, created_at="Just now", likes=0)
    db.add(new_post)
    db.commit()
    return {"message": "Post created"}

# TASK 2: Matchmaking Logic
@app.get("/api/matches")
def find_matches(skill: str, radius: int):
    # LOGIC: This mimics the matchmaking algorithm
    # In the future, this will query the User table for people near that radius
    print(f"Searching for skill {skill} within {radius} miles...")
    return {"status": "success", "message": "Match search started"}

# TASK 3: Chats
@app.get("/api/chats")
def get_chats(db: Session = Depends(get_db)):
    # Mock data if DB is empty
    if db.query(Chat).count() == 0:
        db.add(Chat(name="Doubles Crew", last_message="Same time Thursday?", timestamp="3m ago"))
        db.add(Chat(name="League Captain", last_message="Roster locked in.", timestamp="1h ago"))
        db.commit()

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
    return result

# ACCOUNT DATA
@app.get("/api/account")
def get_account():
    # Logic: Return the current logged-in user's info
    return [
        {"id": 1, "Setting": "Name", "CurrentData": "Rowley Favour"},
        {"id": 2, "Setting": "Username", "CurrentData": "ThisIsMyFavour"},
        {"id": 3, "Setting": "Email", "CurrentData": "example@gmail.com"},
        # ... add other fields as needed
    ]

# --- SERVE FRONTEND ---
# This must be at the end. It tells Python to serve your HTML files.
app.mount("/", StaticFiles(directory="../frontend", html=True), name="static")
