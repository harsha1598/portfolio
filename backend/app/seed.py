import base64
import json
import os
import re
from typing import List

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
    AiInsight,
)


def clean_html_tags(text: str) -> str:
    if not text:
        return ""
    clean = text.replace("&nbsp;", " ").replace("&amp;", "&").replace("&lt;", "<").replace("&gt;", ">").replace("&quot;", '"')
    clean = re.sub(r"<[^>]+>", " ", clean)
    return " ".join(clean.split())


def extract_bullets_from_html(html_text: str) -> List[str]:
    if not html_text:
        return []
    items = re.findall(r"<li>(?:<p>)?(.*?)(?:</p>)?</li>", html_text, re.DOTALL | re.IGNORECASE)
    if not items:
        items = re.findall(r"<li>(.*?)</li>", html_text, re.DOTALL | re.IGNORECASE)
    bullets = [clean_html_tags(i) for i in items if clean_html_tags(i)]
    return bullets


def populate_from_resume_payload(db: Session, payload: dict) -> None:
    """
    Parses Reactive Resume / JSON export payload and updates database tables.
    """
    basics = payload.get("basics", {})
    summary_data = payload.get("summary", {})
    summary_content = clean_html_tags(summary_data.get("content", ""))

    # 1. Update / create Profile
    profile = db.query(Profile).first()
    if not profile:
        profile = Profile(name="Portfolio Owner", title="Engineer", email="user@example.com")
        db.add(profile)
        db.flush()

    if basics.get("name"):
        profile.name = basics.get("name")
    if basics.get("headline"):
        profile.title = basics.get("headline")
    if basics.get("email"):
        profile.email = basics.get("email")
    if basics.get("phone"):
        profile.phone = basics.get("phone")
    if basics.get("location"):
        profile.location = basics.get("location")
    if summary_content:
        profile.summary = summary_content

    sections = payload.get("sections", {})

    # Profiles / Social links
    profiles_list = sections.get("profiles", {}).get("items", [])
    for p in profiles_list:
        net = (p.get("network") or "").lower()
        url = (p.get("website", {}) or {}).get("url") or ""
        if "linkedin" in net:
            profile.linkedin_url = url
        elif "github" in net:
            profile.github_url = url.replace("harsha1598", "harsha-reddi1")
        elif "hackerrank" in net:
            profile.hackerrank_url = url
        elif "x" in net or "twitter" in net:
            profile.x_url = url
        elif "leetcode" in net:
            profile.leetcode_url = url

    # Clear previous relational records
    db.query(Experience).delete()
    db.query(Education).delete()
    db.query(Skill).delete()
    db.query(Project).delete()
    db.query(Award).delete()
    db.query(Certification).delete()
    db.flush()

    # 2. Experiences
    exp_items = sections.get("experience", {}).get("items", [])
    for idx, e in enumerate(exp_items):
        raw_desc = e.get("description", "")
        # Extract skills_text with robust regex
        skills_match = re.search(r"Skill\(s\)\s*[-:]\s*(?:</strong>)?(.*?)(?:</strong>)?\s*</p>", raw_desc, re.IGNORECASE | re.DOTALL)
        if not skills_match:
            skills_match = re.search(r"Skill\(s\)\s*[-:]\s*(.*?)(?:</p>|<ul>|<li>|$)", raw_desc, re.IGNORECASE)
        skills_text = clean_html_tags(skills_match.group(1)).rstrip(".") if skills_match else ""

        # Extract bullets from <li> tags
        bullets = extract_bullets_from_html(raw_desc)

        # Extract pure description: remove <p>...Skill(s)...</p> and <ul>...</ul>
        desc_without_skills = re.sub(r"<p>\s*(?:<strong>)?\s*Skill\(s\).*?<\/p>", "", raw_desc, flags=re.IGNORECASE | re.DOTALL)
        desc_without_bullets = re.sub(r"<ul[^>]*>.*?<\/ul>", "", desc_without_skills, flags=re.IGNORECASE | re.DOTALL)
        clean_desc = clean_html_tags(desc_without_bullets).strip()

        period = e.get("period", "")
        period_parts = [p.strip() for p in re.split(r"\s*(?:[\u2013\u2014\-]|\bto\b)\s*", period) if p.strip()] if period else []
        is_current = bool((e.get("dates", {}) or {}).get("present", False) or "present" in period.lower())

        if len(period_parts) >= 2:
            start_date = period_parts[0]
            end_date = "Present" if is_current else period_parts[1]
        elif len(period_parts) == 1:
            start_date = period_parts[0]
            end_date = "Present" if is_current else ""
        else:
            dates = e.get("dates", {}) or {}
            start_date = dates.get("start") or "2020"
            end_date = "Present" if is_current else (dates.get("end") or "")

        company = e.get("company") or "Company"
        role = e.get("position") or "Software Engineer"

        # If clean_desc and bullets are both empty (e.g. newly joined role):
        if not clean_desc and not bullets:
            if is_current:
                if "deloitte" in company.lower():
                    clean_desc = "Architecting full-stack solutions, distributed data pipelines, and GenAI agent platforms for enterprise analytics."
                    bullets = [
                        "Delivered full-stack and GenAI work across APIs, data pipelines, UI and LLM agents for a consumer-spend analytics platform.",
                        "Built over half of the platform’s domain-specialist tool-calling agents, plus a RAG agent over curated documentation and an MCP tool layer.",
                        "Designed grounded LLM generation with server-validated figures, cutting repeat response latency ~45x via hash-based caching.",
                        "Delivered reporting, retail-metrics, and scenario-planning APIs (FastAPI, PostgreSQL, BigQuery) with 97–100% test coverage.",
                        "Built geospatial analytics using HyperLogLog sketches for de-duplicated shopper counts, expanding capacity 10x.",
                        "Optimized PostgreSQL with query-plan-driven indexes, achieving 13x faster query performance.",
                        "Built a generative content pipeline turning anomaly detection into LLM-written articles with automated vision screening.",
                    ]
                    if not skills_text:
                        skills_text = "Python, Typescript, FastAPI, LiteLLM, PostgreSQL, BigQuery, React JS, Gen AI, ArgoCD, KEDA"
                else:
                    clean_desc = f"Software Engineer at {company}, driving scalable backend architectures and cloud data systems."
                    bullets = [
                        f"Driving enterprise software engineering initiatives and system architectures at {company}.",
                        "Collaborating with cross-functional engineering teams to deliver scalable, high-performance services."
                    ]
                    if not skills_text:
                        skills_text = "Python, Cloud Architecture, Big Data, SQL, Microservices"
            else:
                clean_desc = f"Key contributor to software engineering and data solutions at {company}."
                bullets = [clean_desc]
        elif not clean_desc and bullets:
            clean_desc = ""

        exp = Experience(
            company=company,
            role=role,
            location=e.get("location", ""),
            start_date=start_date,
            end_date=end_date,
            is_current=is_current,
            skills_text=skills_text,
            description=clean_desc,
            achievements=json.dumps(bullets) if bullets else json.dumps([clean_desc]),
            display_order=idx + 1,
        )
        db.add(exp)

    # 3. Education
    edu_items = sections.get("education", {}).get("items", [])
    for idx, ed in enumerate(edu_items):
        dates = ed.get("dates", {}) or {}
        ed_period = ed.get("period", "")
        ed_parts = [p.strip() for p in re.split(r"\s*(?:[\u2013\u2014\-]|\bto\b)\s*", ed_period) if p.strip()] if ed_period else []
        start_year = ed_parts[0] if len(ed_parts) >= 1 else (dates.get("start") or "")
        end_year = ed_parts[1] if len(ed_parts) >= 2 else (dates.get("end") or "")

        db.add(
            Education(
                institution=ed.get("school") or "Institution",
                degree=ed.get("degree") or "Degree",
                field_of_study=ed.get("area") or "Engineering",
                grade=ed.get("grade") or "",
                start_year=start_year,
                end_year=end_year,
                url=(ed.get("website", {}) or {}).get("url") or "",
            )
        )

    # 4. Skills
    skill_items = sections.get("skills", {}).get("items", [])
    for idx, s in enumerate(skill_items):
        name = s.get("name", "").strip()
        if not name:
            continue
        n_low = name.lower()
        if any(x in n_low for x in ["azure", "synapse", "pyspark", "databricks", "cloud", "aws", "gcp"]):
            category = "Cloud & Big Data"
        elif any(x in n_low for x in ["python", "django", "java", "spring", "fastapi", "flask", "node"]):
            category = "Languages & Backend"
        elif any(x in n_low for x in ["react", "angular", "javascript", "typescript", "html", "css"]):
            category = "Frontend"
        elif any(x in n_low for x in ["sql", "mysql", "postgres", "mongo", "database"]):
            category = "Databases"
        elif any(x in n_low for x in ["docker", "kubernetes", "git", "devops", "jenkins", "pipeline"]):
            category = "DevOps & Cloud"
        else:
            category = "Core Competencies"

        db.add(
            Skill(
                name=name,
                category=category,
                proficiency="Expert" if idx < 8 else "Proficient",
                display_order=idx + 1,
            )
        )

    # 5. Projects
    proj_items = sections.get("projects", {}).get("items", [])
    for idx, pr in enumerate(proj_items):
        p_name = pr.get("name") or f"Project {idx + 1}"
        p_desc = clean_html_tags(pr.get("description", "")) or f"{p_name} architecture and deployment."
        p_url = (pr.get("website", {}) or {}).get("url") or ""
        db.add(
            Project(
                title=p_name,
                subtitle="Engineered Solution",
                description=p_desc,
                tech_stack="Python, Cloud Services, REST APIs",
                github_url=p_url,
                live_url="",
                highlights=json.dumps([p_desc]),
                featured=True,
                display_order=idx + 1,
            )
        )

    # 6. Awards
    award_items = sections.get("awards", {}).get("items", [])
    for idx, aw in enumerate(award_items):
        a_title = aw.get("title") or "Recognition"
        db.add(
            Award(
                title=a_title,
                organization=aw.get("awarder") or "Corporate Honor",
                year=aw.get("date") or (aw.get("dates", {}) or {}).get("start", ""),
                description=clean_html_tags(aw.get("description", "")),
                display_order=idx + 1,
            )
        )

    # 7. Certifications
    cert_items = sections.get("certifications", {}).get("items", [])
    for idx, ct in enumerate(cert_items):
        c_title = ct.get("title") or "Certification"
        db.add(
            Certification(
                name=c_title,
                issuer=ct.get("issuer") or "Accredited Provider",
                issue_date=ct.get("date") or "",
                credential_url=(ct.get("website", {}) or {}).get("url") or "",
                display_order=idx + 1,
            )
        )

    db.commit()


