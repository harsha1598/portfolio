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
        "id": 1,
        "title": "Building Scalable Cloud & Data Architectures",
        "slug": "building-scalable-cloud-data-architectures",
        "excerpt": "Insights into engineering enterprise-grade data platforms, real-time analytics, and high-performance services.",
        "content": "### Engineering Scalable Systems\n\nModern distributed applications require a balanced combination of resilient infrastructure, low-latency APIs, and automated data pipelines.\n\n#### Key Architectural Pillars\n- **Distributed Storage & Streaming:** Leveraging Kafka, Redis, and cloud data warehouses.\n- **Stateless Microservices:** Built with FastAPI and containerized on Kubernetes.\n- **Observability & Health Checks:** Proactive metrics, distributed tracing, and automated failure recovery.",
        "tags": "Data Engineering, Cloud Architecture, Python",
        "cover_image": "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80",
        "is_published": true,
        "created_at": "2026-10-31T09:43:58.805Z"
    },
    {
        "id": 2,
        "title": "Never Let the LLM Do the Math: A Practical Guide to Grounded Generation",
        "slug": "never-let-the-llm-do-the-math",
        "excerpt": "Patterns for building trustworthy LLM features on top of real data",
        "content": "# Never Let the LLM Do the Math: A Practical Guide to Grounded Generation\r\n\r\n*Patterns for building trustworthy LLM features on top of real data*\r\n\r\n## Introduction\r\nLLMs write fluent text, but fluency is not accuracy. In a data product, a single invented number in an AI-generated summary can undermine user trust. This post covers practical patterns for keeping LLM output grounded in real data.\r\n\r\n## Principle: the model explains, the server computes\r\nTreat the LLM as a writer, not a calculator.\r\n- Compute all metrics in your backend or data layer.\r\n- Pass the results to the model as structured input.\r\n- Instruct the model to use only the supplied values.\r\n\r\n```json\r\n{\r\n  \"metric\": \"weekly_spend\",\r\n  \"current\": 1240.50,\r\n  \"previous\": 1105.20,\r\n  \"change_pct\": 12.2\r\n}\r\n```\r\n\r\n## Validate the output\r\nA prompt is a request, not a guarantee. Enforce the rule in code:\r\n1. Extract every number from the generated text.\r\n2. Check that each one maps to a value you supplied (allowing for rounding and formatting).\r\n3. If any figure is unmatched, reject the output and retry, with a capped retry count.\r\n\r\n```python\r\ndef is_grounded(text: str, allowed: set[float]) -> bool:\r\n    found = extract_numbers(text)\r\n    return all(any(matches(n, a) for a in allowed) for n in found)\r\n```\r\n\r\n## Cache by input hash\r\nGeneration is deterministic with respect to its inputs only if you make it so. Hash the structured input (plus the prompt version and model name) and use it as the cache key.\r\n- Same input means same cached output.\r\n- Each unique input costs one model call.\r\n- Include the prompt version in the key so prompt changes invalidate stale entries.\r\n\r\n## Test with an LLM as judge\r\nPrompts and agents change often, and manual review does not scale. Build a regression harness:\r\n- Keep a fixed set of representative inputs.\r\n- Have a judge model score outputs on criteria such as accuracy, relevance and tone.\r\n- Track latency alongside quality.\r\n- Accept a change only if scores hold or improve.\r\n\r\nCalibrate the judge against human-labeled examples first, and use a different model family for judging when possible to reduce self-preference bias.\r\n\r\n## Route models by task\r\nNot every call needs your strongest model.\r\n- **Fast, cheap models** for high-volume work such as classification, extraction and short summaries.\r\n- **Stronger models** for multi-step reasoning and tool-heavy agents.\r\n- A gateway such as LiteLLM gives you one interface and makes routing a config change.\r\n\r\nAlso trim what you send. Strip unused fields from API responses before they reach the model, since fewer tokens means lower cost and less distraction.\r\n\r\n## Reduce agent latency\r\n- **Prompt caching** for long, stable system prompts and tool definitions.\r\n- **Parallel tool calls** when the calls are independent.\r\n- **Token caps** so one runaway response doesn't stall the request.\r\n\r\n## Guardrails for generated content\r\nIf your system publishes LLM-written text or AI images automatically, add a gate:\r\n- Screen images with a vision model before publishing.\r\n- **Fail closed:** if the check fails or errors, publish nothing.\r\n- Run generation in a queued background job so slow model calls never block your main application.\r\n\r\n## Checklist\r\n1. Compute numbers server-side, never in the model.\r\n2. Validate every figure in the output.\r\n3. Cache on a hash of input, prompt version and model.\r\n4. Gate changes with an automated judge.\r\n5. Route by task and trim your inputs.\r\n6. When a safety check errors, fail closed.\r\n\r\n*How do you keep your LLM outputs grounded? Share your approach in the comments.*",
        "tags": "GenAI, LLM, RAG, MCP, Prompt Caching, LiteLLM, AI Engineering",
        "cover_image": "https://images.unsplash.com/photo-1677442136019-21780efad99a?auto=format&fit=crop&w=1200&q=80",
        "is_published": true,
        "created_at": "2026-10-31T09:43:58.816Z"
    },
    {
        "id": 3,
        "title": "Fast, Safe, Reliable APIs: Postgres, Sketches, Streaming and Security",
        "slug": "fast-safe-reliable-apis-postgres-sketches-streaming-and-security",
        "excerpt": "Backend patterns for analytics-style APIs on FastAPI, PostgreSQL and BigQuery",
        "content": "# Fast, Safe, Reliable APIs: Postgres, Sketches, Streaming and Security\r\n\r\n*Backend patterns for analytics-style APIs on FastAPI, PostgreSQL and BigQuery*\r\n\r\n## Introduction\r\nAnalytics APIs face a familiar mix of problems: slow queries, expensive distinct counts, heavy payloads and strict data-privacy needs. Here are five patterns that address them.\r\n\r\n## 1. Let the query plan choose your indexes\r\nDon't guess. Read the plan.\r\n\r\n```sql\r\nEXPLAIN (ANALYZE, BUFFERS)\r\nSELECT * FROM transactions\r\nWHERE merchant_id = 42 AND txn_date >= '2026-01-01';\r\n```\r\n\r\nWhat to look for:\r\n- Sequential scans on large tables.\r\n- Large gaps between estimated and actual row counts.\r\n- Expensive sorts that an index could satisfy.\r\n\r\nTips:\r\n- Match composite index column order to your filters and sort.\r\n- Use partial indexes when queries target a known subset.\r\n- Build indexes with `CREATE INDEX CONCURRENTLY` to avoid locking writes.\r\n- Use a shared connection pool (for example PgBouncer or your driver's pool) instead of opening a connection per request.\r\n\r\n## 2. Count distinct users with HyperLogLog\r\nExact distinct counts across overlapping groups are expensive. A shopper who visits several stores must be counted once in an area total, and you can't just add per-store counts.\r\n\r\n**HyperLogLog (HLL)** is a probabilistic sketch that estimates distinct counts in small, fixed memory, with a small, predictable error.\r\n- Sketches can be **merged**, so you can combine per-store sketches into an area-level count without double counting.\r\n- Precompute sketches per location, then union them at query time for radius, trade-area or zip-code queries.\r\n- The trade-off is approximate answers, which is usually fine for analytics but not for billing.\r\n\r\n## 3. Shrink payloads\r\n- Enable gzip (or brotli) compression for large JSON responses.\r\n- Return only the fields clients need.\r\n- Paginate large result sets.\r\n\r\n## 4. Design analytics APIs with honesty built in\r\n- **Driver breakdowns** explain why a metric moved, not just that it moved.\r\n- **Confidence handling:** suppress or flag results from samples too small to be reliable.\r\n- **Privacy thresholds:** enforce a minimum group size so small cohorts can't identify individuals.\r\n- **Log hygiene:** keep personal data out of logs.\r\n\r\n## 5. Authorization: explicit beats implicit\r\nA common failure is a wildcard or overly broad grant that accidentally passes admin checks.\r\n- Define a dedicated permission per endpoint.\r\n- Deny by default.\r\n- Enforce coverage with automated tests that fail when a route has no explicit permission.\r\n\r\n```python\r\n@router.get(\"/reports\", dependencies=[Depends(require(\"reports:read\"))])\r\nasync def get_reports(): ...\r\n```\r\n\r\n## 6. Reliability patterns\r\n- **Exactly-once notifications:** use idempotency keys or an outbox pattern so retries don't duplicate messages.\r\n- **Safe upserts:** use `INSERT ... ON CONFLICT` with a proper unique constraint so concurrent writers don't collide.\r\n- **Streaming uploads:** process files in chunks instead of loading them fully into memory.\r\n\r\n```python\r\nasync def save_upload(file: UploadFile, dest):\r\n    while chunk := await file.read(1024 * 1024):\r\n        dest.write(chunk)\r\n```\r\n\r\n- **Migration checks in CI:** detect multiple migration heads or conflicting changes before merge, not at deploy time.\r\n\r\n## Checklist\r\n1. Read query plans before adding indexes.\r\n2. Use mergeable sketches for distinct counts.\r\n3. Compress and trim responses.\r\n4. Build privacy and confidence rules into the API.\r\n5. Give every endpoint its own tested permission.\r\n6. Make writes idempotent and uploads streaming.\r\n7. Catch migration conflicts in CI.\r\n\r\n*What backend bottleneck surprised you most? Tell me in the comments.*",
        "tags": "PostgreSQL, FastAPI, BigQuery, HyperLogLog, API Security, Backend Engineering, Performance",
        "cover_image": "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&q=80",
        "is_published": true,
        "created_at": "2026-10-31T09:43:58.816Z"
    }
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
