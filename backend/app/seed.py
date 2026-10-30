import json
import os
from sqlalchemy.orm import Session
from .auth import hash_password
from .models import (
    AdminUser,
    Award,
    BlogPost,
    Certification,
    Education,
    Experience,
    Profile,
    Project,
    Skill,
)


def seed_database(db: Session, force: bool = False):
    if not force and db.query(Profile).first():
        return  # Already seeded or has data

    # Seed Admin User
    admin = db.query(AdminUser).filter(AdminUser.username == "admin").first()
    default_pass = os.getenv("DEFAULT_ADMIN_PASSWORD", "admin123")
    if not admin:
        admin = AdminUser(
            username="admin",
            password_hash=hash_password(default_pass),
        )
        db.add(admin)
    elif force:
        admin.password_hash = hash_password(default_pass)

    if force:
        db.query(Profile).delete()
        db.query(Experience).delete()
        db.query(Project).delete()
        db.query(Skill).delete()
        db.query(Education).delete()
        db.query(Award).delete()
        db.query(Certification).delete()
        db.commit()

    # Generic Placeholder Profile (Upload your real resume via Admin > Import Resume JSON)
    profile = Profile(
        name="Developer Portfolio",
        title="Data Engineer & Full Stack Developer",
        email="developer@example.com",
        phone="+1 555-0100",
        location="Global / Remote",
        summary=(
            "Software engineer with extensive experience in architecting scalable applications, "
            "data systems, cloud microservices, and modern web platforms. Proven background in "
            "performance tuning and engineering leadership."
        ),
        years_experience=5,
        linkedin_url="https://linkedin.com",
        github_url="https://github.com",
        hackerrank_url="https://hackerrank.com",
        x_url="https://x.com",
        leetcode_url="https://leetcode.com",
        website_url="",
        resume_download_url="#",
    )
    db.add(profile)

    # Generic Starter Experiences
    experiences = [
        Experience(
            company="Enterprise Cloud Solutions",
            role="Senior Software Engineer",
            location="Remote",
            start_date="2023",
            end_date="Present",
            is_current=True,
            skills_text="Python, FastAPI, Distributed Systems, Cloud Architecture",
            description="Architecting high-throughput microservices and distributed data pipelines.",
            achievements=json.dumps([
                "Modernized enterprise cloud architectures achieving 40% latency reduction.",
                "Designed resilient REST and streaming APIs for mission-critical client workloads.",
                "Mentored engineering teams on CI/CD pipelines, container orchestration, and automated testing."
            ]),
            display_order=1,
        ),
        Experience(
            company="Data Tech Innovations",
            role="Data & Backend Engineer",
            location="Remote",
            start_date="2020",
            end_date="2023",
            is_current=False,
            skills_text="Python, SQL, ETL Pipelines, React JS",
            description="Developed analytical data engines and scalable user interfaces.",
            achievements=json.dumps([
                "Built automated ETL data ingestion pipelines processing millions of daily records.",
                "Developed interactive web dashboards using React JS and FastAPI backend services.",
                "Optimized relational database queries to eliminate bottlenecks during peak traffic."
            ]),
            display_order=2,
        ),
    ]
    db.add_all(experiences)

    # Generic Starter Skills
    skills = [
        Skill(name="Python", category="Languages & Backend", proficiency="Expert", display_order=1),
        Skill(name="FastAPI", category="Languages & Backend", proficiency="Expert", display_order=2),
        Skill(name="Django REST", category="Languages & Backend", proficiency="Advanced", display_order=3),
        Skill(name="SQL & PostgreSQL", category="Databases", proficiency="Expert", display_order=4),
        Skill(name="React JS", category="Frontend", proficiency="Advanced", display_order=5),
        Skill(name="Docker & Containers", category="DevOps & Cloud", proficiency="Advanced", display_order=6),
        Skill(name="Cloud Services (Azure/AWS)", category="DevOps & Cloud", proficiency="Advanced", display_order=7),
    ]
    db.add_all(skills)

    # Generic Starter Projects
    projects = [
        Project(
            title="Real-Time Data Streaming Engine",
            subtitle="High-Throughput Analytics Service",
            description="Distributed ingestion pipeline supporting real-time event aggregation and analytical processing.",
            tech_stack="Python, FastAPI, Redis, Docker",
            github_url="https://github.com",
            live_url="",
            highlights=json.dumps([
                "Sub-50ms ingestion latency for distributed telemetry.",
                "Configurable event schemas and automated health monitoring."
            ]),
            featured=True,
            display_order=1,
        ),
        Project(
            title="Full-Stack Management Platform",
            subtitle="Secure Multi-Tenant Dashboard",
            description="Comprehensive administrative platform featuring role-based access control, analytics charts, and dynamic workflows.",
            tech_stack="React JS, Tailwind CSS, FastAPI, SQLite",
            github_url="https://github.com",
            live_url="",
            highlights=json.dumps([
                "JWT authentication and automated audit logging.",
                "Responsive dashboard UI with interactive data tables."
            ]),
            featured=True,
            display_order=2,
        ),
    ]
    db.add_all(projects)

    # Generic Education
    db.add(
        Education(
            institution="University of Technology",
            degree="Bachelor of Science",
            field_of_study="Computer Science",
            grade="First Class with Distinction",
            start_year="2016",
            end_year="2020",
            url="https://example.com",
        )
    )

    # Generic Certifications & Awards
    db.add(
        Certification(
            name="Cloud Solutions Architect",
            issuer="Cloud Platform",
            issue_date="2023",
            credential_url="",
            display_order=1,
        )
    )

    db.add(
        Award(
            title="Engineering Excellence Award",
            organization="Tech Organization",
            year="2023",
            description="Recognized for exceptional technical leadership and system optimization.",
            display_order=1,
        )
    )

    # Starter Welcome Blog Post
    if not db.query(BlogPost).first():
        db.add(
            BlogPost(
                title="Welcome to My Portfolio & Tech Blog",
                slug="welcome-to-my-portfolio-tech-blog",
                excerpt="An introduction to my engineering portfolio, architecture philosophies, and tech journeys.",
                content=(
                    "### Welcome!\n\n"
                    "This platform serves as my engineering portfolio and personal knowledge base.\n\n"
                    "#### What I Cover:\n"
                    "- **Data Engineering:** Designing high-throughput, fault-tolerant pipelines.\n"
                    "- **Full Stack Development:** Modern microservices with Python, FastAPI, and React.\n"
                    "- **Cloud Architecture:** Scalable deployments, CI/CD automation, and observability.\n\n"
                    "Stay tuned for deep-dives, architectural blueprints, and engineering tutorials!"
                ),
                tags="Engineering, Introduction, Cloud",
                is_published=True,
            )
        )

    db.commit()
