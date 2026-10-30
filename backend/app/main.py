import json
import re
from contextlib import asynccontextmanager
from typing import Any, Dict, List, Optional

from fastapi import Depends, FastAPI, HTTPException, Request, status
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from .auth import (
    create_access_token,
    get_current_admin,
    hash_password,
    verify_password,
)
from .database import Base, engine, get_db, SessionLocal
from .models import (
    AdminUser,
    Award,
    BlogPost,
    Certification,
    ContactMessage,
    Education,
    Experience,
    Profile,
    Project,
    Skill,
)
from .schemas import (
    AdminLogin,
    AwardCreate,
    AwardOut,
    AwardUpdate,
    CertificationCreate,
    CertificationOut,
    CertificationUpdate,
    ContactMessageCreate,
    ContactMessageOut,
    EducationCreate,
    EducationOut,
    EducationUpdate,
    ExperienceCreate,
    ExperienceOut,
    ExperienceUpdate,
    PasswordChange,
    PortfolioFullData,
    ProfileOut,
    ProfileUpdate,
    ProjectCreate,
    ProjectOut,
    ProjectUpdate,
    SkillCreate,
    SkillOut,
    SkillUpdate,
    Token,
    BlogPostCreate,
    BlogPostUpdate,
    BlogPostOut,
)
from .seed import populate_from_resume_payload, seed_database


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: safely create tables and seed default data
    try:
        Base.metadata.create_all(bind=engine)
        db = SessionLocal()
        try:
            seed_database(db)
        finally:
            db.close()
    except Exception as e:
        print(f"Lifespan database initialization warning: {e}")
    yield


