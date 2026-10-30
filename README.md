# Harsha Vardhan Reddi — Personal Portfolio & Engineering Showcase

A personal portfolio website and content management platform built for **Harsha Vardhan Reddi** (Data Engineer & Full Stack Developer). Designed with a **Modern Dark Tech & Minimalist** aesthetic, featuring a decoupled **FastAPI + SQLite** backend, a reactive **React JS + Vite + Tailwind CSS** frontend, and a **hidden, in-app Admin Panel** with dual-mode syncing for seamless **GitHub Pages** static deployment.

---

## ⚡ Tech Stack & Architecture

- **Frontend:** React 19, Vite, Tailwind CSS v4, Lucide React
- **Backend:** FastAPI, Python 3, Uvicorn, Pydantic v2, PyJWT
- **Database:** SQLite (file-based relational DB via SQLAlchemy ORM)
- **Deployment:** GitHub Pages (automated via GitHub Actions) + Optional Cloud Backend (Render / Azure App Service / Railway / Docker)
- **Architecture Pattern:** Hybrid Dual-Mode (Runs dynamically against FastAPI + SQLite or statically on GitHub Pages with embedded resume fallback & localStorage sync)

---

## 🌟 Key Features

1. **Modern Dark Tech Aesthetic:**
   - Deep slate/zinc canvas (`#07090e`), terminal prompts, emerald/cyan accents, and responsive layout.
2. **Career Timeline:**
   - Highlights 6 years of experience across **Deloitte USI**, **PwC AC India**, **Tata Consultancy Services**, and **TCS BFSI Garage**.
3. **Interactive Skills Matrix:**
   - Filterable tabs across *Cloud & Big Data*, *Backend & Architecture*, *Frontend Development*, and *DevOps & Tools*.
4. **Featured Projects Showcase:**
   - Architectures for *SME Marketplace*, *Aspect Search*, and *Enterprise Cloud ETL Pipelines* with tech tags and repository links.
5. **Credentials & Recognitions:**
   - Microsoft Azure Certifications (AZ-900, DP-900), academic degree (GMRIT B.Tech CSE, 8.9 CGPA), and awards (PwC Annual Awards, TCS Codeathon 8th Rank, Smart India Hackathon Finalist).
6. **Visitor Contact System:**
   - Visitors can send inquiries directly from the contact section. Submissions are saved to the SQLite database and surfaced in the admin inbox.
7. **Hidden In-App Admin Panel:**
   - **No routed public URL** (e.g. no `/admin`).
   - Triggered securely via keyboard shortcut: **`Ctrl + Shift + A`** (or **`Cmd + Shift + A`** on Mac) or by clicking the discreet shield lock in the footer.
   - Protected by username & password authentication.
   - Allows full CRUD editing of profile, experiences, projects, skills, and credentials.
   - Live inbox viewer for messages sent through the contact form.
   - JSON Export and Import for offline portability.

---

## 🚀 Quickstart Guide

### 1. Prerequisites
- Python 3.10+
- Node.js 18+ and npm

### 2. Running the FastAPI Backend
```bash
cd backend

# Create and activate virtual environment
python -m venv venv

# Windows:
.\venv\Scripts\activate
# macOS/Linux:
# source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start FastAPI server (runs on http://localhost:8000)
python run.py
```
> **Note:** On first startup, FastAPI automatically creates `portfolio.db` (SQLite) and seeds it with Harsha's complete resume data.

Interactive API Docs: [http://localhost:8000/docs](http://localhost:8000/docs)

---

### 3. Running the React Frontend
```bash
cd frontend

# Install dependencies
npm install

# Start Vite dev server (runs on http://localhost:5173)
npm run dev
```

---

## 🔐 Admin Panel Access

1. Open the portfolio in your browser.
2. Press **`Ctrl + Shift + A`** (or click the discreet shield icon in the footer/navbar).
3. Log in with the default credentials:
   - **Username:** `admin`
   - **Password:** `harsha123`
4. Update any section, add new projects, or review incoming visitor messages in real-time!

---

## 🌐 Deploying to GitHub Pages

This repository includes a pre-configured GitHub Actions workflow in `.github/workflows/deploy.yml`.

1. Push or merge your changes to the `main` branch:
   ```bash
   git push origin main
   ```
2. In your GitHub repository:
   - Go to **Settings** > **Pages**.
   - Under **Build and deployment** > **Source**, choose **GitHub Actions**.
3. GitHub Actions will automatically build the React frontend and deploy it to:
   ```
   https://harsha1598.github.io/portfolio/
   ```

### Connecting Frontend to a Deployed FastAPI Backend
When you deploy the backend to Render, Railway, or Azure App Service, set the repository secret or frontend environment variable:
```env
VITE_API_URL=https://your-backend-api-url.com
```
If no backend URL is set, the frontend gracefully runs in standalone mode using the bundled resume data and browser storage!

---

## 📜 License
MIT License. Created for Harsha Vardhan Reddi.
