from sqlalchemy import Column, Integer, String
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String)
    skill_level = Column(String) # e.g., "3.5"

class Post(Base):
    __tablename__ = "posts"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String) # For simplicity, just storing name
    content = Column(String)
    likes = Column(Integer, default=0)
    created_at = Column(String) # Storing as string for this prototype

class Chat(Base):
    __tablename__ = "chats"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    last_message = Column(String)
    timestamp = Column(String)
    # In a real app, you'd have a separate Messages table linked here
