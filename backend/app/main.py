from contextlib import asynccontextmanager
from typing import List

from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from .auth import (
    create_access_token,
    get_current_admin,
    hash_password,
    verify_password,
)
from .database import Base, engine, get_db
from .models import (
    AdminUser,
    Award,
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
)
from .seed import seed_database


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: create tables and seed default data
    Base.metadata.create_all(bind=engine)
    db = next(get_db())
    try:
        seed_database(db)
    finally:
        db.close()
    yield


app = FastAPI(
    title="Harsha Vardhan Reddi - Portfolio API",
    description="FastAPI + SQLite backend for personal portfolio and content management.",
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


# -----------------------------
# Public Endpoints
# -----------------------------

@app.get("/")
def root():
    return {
        "status": "healthy",
        "app": "Harsha Vardhan Reddi Portfolio API",
        "database": "SQLite (portfolio.db)",
    }


@app.get("/health")
@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "app": "Harsha Vardhan Reddi Portfolio API",
        "database": "SQLite (portfolio.db)",
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

    return PortfolioFullData(
        profile=profile,
        experiences=experiences,
        projects=projects,
        skills=skills,
        education=education,
        awards=awards,
        certifications=certifications,
    )


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


@app.get("/api/auth/me")
def get_current_admin_info(admin: AdminUser = Depends(get_current_admin)):
    return {"username": admin.username, "authenticated": True}


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
@app.get("/api/admin/messages", response_model=List[ContactMessageOut])
def get_contact_messages(
    admin: AdminUser = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    return db.query(ContactMessage).order_by(ContactMessage.created_at.desc()).all()


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
@app.post("/api/admin/reset-defaults")
def reset_to_defaults(
    admin: AdminUser = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    seed_database(db, force=True)
    return {"status": "success", "message": "Database successfully reset to resume defaults"}