app = FastAPI(
    title="Developer Portfolio & Blog API",
    description="FastAPI + PostgreSQL / SQLite backend for personal portfolio and content management.",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def normalize_vercel_path(request: Request, call_next):
    # Check for __path__ passed by Vercel rewrite
    override_path = request.query_params.get("__path__")
    if override_path:
        clean_override = "/" + override_path.lstrip("/")
        request.scope["path"] = clean_override
    else:
        matched = request.headers.get("x-matched-path") or request.headers.get("x-forwarded-uri")
        if matched and matched not in ["/api/index.py", "/index.py"]:
            request.scope["path"] = matched.split("?")[0]
        else:
            path = request.scope.get("path", "")
            for prefix in ["/api/index.py", "/index.py"]:
                if path.startswith(prefix) and len(path) > len(prefix):
                    request.scope["path"] = path[len(prefix):]
                    break
    return await call_next(request)


@app.exception_handler(404)
async def custom_404_handler(request: Request, exc):
    return JSONResponse(
        status_code=404,
        content={
            "detail": "Not Found",
            "path": request.url.path,
            "scope_path": request.scope.get("path"),
        },
    )


# -----------------------------
# Public Endpoints
# -----------------------------

@app.get("/")
@app.get("/api")
def root():
    from .database import db_status
    return {
        "status": "healthy",
        "app": "Portfolio & Blog API",
        "database": db_status.get("type", "SQLite"),
        "db_connected": db_status.get("connected", False),
    }


@app.get("/health")
@app.get("/api/health")
def health_check():
    from .database import db_status
    return {
        "status": "healthy",
        "app": "Portfolio & Blog API",
        "database": db_status.get("type", "SQLite"),
        "db_connected": db_status.get("connected", False),
        "db_error": db_status.get("error"),
        "db_host": db_status.get("host"),
        "db_port": db_status.get("port"),
        "db_user": db_status.get("user"),
        "db_masked_url": db_status.get("masked_url"),
        "db_attempts": db_status.get("attempts", []),
    }


@app.get("/portfolio", response_model=PortfolioFullData)
@app.get("/api/portfolio", response_model=PortfolioFullData)
def get_portfolio_data(db: Session = Depends(get_db)):
    profile = db.query(Profile).first()
    experiences = db.query(Experience).order_by(Experience.display_order.asc(), Experience.id.asc()).all()
    projects = db.query(Project).order_by(Project.display_order.asc(), Project.id.asc()).all()
    skills = db.query(Skill).order_by(Skill.category.asc(), Skill.display_order.asc()).all()
    education = db.query(Education).all()
    awards = db.query(Award).order_by(Award.display_order.asc()).all()
    certifications = db.query(Certification).order_by(Certification.display_order.asc()).all()
    posts = db.query(BlogPost).filter(BlogPost.is_published == True).order_by(BlogPost.created_at.desc()).all()

    return PortfolioFullData(
        profile=profile,
        experiences=experiences,
        projects=projects,
        skills=skills,
        education=education,
        awards=awards,
        certifications=certifications,
        posts=posts,
    )


@app.post("/contact")
@app.post("/api/contact")
def submit_contact_message(msg: ContactMessageCreate, db: Session = Depends(get_db)):
    db_msg = ContactMessage(
        name=msg.name,
        email=msg.email,
        subject=msg.subject or "Portfolio Inquiry",
        message=msg.message,
    )
    db.add(db_msg)
    db.commit()
    db.refresh(db_msg)
    return {
        "status": "success",
        "message": f"Thank you {msg.name}! Your message has been received.",
        "id": db_msg.id,
    }


# -----------------------------
# Authentication Endpoints
# -----------------------------

@app.post("/auth/login", response_model=Token)
@app.post("/api/auth/login", response_model=Token)
def login(form_data: AdminLogin, db: Session = Depends(get_db)):
    admin = db.query(AdminUser).filter(AdminUser.username == form_data.username).first()
    if not admin or not verify_password(form_data.password, admin.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password",
        )
    token = create_access_token(data={"sub": admin.username})
    return Token(access_token=token, token_type="bearer", username=admin.username)


@app.get("/auth/me")
@app.get("/api/auth/me")
def get_current_admin_info(admin: AdminUser = Depends(get_current_admin)):
    return {"username": admin.username, "authenticated": True}


@app.put("/auth/password")
@app.put("/api/auth/password")
def change_admin_password(
    data: PasswordChange,
    admin: AdminUser = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    if not verify_password(data.current_password, admin.password_hash):
        raise HTTPException(status_code=400, detail="Current password incorrect")
    if len(data.new_password) < 6:
        raise HTTPException(status_code=400, detail="New password must be at least 6 characters")
    admin.password_hash = hash_password(data.new_password)
    db.commit()
    return {"status": "success", "message": "Password updated successfully"}


# -----------------------------
# Admin Protected Endpoints
# -----------------------------

@app.put("/admin/profile", response_model=ProfileOut)
@app.put("/api/admin/profile", response_model=ProfileOut)
def update_profile(
    data: ProfileUpdate,
    admin: AdminUser = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    profile = db.query(Profile).first()
    if not profile:
        profile = Profile(**data.model_dump())
        db.add(profile)
    else:
        for key, value in data.model_dump().items():
            setattr(profile, key, value)
    db.commit()
    db.refresh(profile)
    return profile


# Experiences
@app.post("/admin/experiences", response_model=ExperienceOut)
@app.post("/api/admin/experiences", response_model=ExperienceOut)
def create_experience(
    data: ExperienceCreate,
    admin: AdminUser = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    exp = Experience(**data.model_dump())
    db.add(exp)
    db.commit()
    db.refresh(exp)
    return exp


@app.put("/admin/experiences/{exp_id}", response_model=ExperienceOut)
@app.put("/api/admin/experiences/{exp_id}", response_model=ExperienceOut)
def update_experience(
    exp_id: int,
    data: ExperienceUpdate,
    admin: AdminUser = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    exp = db.query(Experience).filter(Experience.id == exp_id).first()
    if not exp:
        raise HTTPException(status_code=404, detail="Experience not found")
    for key, value in data.model_dump().items():
        setattr(exp, key, value)
    db.commit()
    db.refresh(exp)
    return exp


@app.delete("/admin/experiences/{exp_id}")
@app.delete("/api/admin/experiences/{exp_id}")
def delete_experience(
    exp_id: int,
    admin: AdminUser = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    exp = db.query(Experience).filter(Experience.id == exp_id).first()
    if not exp:
        raise HTTPException(status_code=404, detail="Experience not found")
    db.delete(exp)
    db.commit()
    return {"status": "success", "message": "Experience deleted"}


# Projects
@app.post("/admin/projects", response_model=ProjectOut)
@app.post("/api/admin/projects", response_model=ProjectOut)
def create_project(
    data: ProjectCreate,
    admin: AdminUser = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    proj = Project(**data.model_dump())
    db.add(proj)
    db.commit()
    db.refresh(proj)
    return proj


@app.put("/admin/projects/{proj_id}", response_model=ProjectOut)
@app.put("/api/admin/projects/{proj_id}", response_model=ProjectOut)
def update_project(
    proj_id: int,
    data: ProjectUpdate,
    admin: AdminUser = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    proj = db.query(Project).filter(Project.id == proj_id).first()
    if not proj:
        raise HTTPException(status_code=404, detail="Project not found")
    for key, value in data.model_dump().items():
        setattr(proj, key, value)
    db.commit()
    db.refresh(proj)
    return proj


@app.delete("/admin/projects/{proj_id}")
@app.delete("/api/admin/projects/{proj_id}")
def delete_project(
    proj_id: int,
    admin: AdminUser = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    proj = db.query(Project).filter(Project.id == proj_id).first()
    if not proj:
        raise HTTPException(status_code=404, detail="Project not found")
    db.delete(proj)
    db.commit()
    return {"status": "success", "message": "Project deleted"}


# Skills
@app.post("/admin/skills", response_model=SkillOut)
@app.post("/api/admin/skills", response_model=SkillOut)
def create_skill(
    data: SkillCreate,
    admin: AdminUser = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    skill = Skill(**data.model_dump())
    db.add(skill)
    db.commit()
    db.refresh(skill)
    return skill


@app.put("/admin/skills/{skill_id}", response_model=SkillOut)
@app.put("/api/admin/skills/{skill_id}", response_model=SkillOut)
def update_skill(
    skill_id: int,
    data: SkillUpdate,
    admin: AdminUser = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    skill = db.query(Skill).filter(Skill.id == skill_id).first()
    if not skill:
        raise HTTPException(status_code=404, detail="Skill not found")
    for key, value in data.model_dump().items():
        setattr(skill, key, value)
    db.commit()
    db.refresh(skill)
    return skill


@app.delete("/admin/skills/{skill_id}")
@app.delete("/api/admin/skills/{skill_id}")
def delete_skill(
    skill_id: int,
    admin: AdminUser = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    skill = db.query(Skill).filter(Skill.id == skill_id).first()
    if not skill:
        raise HTTPException(status_code=404, detail="Skill not found")
    db.delete(skill)
    db.commit()
    return {"status": "success", "message": "Skill deleted"}


# Education
@app.put("/admin/education/{edu_id}", response_model=EducationOut)
@app.put("/api/admin/education/{edu_id}", response_model=EducationOut)
def update_education(
    edu_id: int,
    data: EducationUpdate,
    admin: AdminUser = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    edu = db.query(Education).filter(Education.id == edu_id).first()
    if not edu:
        raise HTTPException(status_code=404, detail="Education record not found")
    for key, value in data.model_dump().items():
        setattr(edu, key, value)
    db.commit()
    db.refresh(edu)
    return edu


# Awards
@app.post("/admin/awards", response_model=AwardOut)
@app.post("/api/admin/awards", response_model=AwardOut)
def create_award(
    data: AwardCreate,
    admin: AdminUser = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    award = Award(**data.model_dump())
    db.add(award)
    db.commit()
    db.refresh(award)
    return award


@app.put("/admin/awards/{award_id}", response_model=AwardOut)
@app.put("/api/admin/awards/{award_id}", response_model=AwardOut)
def update_award(
    award_id: int,
    data: AwardUpdate,
    admin: AdminUser = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    award = db.query(Award).filter(Award.id == award_id).first()
    if not award:
        raise HTTPException(status_code=404, detail="Award not found")
    for key, value in data.model_dump().items():
        setattr(award, key, value)
    db.commit()
    db.refresh(award)
    return award


@app.delete("/admin/awards/{award_id}")
@app.delete("/api/admin/awards/{award_id}")
def delete_award(
    award_id: int,
    admin: AdminUser = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    award = db.query(Award).filter(Award.id == award_id).first()
    if not award:
        raise HTTPException(status_code=404, detail="Award not found")
    db.delete(award)
    db.commit()
    return {"status": "success", "message": "Award deleted"}


# Certifications
@app.post("/admin/certifications", response_model=CertificationOut)
@app.post("/api/admin/certifications", response_model=CertificationOut)
def create_certification(
    data: CertificationCreate,
    admin: AdminUser = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    cert = Certification(**data.model_dump())
    db.add(cert)
    db.commit()
    db.refresh(cert)
    return cert


@app.put("/admin/certifications/{cert_id}", response_model=CertificationOut)
@app.put("/api/admin/certifications/{cert_id}", response_model=CertificationOut)
def update_certification(
    cert_id: int,
    data: CertificationUpdate,
    admin: AdminUser = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    cert = db.query(Certification).filter(Certification.id == cert_id).first()
    if not cert:
        raise HTTPException(status_code=404, detail="Certification not found")
    for key, value in data.model_dump().items():
        setattr(cert, key, value)
    db.commit()
    db.refresh(cert)
    return cert


@app.delete("/admin/certifications/{cert_id}")
@app.delete("/api/admin/certifications/{cert_id}")
def delete_certification(
    cert_id: int,
    admin: AdminUser = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    cert = db.query(Certification).filter(Certification.id == cert_id).first()
    if not cert:
        raise HTTPException(status_code=404, detail="Certification not found")
    db.delete(cert)
    db.commit()
    return {"status": "success", "message": "Certification deleted"}


# Contact Messages
@app.get("/admin/messages", response_model=List[ContactMessageOut])
@app.get("/api/admin/messages", response_model=List[ContactMessageOut])
def get_contact_messages(
    admin: AdminUser = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    return db.query(ContactMessage).order_by(ContactMessage.created_at.desc()).all()


@app.put("/admin/messages/{msg_id}/read")
@app.put("/api/admin/messages/{msg_id}/read")
def mark_message_read(
    msg_id: int,
    admin: AdminUser = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    msg = db.query(ContactMessage).filter(ContactMessage.id == msg_id).first()
    if not msg:
        raise HTTPException(status_code=404, detail="Message not found")
    msg.is_read = True
    db.commit()
    return {"status": "success", "message": "Marked as read"}


@app.delete("/admin/messages/{msg_id}")
@app.delete("/api/admin/messages/{msg_id}")
def delete_contact_message(
    msg_id: int,
    admin: AdminUser = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    msg = db.query(ContactMessage).filter(ContactMessage.id == msg_id).first()
    if not msg:
        raise HTTPException(status_code=404, detail="Message not found")
    db.delete(msg)
    db.commit()
    return {"status": "success", "message": "Message deleted"}


# Reset to Resume Defaults
@app.post("/admin/reset-defaults")
@app.post("/api/admin/reset-defaults")
def reset_to_defaults(
    admin: AdminUser = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    seed_database(db, force=True)
    return {"status": "success", "message": "Database successfully reset to resume defaults"}


# -----------------------------
# Blog Endpoints
# -----------------------------

@app.get("/posts", response_model=List[BlogPostOut])
@app.get("/api/posts", response_model=List[BlogPostOut])
def get_published_posts(db: Session = Depends(get_db)):
    return db.query(BlogPost).filter(BlogPost.is_published == True).order_by(BlogPost.created_at.desc()).all()


@app.get("/posts/{slug}", response_model=BlogPostOut)
@app.get("/api/posts/{slug}", response_model=BlogPostOut)
def get_post_by_slug(slug: str, db: Session = Depends(get_db)):
    post = db.query(BlogPost).filter(BlogPost.slug == slug, BlogPost.is_published == True).first()
    if not post:
        raise HTTPException(status_code=404, detail="Blog post not found")
    return post


@app.get("/admin/posts", response_model=List[BlogPostOut])
@app.get("/api/admin/posts", response_model=List[BlogPostOut])
def get_all_posts_admin(admin: AdminUser = Depends(get_current_admin), db: Session = Depends(get_db)):
    return db.query(BlogPost).order_by(BlogPost.created_at.desc()).all()


@app.post("/admin/posts", response_model=BlogPostOut)
@app.post("/api/admin/posts", response_model=BlogPostOut)
def create_blog_post(
    data: BlogPostCreate,
    admin: AdminUser = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    # Check slug uniqueness
    existing = db.query(BlogPost).filter(BlogPost.slug == data.slug).first()
    if existing:
        raise HTTPException(status_code=400, detail="A post with this URL slug already exists")
    post = BlogPost(**data.model_dump())
    db.add(post)
    db.commit()
    db.refresh(post)
    return post


@app.put("/admin/posts/{post_id}", response_model=BlogPostOut)
@app.put("/api/admin/posts/{post_id}", response_model=BlogPostOut)
def update_blog_post(
    post_id: int,
    data: BlogPostUpdate,
    admin: AdminUser = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    post = db.query(BlogPost).filter(BlogPost.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Blog post not found")
    
    update_dict = data.model_dump(exclude_unset=True)
    if "slug" in update_dict and update_dict["slug"] != post.slug:
        existing = db.query(BlogPost).filter(BlogPost.slug == update_dict["slug"]).first()
        if existing:
            raise HTTPException(status_code=400, detail="Slug already in use by another post")
            
    for k, v in update_dict.items():
        setattr(post, k, v)
    db.commit()
    db.refresh(post)
    return post


@app.delete("/admin/posts/{post_id}")
@app.delete("/api/admin/posts/{post_id}")
def delete_blog_post(
    post_id: int,
    admin: AdminUser = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    post = db.query(BlogPost).filter(BlogPost.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Blog post not found")
    db.delete(post)
    db.commit()
    return {"status": "success", "message": "Blog post deleted"}


# -----------------------------
# Resume JSON Import Endpoint
# -----------------------------

@app.post("/admin/import-resume")
@app.post("/api/admin/import-resume")
def import_resume_json(
    payload: dict,
    admin: AdminUser = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """
    Imports and maps reactive resume / JSON export data directly into SQLite models.
    Wipes existing resume records and populates cleanly.
    """
    populate_from_resume_payload(db, payload)
    invalidate_agent_prompt_cache()
    return {"status": "success", "message": "Resume JSON successfully imported and database updated!"}


# -----------------------------
# Dynamic AI Agent System Prompt
# -----------------------------

def build_dynamic_agent_prompt(db: Session, custom_data: Optional[dict] = None) -> str:
    # If custom_data is provided and has profile:
    if custom_data and isinstance(custom_data, dict) and custom_data.get("profile"):
        prof = custom_data.get("profile", {})
        name = prof.get("name") or "the developer"
        title = prof.get("title") or "Full Stack Developer & Data Engineer"
        summary = prof.get("summary") or ""
        location = prof.get("location") or ""
        email = prof.get("email") or ""
        phone = prof.get("phone") or ""
        linkedin = prof.get("linkedin_url") or ""
        github = prof.get("github_url") or ""

        exps = custom_data.get("experiences", [])
        exp_bullets = []
        for e in exps:
            r = e.get("role", "")
            c = e.get("company", "")
            s = e.get("start_date", "")
            end = e.get("end_date") or "Present"
            desc = e.get("description", "")
            sk = e.get("skills_text", "")
            b = f"- {r} at {c} ({s} – {end}): {desc}"
            if sk:
                b += f" [Skills: {sk}]"
            exp_bullets.append(b)

        skills = custom_data.get("skills", [])
        skill_names = ", ".join([s.get("name", "") for s in skills[:25] if s.get("name")])
        awards = custom_data.get("awards", [])
        award_names = ", ".join([a.get("title", "") for a in awards if a.get("title")])
        certs = custom_data.get("certifications", [])
        cert_names = ", ".join([c.get("name", "") for c in certs if c.get("name")])

        first_company = exps[0].get("company") if exps else "their company"
        prompt = f"""You are the personal AI Assistant and professional representative for {name} ({title}) on this portfolio website.
Your mission is to represent {name} accurately, engagingly, and professionally to engineering recruiters, hiring managers, and clients.

Profile Overview:
- Name: {name}
- Headline / Role: {title}
- Location: {location}
- Contact Email: {email}
- Contact Phone: {phone}
- LinkedIn: {linkedin}
- GitHub: {github}
- Summary: {summary}

Professional Experience:
{chr(10).join(exp_bullets) if exp_bullets else '- Experienced software and data engineer.'}

Technical Skills:
{skill_names if skill_names else 'Full Stack, Cloud, Data Engineering'}

Certifications & Awards:
- Certifications: {cert_names if cert_names else 'None listed'}
- Awards: {award_names if award_names else 'None listed'}

Guidelines:
- Speak in the third person about {name} ("{name} has deep expertise in...", "At {first_company}, {name} built...").
- Keep replies concise, articulate, and technical (2-4 sentences or short bullet points).
- Respond directly to the user's question without any introductory reasoning, thinking notes, or drafts.
- If recruiters ask about hiring, invite them to leave a message via the contact form or email {email}.
- Base your answers strictly on the profile details above.
"""
        return prompt.strip()

    profile = db.query(Profile).first()
    name = profile.name if profile and profile.name else "the developer"
    title = profile.title if profile and profile.title else "Full Stack Developer & Data Engineer"
    summary = profile.summary if profile and profile.summary else ""
    location = profile.location if profile and profile.location else ""
    email = profile.email if profile and profile.email else ""
    phone = profile.phone if profile and profile.phone else ""
    linkedin = profile.linkedin_url if profile and profile.linkedin_url else ""
    github = profile.github_url if profile and profile.github_url else ""

    exps = db.query(Experience).order_by(Experience.display_order.asc()).all()
    exp_bullets = []
    for e in exps:
        bullet = f"- {e.role} at {e.company} ({e.start_date} – {e.end_date or 'Present'}): {e.description or ''}"
        if e.skills_text:
            bullet += f" [Skills: {e.skills_text}]"
        exp_bullets.append(bullet)

    skills = db.query(Skill).order_by(Skill.display_order.asc()).all()
    skill_names = ", ".join([s.name for s in skills[:25]])

    awards = db.query(Award).all()
    award_names = ", ".join([a.title for a in awards])

    certs = db.query(Certification).all()
    cert_names = ", ".join([c.name for c in certs])

    prompt = f"""You are the personal AI Assistant and professional representative for {name} ({title}) on this portfolio website.
Your mission is to represent {name} accurately, engagingly, and professionally to engineering recruiters, hiring managers, and clients.

Profile Overview:
- Name: {name}
- Headline / Role: {title}
- Location: {location}
- Contact Email: {email}
- Contact Phone: {phone}
- LinkedIn: {linkedin}
- GitHub: {github}
- Summary: {summary}

Professional Experience:
{chr(10).join(exp_bullets) if exp_bullets else '- Experienced software and data engineer.'}

Technical Skills:
{skill_names if skill_names else 'Full Stack, Cloud, Data Engineering'}

Certifications & Awards:
- Certifications: {cert_names if cert_names else 'None listed'}
- Awards: {award_names if award_names else 'None listed'}

Guidelines:
- Speak in the third person about {name} ("{name} has deep expertise in...", "At {exps[0].company if exps else 'their company'}, {name} built...").
- Keep replies concise, articulate, and technical (2-4 sentences or short bullet points).
- Respond directly to the user's question without any introductory reasoning, thinking notes, or drafts.
- If recruiters ask about hiring, invite them to leave a message via the contact form or email {email}.
- Base your answers strictly on the profile details above.
"""
    return prompt.strip()


# -----------------------------
# AI Agent Endpoint (Optimized for Sub-Second Latency)
# -----------------------------

import os
import time
import httpx
from pydantic import BaseModel

class ChatRequest(BaseModel):
    message: str
    portfolio_data: Optional[Dict[str, Any]] = None

# In-memory prompt cache to eliminate redundant DB queries on every turn
_cached_prompt: Optional[str] = None
_cached_prompt_time: float = 0.0

def invalidate_agent_prompt_cache():
    global _cached_prompt, _cached_prompt_time
    _cached_prompt = None
    _cached_prompt_time = 0.0

def get_or_build_agent_prompt(db: Session, custom_data: Optional[Dict[str, Any]] = None) -> str:
    global _cached_prompt, _cached_prompt_time
    if custom_data and isinstance(custom_data, dict) and custom_data.get("profile"):
        return build_dynamic_agent_prompt(db, custom_data=custom_data)
    
    now = time.time()
    if _cached_prompt and (now - _cached_prompt_time < 300):
        return _cached_prompt
    
    _cached_prompt = build_dynamic_agent_prompt(db, custom_data=None)
    _cached_prompt_time = now
    return _cached_prompt


# Persistent client to reuse TLS connection across serverless warm invocations
_gemini_client: Optional[httpx.AsyncClient] = None

def get_gemini_client() -> httpx.AsyncClient:
    global _gemini_client
    if _gemini_client is None or _gemini_client.is_closed:
        _gemini_client = httpx.AsyncClient(
            timeout=10.0,
            limits=httpx.Limits(max_keepalive_connections=5, max_connections=10),
        )
    return _gemini_client


# Preferred ultra-fast production models in priority order.
# Mapped directly to available models for sub-second conversational latency.
PREFERRED_FAST_MODELS = [
    "gemini-2.5-flash-lite",
    "gemini-flash-lite-latest",
    "gemini-2.5-flash",
    "gemini-flash-latest",
    "gemini-3.8-flash",
    "gemini-3.5-flash-lite",
    "gemini-3.5-flash",
]


@app.get("/models")
@app.get("/api/models")
async def list_available_gemini_models():
    raw_key = os.getenv("GEMINI_API_KEY", "")
    api_key = raw_key.strip().strip('"').strip("'").strip()
    if not api_key:
        return {"error": "GEMINI_API_KEY not configured"}
    
    headers = {"x-goog-api-key": api_key}
    list_url = f"https://generativelanguage.googleapis.com/v1beta/models?key={api_key}"
    async with httpx.AsyncClient(timeout=10.0) as client:
        try:
            resp = await client.get(list_url, headers=headers)
            if resp.status_code == 200:
                data = resp.json()
                models = [m.get("name") for m in data.get("models", []) if "generateContent" in m.get("supportedGenerationMethods", [])]
                return {"status_code": 200, "models": models}
            return {"status_code": resp.status_code, "error": resp.text}
        except Exception as e:
            return {"error": str(e)}


@app.get("/test-models")
@app.get("/api/test-models")
async def test_candidate_models():
    raw_key = os.getenv("GEMINI_API_KEY", "")
    api_key = raw_key.strip().strip('"').strip("'").strip()
    headers = {"x-goog-api-key": api_key, "Content-Type": "application/json"}
    payload = {"contents": [{"role": "user", "parts": [{"text": "Say hi in one word"}]}]}
    results = {}
    async with httpx.AsyncClient(timeout=8.0) as client:
        for m in PREFERRED_FAST_MODELS:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/{m}:generateContent?key={api_key}"
            try:
                t0 = time.time()
                resp = await client.post(url, json=payload, headers=headers)
                results[m] = {
                    "status_code": resp.status_code,
                    "elapsed": round(time.time() - t0, 2),
                    "body": resp.json() if resp.status_code == 200 else resp.text[:200]
                }
            except Exception as e:
                results[m] = {"error": str(e)}
    return results


@app.post("/chat")
@app.post("/api/chat")
async def chat_with_harsha_agent(req: ChatRequest, db: Session = Depends(get_db)):
    t_start = time.time()
    raw_key = os.getenv("GEMINI_API_KEY", "")
    api_key = raw_key.strip().strip('"').strip("'").strip()
    if not api_key:
        return {
            "reply": "Hello! I am Harsha's AI Agent. To activate live responses, add the GEMINI_API_KEY environment variable in your Vercel Project Settings."
        }

    headers = {
        "x-goog-api-key": api_key,
        "Content-Type": "application/json"
    }

    system_prompt = get_or_build_agent_prompt(db, custom_data=req.portfolio_data)

    payload = {
        "system_instruction": {
            "parts": [{"text": system_prompt}]
        },
        "contents": [
            {"role": "user", "parts": [{"text": req.message}]}
        ],
        "generationConfig": {
            "temperature": 0.3,
            "maxOutputTokens": 350,
        }
    }

    client = get_gemini_client()
    last_error = ""

    # Strategy 1: Try ultra-fast production models directly (no ListModels overhead)
    for model_name in PREFERRED_FAST_MODELS:
        gen_url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={api_key}"
        try:
            gen_resp = await client.post(gen_url, json=payload, headers=headers)
            if gen_resp.status_code == 200:
                data = gen_resp.json()
                candidates = data.get("candidates", [])
                if candidates and "content" in candidates[0]:
                    text = candidates[0]["content"]["parts"][0]["text"]
                    elapsed = round(time.time() - t_start, 2)
                    return {"reply": text, "model": model_name, "latency_s": elapsed}
                return {"reply": "Received empty response from Gemini."}

            try:
                err_msg = gen_resp.json().get("error", {}).get("message", gen_resp.text)
            except Exception:
                err_msg = gen_resp.text
            last_error = f"{model_name}: {err_msg}"
        except Exception as e:
            last_error = f"{model_name}: {str(e)}"
            continue

    # Strategy 2: If none of the preferred models worked, fallback to ListModels
    try:
        list_url = f"https://generativelanguage.googleapis.com/v1beta/models?key={api_key}"
        list_resp = await client.get(list_url, headers=headers)
        if list_resp.status_code == 200:
            models_data = list_resp.json().get("models", [])
            valid_models = [
                m["name"] for m in models_data 
                if "generateContent" in m.get("supportedGenerationMethods", [])
                and "thinking" not in m.get("name", "").lower()
                and not m.get("name", "").startswith("models/gemma")
                and not any(tag in m.get("name", "").lower() for tag in ["tts", "image", "transcribe", "robotics", "clip", "audio", "banana"])
            ]
            def _sort_key(m_name: str) -> int:
                nl = m_name.lower()
                if "flash-lite" in nl:
                    return 0
                if "flash" in nl:
                    return 1
                return 2

            valid_models.sort(key=_sort_key)
            for model_path in valid_models:
                clean_path = model_path if model_path.startswith("models/") else f"models/{model_path}"
                gen_url = f"https://generativelanguage.googleapis.com/v1beta/{clean_path}:generateContent?key={api_key}"
                try:
                    gen_resp = await client.post(gen_url, json=payload, headers=headers)
                    if gen_resp.status_code == 200:
                        data = gen_resp.json()
                        candidates = data.get("candidates", [])
                        if candidates and "content" in candidates[0]:
                            text = candidates[0]["content"]["parts"][0]["text"]
                            elapsed = round(time.time() - t_start, 2)
                            return {"reply": text, "model": clean_path, "latency_s": elapsed}
                except Exception:
                    continue
    except Exception as e:
        last_error = str(e)

    return {"reply": f"Could not generate reply ({last_error})."}
