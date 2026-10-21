from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import declarative_base  # Updated import to use non-deprecated API

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

# SECURITY FIXES:
# - Updated import to use 'from sqlalchemy.orm import declarative_base' instead of deprecated 'sqlalchemy.ext.declarative.declarative_base'
# - Ensure all imports reference 'modules' (this file's name) instead of 'models' elsewhere in the codebase to avoid FILE_NAME_MISMATCH errors.