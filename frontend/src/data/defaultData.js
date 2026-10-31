export const defaultPortfolioData = {
  profile: {
    name: "Developer Portfolio",
    title: "Data Engineer & Full Stack Developer",
    email: "developer@example.com",
    phone: "+1 555-0100",
    location: "Global / Remote",
    years_experience: 5,
    summary:
      "Software developer with extensive experience in building scalable applications, data pipelines, cloud microservices, and modern web platforms. Skilled in backend optimization and engineering leadership.",
    linkedin_url: "https://linkedin.com",
    github_url: "https://github.com/harsha-reddi1",
    hackerrank_url: "https://hackerrank.com",
    x_url: "https://x.com",
    leetcode_url: "https://leetcode.com",
    website_url: "",
    resume_download_url: "#",
  },
  experiences: [
    {
      id: 1,
      company: "Enterprise Cloud Solutions",
      role: "Senior Software Engineer",
      location: "Remote",
      start_date: "2023",
      end_date: "Present",
      is_current: true,
      skills_text: "Python, FastAPI, Distributed Systems, Cloud Architecture",
      description: "Architecting high-throughput microservices and distributed data pipelines.",
      achievements: JSON.stringify([
        "Modernized enterprise cloud architectures achieving 40% latency reduction.",
        "Designed resilient REST and streaming APIs for mission-critical client workloads.",
        "Mentored engineering teams on CI/CD pipelines, container orchestration, and automated testing."
      ]),
      display_order: 1,
    },
    {
      id: 2,
      company: "Data Tech Innovations",
      role: "Data & Backend Engineer",
      location: "Remote",
      start_date: "2020",
      end_date: "2023",
      is_current: false,
      skills_text: "Python, SQL, ETL Pipelines, React JS",
      description: "Developed analytical data engines and scalable user interfaces.",
      achievements: JSON.stringify([
        "Built automated ETL data ingestion pipelines processing millions of daily records.",
        "Developed interactive web dashboards using React JS and FastAPI backend services.",
        "Optimized relational database queries to eliminate bottlenecks during peak traffic."
      ]),
      display_order: 2,
    },
  ],
  projects: [
    {
      id: 1,
      title: "Real-Time Data Streaming Engine",
      subtitle: "High-Throughput Analytics Service",
      description: "Distributed ingestion pipeline supporting real-time event aggregation and analytical processing.",
      tech_stack: "Python, FastAPI, Redis, Docker",
      github_url: "https://github.com",
      live_url: "",
      highlights: JSON.stringify([
        "Sub-50ms ingestion latency for distributed telemetry.",
        "Configurable event schemas and automated health monitoring."
      ]),
      featured: true,
      display_order: 1,
    },
    {
      id: 2,
      title: "Full-Stack Management Platform",
      subtitle: "Secure Multi-Tenant Dashboard",
      description: "Comprehensive administrative platform featuring role-based access control, analytics charts, and dynamic workflows.",
      tech_stack: "React JS, Tailwind CSS, FastAPI, SQLite",
      github_url: "https://github.com",
      live_url: "",
      highlights: JSON.stringify([
        "JWT authentication and automated audit logging.",
        "Responsive dashboard UI with interactive data tables."
      ]),
      featured: true,
      display_order: 2,
    },
  ],
  skills: [
    { id: 1, name: "Python", category: "Languages & Backend", proficiency: "Expert", display_order: 1 },
    { id: 2, name: "FastAPI", category: "Languages & Backend", proficiency: "Expert", display_order: 2 },
    { id: 3, name: "Django REST", category: "Languages & Backend", proficiency: "Advanced", display_order: 3 },
    { id: 4, name: "SQL & PostgreSQL", category: "Databases", proficiency: "Expert", display_order: 4 },
    { id: 5, name: "React JS", category: "Frontend", proficiency: "Advanced", display_order: 5 },
    { id: 6, name: "Docker & Containers", category: "DevOps & Cloud", proficiency: "Advanced", display_order: 6 },
    { id: 7, name: "Cloud Services (Azure/AWS)", category: "DevOps & Cloud", proficiency: "Advanced", display_order: 7 },
  ],
  education: [
    {
      id: 1,
      institution: "University of Technology",
      degree: "Bachelor of Science",
      field_of_study: "Computer Science",
      grade: "First Class with Distinction",
      start_year: "2016",
      end_year: "2020",
      url: "https://example.com",
    },
  ],
  awards: [
    {
      id: 1,
      title: "Engineering Excellence Award",
      organization: "Tech Organization",
      year: "2023",
      description: "Recognized for exceptional technical leadership and system optimization.",
      display_order: 1,
    },
  ],
  certifications: [
    {
      id: 1,
      name: "Cloud Solutions Architect",
      issuer: "Cloud Platform",
      issue_date: "2023",
      credential_url: "",
      display_order: 1,
    },
  ],
  posts: [
    {
      id: 1,
      title: "Welcome to My Portfolio & Tech Blog",
      slug: "welcome-to-my-portfolio-tech-blog",
      excerpt: "An introduction to my engineering portfolio, architecture philosophies, and tech journeys.",
      content:
        "### Welcome!\n\nThis platform serves as my engineering portfolio and personal knowledge base.\n\n#### What I Cover:\n- **Data Engineering:** Designing high-throughput, fault-tolerant pipelines.\n- **Full Stack Development:** Modern microservices with Python, FastAPI, and React.\n- **Cloud Architecture:** Scalable deployments, CI/CD automation, and observability.\n\nStay tuned for deep-dives, architectural blueprints, and engineering tutorials!",
      tags: "Engineering, Introduction, Cloud",
      is_published: true,
      created_at: new Date().toISOString(),
    },
  ],
  ai_insights: [
    {
      id: 1,
      section_key: "engineering_philosophy",
      title: "Engineering Philosophy & Focus",
      subtitle: "Architectural Principles & Software Craftsmanship",
      content: JSON.stringify({
        title: "Engineering Philosophy & Focus",
        subtitle: "Architectural Principles & Software Craftsmanship",
        content: "I believe in building software that balances high throughput with resilient, maintainable architecture. Rather than introducing premature complexity, I focus on clean service boundaries, end-to-end data integrity, and deterministic latency. Whether modernizing distributed data pipelines or engineering responsive microservices, my focus is on delivering reliable production systems that scale gracefully under real-world demand.",
        principles: [
          "Pragmatic Architecture: Prioritizing clean boundaries, observability, and simplicity over resume-driven complexity.",
          "Latency & Performance Obsession: Profiling queries, caching critical paths, and tuning async event loops for sub-second responses.",
          "End-to-End Ownership: Deep commitment from distributed cloud infrastructure and CI/CD automation to polished client experiences."
        ]
      }),
      display_order: 1,
    },
    {
      id: 2,
      section_key: "architecture_highlights",
      title: "System Architecture & Production Milestones",
      subtitle: "Scalability, Distributed Pipelines & Low-Latency Performance",
      content: JSON.stringify({
        title: "System Architecture & Production Milestones",
        subtitle: "Scalability, Distributed Pipelines & Low-Latency Performance",
        bullets: [
          "Architected distributed microservices and asynchronous backend workflows leveraging Python and FastAPI, significantly cutting API response latency.",
          "Engineered resilient ETL ingestion pipelines handling high-volume analytical records with robust error handling and schema validation.",
          "Championed cloud modernization, automated CI/CD deployment pipelines, containerization, and zero-downtime deployments."
        ]
      }),
      display_order: 2,
    },
    {
      id: 3,
      section_key: "domain_expertise",
      title: "Domain Expertise & What I Build",
      subtitle: "Core Specializations & Technical Vision",
      content: JSON.stringify({
        title: "Domain Expertise & What I Build",
        subtitle: "Core Specializations & Technical Vision",
        mission: "Passionate about solving complex engineering bottlenecks, designing distributed data pipelines, and building scalable cloud-native architectures that deliver high performance and exceptional reliability.",
        focus_areas: [
          "High-Throughput Data Ingestion",
          "Resilient Cloud Backends & Microservices",
          "API Performance & Query Tuning",
          "Modern Reactive Interfaces & Dashboards"
        ],
        technical_stack: [
          "Python / FastAPI / REST",
          "Cloud & Container Orchestration",
          "SQL & Database Query Tuning",
          "Distributed Event Processing",
          "React JS & Modern Web"
        ],
        values: [
          "Sub-second API Latency",
          "Zero-Downtime Releases",
          "Strict Type Safety & Clean Contracts",
          "Data Integrity & Fault Tolerance"
        ]
      }),
      display_order: 3,
    },
  ],
};
