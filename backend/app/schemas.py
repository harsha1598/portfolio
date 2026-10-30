from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, EmailStr


class ProfileBase(BaseModel):
    name: str
    title: str
    email: str
    phone: Optional[str] = None
    location: Optional[str] = None
    summary: Optional[str] = None
    years_experience: Optional[int] = 6
    linkedin_url: Optional[str] = None
    github_url: Optional[str] = None
    hackerrank_url: Optional[str] = None
    x_url: Optional[str] = None
    leetcode_url: Optional[str] = None
    website_url: Optional[str] = None
    resume_download_url: Optional[str] = None


class ProfileUpdate(ProfileBase):
    pass


class ProfileOut(ProfileBase):
    id: int
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class ExperienceBase(BaseModel):
    company: str
    role: str
    location: Optional[str] = None
    start_date: str
    end_date: Optional[str] = None
    is_current: bool = False
    skills_text: Optional[str] = None
    description: Optional[str] = None
    achievements: Optional[str] = None  # JSON string or newline-separated
    display_order: int = 0


class ExperienceCreate(ExperienceBase):
    pass


class ExperienceUpdate(ExperienceBase):
    pass


class ExperienceOut(ExperienceBase):
    id: int

    class Config:
        from_attributes = True


class ProjectBase(BaseModel):
    title: str
    subtitle: Optional[str] = None
    description: str
    tech_stack: Optional[str] = None
    github_url: Optional[str] = None
    live_url: Optional[str] = None
    highlights: Optional[str] = None
    featured: bool = True
    display_order: int = 0


class ProjectCreate(ProjectBase):
    pass


class ProjectUpdate(ProjectBase):
    pass


class ProjectOut(ProjectBase):
    id: int

    class Config:
        from_attributes = True


class SkillBase(BaseModel):
    name: str
    category: str
    proficiency: Optional[str] = "Proficient"
    display_order: int = 0


class SkillCreate(SkillBase):
    pass


class SkillUpdate(SkillBase):
    pass


class SkillOut(SkillBase):
    id: int

    class Config:
        from_attributes = True


class EducationBase(BaseModel):
    institution: str
    degree: str
    field_of_study: Optional[str] = None
    grade: Optional[str] = None
    start_year: Optional[str] = None
    end_year: Optional[str] = None
    url: Optional[str] = None


class EducationCreate(EducationBase):
    pass


class EducationUpdate(EducationBase):
    pass


class EducationOut(EducationBase):
    id: int

    class Config:
        from_attributes = True


class AwardBase(BaseModel):
    title: str
    organization: str
    year: Optional[str] = None
    description: Optional[str] = None
    display_order: int = 0


class AwardCreate(AwardBase):
    pass


class AwardUpdate(AwardBase):
    pass


class AwardOut(AwardBase):
    id: int

    class Config:
        from_attributes = True


class CertificationBase(BaseModel):
    name: str
    issuer: str
    issue_date: Optional[str] = None
    credential_url: Optional[str] = None
    display_order: int = 0


class CertificationCreate(CertificationBase):
    pass


class CertificationUpdate(CertificationBase):
    pass


class CertificationOut(CertificationBase):
    id: int

    class Config:
        from_attributes = True


class ContactMessageCreate(BaseModel):
    name: str
    email: str
    subject: Optional[str] = None
    message: str


class ContactMessageOut(ContactMessageCreate):
    id: int
    created_at: datetime
    is_read: bool

    class Config:
        from_attributes = True


class PortfolioFullData(BaseModel):
    profile: Optional[ProfileOut] = None
    experiences: List[ExperienceOut] = []
    projects: List[ProjectOut] = []
    skills: List[SkillOut] = []
    education: List[EducationOut] = []
    awards: List[AwardOut] = []
    certifications: List[CertificationOut] = []


class AdminLogin(BaseModel):
    username: str
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    username: str


class PasswordChange(BaseModel):
    current_password: str
    new_password: str
