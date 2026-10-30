import json
import os
from sqlalchemy.orm import Session
from .auth import hash_password
from .models import (
    AdminUser,
    Award,
    Certification,
    Education,
    Experience,
    Profile,
    Project,
    Skill,
)


def seed_database(db: Session, force: bool = False):
    if not force and db.query(Profile).first():
        return  # Already seeded

    # Seed Admin User
    admin = db.query(AdminUser).filter(AdminUser.username == "admin").first()
    default_pass = os.getenv("DEFAULT_ADMIN_PASSWORD", "harsha123")
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

    # Profile
    profile = Profile(
        name="Harsha Vardhan Reddi",
        title="Data Engineer & Full Stack Developer",
        email="harshareddy1598@gmail.com",
        phone="+91 6303661465",
        location="Hyderabad, India (Vizianagaram, AP)",
        summary=(
            "Software Developer with 6 years of experience in building scalable applications using "
            "Python, Django REST, Angular, React JS, and Microservices with proven team leadership "
            "and backend optimization skills. Self-starter and motivated towards analyzing, fixing, "
            "and scaling applications effectively across Azure Cloud and modern data platforms."
        ),
        years_experience=6,
        linkedin_url="https://www.linkedin.com/in/harsha-vardhan-reddi",
        github_url="https://github.com/harsha1598",
        hackerrank_url="https://www.hackerrank.com/harshareddy1598",
        x_url="https://x.com/Harshav78",
        leetcode_url="https://leetcode.com/u/harsha1598/",
        website_url="https://github.com/harsha1598/portfolio",
        resume_download_url="#",
    )
    db.add(profile)

    # Experiences
    experiences = [
        Experience(
            company="Deloitte USI",
            role="Software Engineer 2",
            location="Hyderabad",
            start_date="Feb 2026",
            end_date="Present",
            is_current=True,
            skills_text="Python, Microservices, Cloud Architecture, Full Stack",
            description="Leading software engineering initiatives and modernizing backend systems for high-throughput enterprise platforms.",
            achievements=json.dumps([
                "Spearheading enterprise application engineering and microservices modernization.",
                "Designing resilient backend services with high performance, scalability, and automated testing.",
                "Collaborating across cross-functional distributed teams to deliver mission-critical software solutions."
            ]),
            display_order=1,
        ),
        Experience(
            company="PwC AC India",
            role="Data Engineer - Senior Associate",
            location="Hyderabad",
            start_date="Jul 2023",
            end_date="Feb 2026",
            is_current=False,
            skills_text="Python, Django REST, PySpark, Angular, SQL, Azure Synapse, Azure Cloud, Azure DevOps, Azure Pipelines",
            description="Architected ETL pipelines on Azure Synapse and modernized Django microservices.",
            achievements=json.dumps([
                "Hands-on experience developing Microservices with Python, Django REST, and Angular UI.",
                "Built resilient ETL Data Systems on Azure Synapse & Databricks for multi-source extraction, transformation, and high-volume loading.",
                "Modernized legacy Django monolithic applications into decoupled Django REST APIs and modern Angular frontend.",
                "Led the cloud migration of application infrastructure from Kubernetes-based CaaS clusters to Azure App Service.",
                "Developed automated, scheduled backend jobs performing critical cross-system operations via Python and Azure Pipelines.",
                "Conducted rigorous code reviews, SQL query optimization, and backend performance tuning achieving reduced API latency and low error rates."
            ]),
            display_order=2,
        ),
        Experience(
            company="Tata Consultancy Services",
            role="Data Engineer & Full Stack Developer",
            location="Hyderabad",
            start_date="Nov 2020",
            end_date="Jun 2023",
            is_current=False,
            skills_text="Python, Django, React JS, Angular, FastAPI, Flask, SQL, Azure Cloud, Docker, Kubernetes, Jenkins",
            description="Developed full-stack web applications and REST APIs integrating relational and unstructured data sources.",
            achievements=json.dumps([
                "Engineered robust RESTful APIs using Python (FastAPI, Flask, Django REST) and Node JS, integrating heterogeneous RDBMS, Excel, and text sources.",
                "Developed performance-driven, user-centric, and fault-tolerant full-stack applications fulfilling business-critical workflows.",
                "Troubleshooted production bugs and optimized application architecture for high availability and reliability.",
                "Established CI/CD deployment pipelines using Jenkins, Azure Pipelines, Docker containerization, and Kubernetes orchestration.",
                "Engaged actively with business stakeholders to extract requirements and deliver tailored data solutions."
            ]),
            display_order=3,
        ),
        Experience(
            company="Tata Consultancy Services - BFSI Garage",
            role="Data Science Intern",
            location="Chennai",
            start_date="Dec 2019",
            end_date="Apr 2020",
            is_current=False,
            skills_text="Java, Neural Networks, Spring Boot, Node JS, React JS, MongoDB, Machine Learning",
            description="Researched and deployed machine learning models and developed credit risk applications.",
            achievements=json.dumps([
                "Developed and deployed Machine Learning models for real-time financial applications.",
                "Built the SME Marketplace full-stack application for MSME credit risk evaluation using Spring Boot, MongoDB, and React JS."
            ]),
            display_order=4,
        ),
    ]
    for exp in experiences:
        db.add(exp)

    # Projects
    projects = [
        Project(
            title="SME Marketplace",
            subtitle="MSME Credit Risk & Lending Evaluation Platform",
            description="Full-stack financial evaluation application built to assess credit risk profiles for Micro, Small, and Medium Enterprises. Integrates neural network models with a responsive dashboard for real-time loan underwriting.",
            tech_stack="Spring Boot, MongoDB, React JS, Java, Machine Learning",
            github_url="https://github.com/harsha1598",
            live_url="",
            highlights=json.dumps([
                "Real-time ML-powered risk scoring algorithm",
                "Responsive React dashboard with underwriting analytics",
                "Secure REST API backend built on Spring Boot & MongoDB"
            ]),
            featured=True,
            display_order=1,
        ),
        Project(
            title="Aspect Search",
            subtitle="Fine-Grained Contextual Entity & Aspect Extractor",
            description="Advanced search and NLP extraction system designed to parse unstructured text datasets and extract multi-dimensional aspect sentiments, entities, and relationships with high precision.",
            tech_stack="Python, FastAPI, Neural Networks, NLP, React JS",
            github_url="https://github.com/harsha1598",
            live_url="",
            highlights=json.dumps([
                "Deep NLP pipeline extracting aspect-level semantic sentiment",
                "High-speed vector similarity and keyword search",
                "Interactive React exploration interface"
            ]),
            featured=True,
            display_order=2,
        ),
        Project(
            title="Enterprise Cloud ETL Pipeline",
            subtitle="Azure Synapse & Databricks Big Data Engine",
            description="Scalable big data ingestion and transformation platform processing terabyte-scale records with PySpark, scheduled Azure Pipelines, and automated SQL query optimization.",
            tech_stack="PySpark, Azure Synapse, Databricks, Python, SQL, Azure Pipelines",
            github_url="https://github.com/harsha1598",
            live_url="",
            highlights=json.dumps([
                "Automated end-to-end extraction and dimensional modeling",
                "Sub-second API response times with tuned indexing",
                "Zero-downtime scheduled ETL execution"
            ]),
            featured=True,
            display_order=3,
        ),
    ]
    for proj in projects:
        db.add(proj)

    # Skills
    skills_data = [
        # Cloud & Big Data
        ("Azure Synapse", "Cloud & Big Data", "Expert", 1),
        ("PySpark", "Cloud & Big Data", "Expert", 2),
        ("Azure Cloud", "Cloud & Big Data", "Expert", 3),
        ("Databricks", "Cloud & Big Data", "Advanced", 4),
        ("Azure Pipelines", "Cloud & Big Data", "Advanced", 5),
        ("SQL", "Cloud & Big Data", "Expert", 6),
        ("MySQL", "Cloud & Big Data", "Advanced", 7),
        ("MongoDB", "Cloud & Big Data", "Proficient", 8),
        # Backend & Architecture
        ("Python", "Backend & Architecture", "Expert", 1),
        ("FastAPI", "Backend & Architecture", "Expert", 2),
        ("Django REST", "Backend & Architecture", "Expert", 3),
        ("Django", "Backend & Architecture", "Expert", 4),
        ("Flask", "Backend & Architecture", "Advanced", 5),
        ("Java", "Backend & Architecture", "Advanced", 6),
        ("Spring Boot", "Backend & Architecture", "Advanced", 7),
        ("Microservices", "Backend & Architecture", "Expert", 8),
        ("Node JS", "Backend & Architecture", "Proficient", 9),
        # Frontend
        ("React JS", "Frontend Development", "Expert", 1),
        ("Angular", "Frontend Development", "Advanced", 2),
        ("JavaScript", "Frontend Development", "Expert", 3),
        ("HTML5 / CSS3", "Frontend Development", "Expert", 4),
        ("Tailwind CSS", "Frontend Development", "Advanced", 5),
        # DevOps & Engineering Practices
        ("Docker", "DevOps & Tools", "Advanced", 1),
        ("Kubernetes", "DevOps & Tools", "Advanced", 2),
        ("Git & GitHub", "DevOps & Tools", "Expert", 3),
        ("Azure DevOps", "DevOps & Tools", "Expert", 4),
        ("Jenkins", "DevOps & Tools", "Advanced", 5),
        ("CI / CD", "DevOps & Tools", "Expert", 6),
    ]
    for name, cat, prof, order in skills_data:
        db.add(Skill(name=name, category=cat, proficiency=prof, display_order=order))

    # Education
    db.add(Education(
        institution="GMR Institute of Technology",
        degree="Bachelor of Technology",
        field_of_study="Computer Science & Engineering",
        grade="8.9 CGPA",
        start_year="2016",
        end_year="2020",
        url="http://www.gmrit.org/",
    ))

    # Awards
    awards_data = [
        ("PwC Annual Awards 2024", "PwC AC India", "2024", "Recognized for exceptional contribution in enterprise data engineering and pipeline modernization.", 1),
        ("Secured 8th Rank in TCS Codeathon", "Tata Consultancy Services", "2021", "Ranked 8th nationally among thousands of engineering participants in algorithmic coding.", 2),
        ("Smart India Hackathon 2019 Finalist", "Government of India", "2019", "National finalist building innovative technological solutions for governance problems.", 3),
        ("Secured 2nd Place in Hackathon at Stepcone 2019", "GMRIT", "2019", "2nd place honors in the flagship annual national tech symposium hackathon.", 4),
    ]
    for title, org, yr, desc, order in awards_data:
        db.add(Award(title=title, organization=org, year=yr, description=desc, display_order=order))

    # Certifications
    certs_data = [
        ("Microsoft Certified: Azure Fundamentals (AZ-900)", "Microsoft", "2022-03-19", "https://learn.microsoft.com/certifications/azure-fundamentals/", 1),
        ("Microsoft Certified: Azure Data Fundamentals (DP-900)", "Microsoft", "2022-03-23", "https://learn.microsoft.com/certifications/azure-data-fundamentals/", 2),
    ]
    for name, issuer, dt, url, order in certs_data:
        db.add(Certification(name=name, issuer=issuer, issue_date=dt, credential_url=url, display_order=order))

    db.commit()
