import datetime
from sqlalchemy import Boolean, Column, DateTime, Integer, String, Text
from .database import Base


class AdminUser(Base):
    __tablename__ = "admin_users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)


class Profile(Base):
    __tablename__ = "profiles"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    title = Column(String(150), nullable=False)
    email = Column(String(120), nullable=False)
    phone = Column(String(30), nullable=True)
    location = Column(String(120), nullable=True)
    summary = Column(Text, nullable=True)
    years_experience = Column(Integer, default=6)
    linkedin_url = Column(String(255), nullable=True)
    github_url = Column(String(255), nullable=True)
    hackerrank_url = Column(String(255), nullable=True)
    x_url = Column(String(255), nullable=True)
    leetcode_url = Column(String(255), nullable=True)
    website_url = Column(String(255), nullable=True)
    resume_download_url = Column(String(255), nullable=True)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)


class Experience(Base):
    __tablename__ = "experiences"

    id = Column(Integer, primary_key=True, index=True)
    company = Column(String(120), nullable=False)
    role = Column(String(120), nullable=False)
    location = Column(String(100), nullable=True)
    start_date = Column(String(50), nullable=False)
    end_date = Column(String(50), nullable=True)
    is_current = Column(Boolean, default=False)
    skills_text = Column(String(255), nullable=True)
    description = Column(Text, nullable=True)
    achievements = Column(Text, nullable=True)  # JSON-encoded array or newline-separated
    display_order = Column(Integer, default=0)


class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(120), nullable=False)
    subtitle = Column(String(200), nullable=True)
    description = Column(Text, nullable=False)
    tech_stack = Column(Text, nullable=True)  # Comma-separated or JSON
    github_url = Column(String(255), nullable=True)
    live_url = Column(String(255), nullable=True)
    highlights = Column(Text, nullable=True)
    featured = Column(Boolean, default=True)
    display_order = Column(Integer, default=0)


class Skill(Base):
    __tablename__ = "skills"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(80), nullable=False)
    category = Column(String(80), nullable=False)
    proficiency = Column(String(50), nullable=True)
    display_order = Column(Integer, default=0)


class Education(Base):
    __tablename__ = "educations"

    id = Column(Integer, primary_key=True, index=True)
    institution = Column(String(150), nullable=False)
    degree = Column(String(150), nullable=False)
    field_of_study = Column(String(100), nullable=True)
    grade = Column(String(50), nullable=True)
    start_year = Column(String(20), nullable=True)
    end_year = Column(String(20), nullable=True)
    url = Column(String(255), nullable=True)


class Award(Base):
    __tablename__ = "awards"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(150), nullable=False)
    organization = Column(String(100), nullable=False)
    year = Column(String(30), nullable=True)
    description = Column(Text, nullable=True)
    display_order = Column(Integer, default=0)


class Certification(Base):
    __tablename__ = "certifications"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), nullable=False)
    issuer = Column(String(100), nullable=False)
    issue_date = Column(String(50), nullable=True)
    credential_url = Column(String(255), nullable=True)
    display_order = Column(Integer, default=0)


class ContactMessage(Base):
    __tablename__ = "contact_messages"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(120), nullable=False)
    subject = Column(String(200), nullable=True)
    message = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    is_read = Column(Boolean, default=False)


class BlogPost(Base):
    __tablename__ = "blog_posts"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    slug = Column(String(200), unique=True, index=True, nullable=False)
    excerpt = Column(Text, nullable=True)
    content = Column(Text, nullable=False)  # Formatted text / Markdown / HTML
    tags = Column(String(200), nullable=True)  # Comma-separated tags
    cover_image = Column(String(255), nullable=True)
    is_published = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)


class AiInsight(Base):
    __tablename__ = "ai_insights"

    id = Column(Integer, primary_key=True, index=True)
    section_key = Column(String(50), nullable=False)  # "executive_summary", "architecture_highlights", "recruiter_fit"
    title = Column(String(150), nullable=False)
    subtitle = Column(String(200), nullable=True)
    content = Column(Text, nullable=False)  # JSON-encoded details or markdown text
    display_order = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