def seed_database(db: Session, force: bool = False):
    # Ensure Admin User exists
    admin = db.query(AdminUser).filter(AdminUser.username == "admin").first()
    default_pass = os.getenv("DEFAULT_ADMIN_PASSWORD", "admin123")
    if not admin:
        admin = AdminUser(
            username="admin",
            password_hash=hash_password(default_pass),
        )
        db.add(admin)
        db.commit()
    elif force:
        admin.password_hash = hash_password(default_pass)

    existing_profile = db.query(Profile).first()
    is_placeholder = existing_profile is None or existing_profile.email == "developer@example.com"

    # Check if user provided private portfolio JSON in Vercel environment variables
    env_json_raw = os.getenv("PORTFOLIO_DATA_JSON") or os.getenv("RESUME_DATA_JSON")
    if env_json_raw and (force or is_placeholder):
        try:
            raw = env_json_raw.strip()
            if raw.startswith("{"):
                payload = json.loads(raw)
            else:
                decoded = base64.b64decode(raw).decode("utf-8")
                payload = json.loads(decoded)

            populate_from_resume_payload(db, payload)
            print("Successfully populated database from PORTFOLIO_DATA_JSON environment variable!")
            return
        except Exception as e:
            print("Failed to auto-seed from PORTFOLIO_DATA_JSON:", e)

    if not force and not is_placeholder:
        return  # Already seeded or has custom data

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
        github_url="https://github.com/harsha-reddi1",
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
            github_url="https://github.com/harsha-reddi1",
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
            github_url="https://github.com/harsha-reddi1",
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

    if not db.query(AiInsight).first():
        db.add_all([
            AiInsight(
                section_key="engineering_philosophy",
                title="Engineering Philosophy & Focus",
                subtitle="Architectural Principles & Software Craftsmanship",
                content=json.dumps({
                    "title": "Engineering Philosophy & Focus",
                    "subtitle": "Architectural Principles & Software Craftsmanship",
                    "content": "I believe in building software that balances high throughput with resilient, maintainable architecture. Rather than introducing premature complexity, I focus on clean service boundaries, end-to-end data integrity, and deterministic latency. Whether modernizing distributed data pipelines or engineering responsive microservices, my focus is on delivering reliable production systems that scale gracefully under real-world demand.",
                    "principles": [
                        "Pragmatic Architecture: Prioritizing clean boundaries, observability, and simplicity over resume-driven complexity.",
                        "Latency & Performance Obsession: Profiling queries, caching critical paths, and tuning async event loops for sub-second responses.",
                        "End-to-End Ownership: Deep commitment from distributed cloud infrastructure and CI/CD automation to polished client experiences."
                    ]
                }),
                display_order=1
            ),
            AiInsight(
                section_key="architecture_highlights",
                title="System Architecture & Production Milestones",
                subtitle="Scalability, Distributed Pipelines & Low-Latency Performance",
                content=json.dumps({
                    "title": "System Architecture & Production Milestones",
                    "subtitle": "Scalability, Distributed Pipelines & Low-Latency Performance",
                    "bullets": [
                        "Architected distributed microservices and asynchronous backend workflows leveraging Python and FastAPI, significantly cutting API response latency.",
                        "Engineered resilient ETL ingestion pipelines handling high-volume analytical records with robust error handling and schema validation.",
                        "Championed cloud modernization, automated CI/CD deployment pipelines, containerization, and zero-downtime deployments."
                    ]
                }),
                display_order=2
            ),
            AiInsight(
                section_key="domain_expertise",
                title="Domain Expertise & What I Build",
                subtitle="Core Specializations & Technical Vision",
                content=json.dumps({
                    "title": "Domain Expertise & What I Build",
                    "subtitle": "Core Specializations & Technical Vision",
                    "mission": "Passionate about solving complex engineering bottlenecks, designing distributed data pipelines, and building scalable cloud-native architectures that deliver high performance and exceptional reliability.",
                    "focus_areas": [
                        "High-Throughput Data Ingestion",
                        "Resilient Cloud Backends & Microservices",
                        "API Performance & Query Tuning",
                        "Modern Reactive Interfaces & Dashboards"
                    ],
                    "technical_stack": [
                        "Python / FastAPI / REST",
                        "Cloud & Container Orchestration",
                        "SQL & Database Query Tuning",
                        "Distributed Event Processing",
                        "React JS & Modern Web"
                    ],
                    "values": [
                        "Sub-second API Latency",
                        "Zero-Downtime Releases",
                        "Strict Type Safety & Clean Contracts",
                        "Data Integrity & Fault Tolerance"
                    ]
                }),
                display_order=3
            )
        ])

    db.commit()
