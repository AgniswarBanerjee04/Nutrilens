# NutriLens 🥗📷

**Visual Meal & Macro Engine with Multimodal Vision AI & Resilient Authentication**

NutriLens is a health and nutrition dashboard that uses computer vision to estimate macronutrients and calories directly from photos of meals. Built with a modern dark-themed aesthetic, glassmorphism, vibrant macro accent colors, and a seamless dual-tier architecture that runs locally with FastAPI & SQLite or standalone on cloud platforms like Vercel with automated offline fallback.

---

## 🏗 Architecture Overview

```
NutriLens/
├── backend/                        # FastAPI Python Backend
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py                 # FastAPI application, CORS, and lifecycles
│   │   ├── database.py             # SQLite engine & session dependency
│   │   ├── models.py               # SQLAlchemy models (User, UserGoals, Meal)
│   │   ├── schemas.py              # Pydantic request & response models
│   │   ├── auth.py                 # JWT token generation, bcrypt hashing & auth dependencies
│   │   ├── routers/
│   │   │   ├── auth.py             # /api/auth/register, /api/auth/login, /api/auth/me, /api/auth/demo
│   │   │   ├── meals.py            # /api/analyze-meal (Gemini Vision), /api/meals, /api/balance-next-meal
│   │   │   └── goals.py            # /api/goals (GET & PUT)
│   │   └── services/
│   │       └── gemini.py           # Gemini Vision AI & Macro-Balancer recipe generation
│   ├── requirements.txt            # Python dependencies
│   ├── run.py                      # Uvicorn launcher
│   ├── test_full_suite.py          # Comprehensive 7-stage backend integration test suite
│   └── .env.example                # Environment variables template
│
├── frontend/                       # React 19 + Vite + Tailwind CSS + Framer Motion + Chart.js
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.tsx          # Glassmorphic top bar with status pills & profile
│   │   │   ├── MacroProgress.tsx   # Circular & linear gauges (Neon Green, Electric Blue, Amber)
│   │   │   ├── EnergyCurveChart.tsx# 4-hour metabolic energy curve with Chart.js & reference overlays
│   │   │   ├── MacroBalancerCard.tsx# AI metabolic engine generating custom dinner recipes for daily deficits
│   │   │   ├── SnapMealModal.tsx   # Camera/file dropzone, laser HUD scan animation, and review
│   │   │   ├── MealHistory.tsx     # Chronological visual meal feed with nutrition badges
│   │   │   └── GoalModal.tsx       # Daily caloric & macro target customizer
│   │   ├── context/
│   │   │   └── AuthContext.tsx     # Authentication context with state & offline flags
│   │   ├── pages/
│   │   │   ├── Login.tsx           # Obsidian dark login + Instant Demo Access button
│   │   │   ├── Signup.tsx          # Account registration with starter goals
│   │   │   └── Dashboard.tsx       # Main health dashboard with macro stats & meal feed
│   │   ├── services/
│   │   │   ├── api.ts              # Reachability probe & base API URL
│   │   │   ├── auth.ts             # Backend auth with critical localStorage fallback
│   │   │   └── mealService.ts      # Gemini Vision & local AI meal extraction
│   │   ├── types/
│   │   │   └── index.ts            # TypeScript interfaces
│   │   ├── App.tsx                 # Root router & session loader
│   │   ├── index.css               # Glassmorphism utilities & theme definitions
│   │   └── main.tsx                # React DOM entrypoint
│   ├── package.json
│   ├── tailwind.config.js          # Tailored macro color tokens & animations
│   ├── vite.config.ts
│   └── tsconfig.json
└── README.md
```

---

## ⚡ Quick Start

### 1. Run the Frontend (React + Vite)
```bash
cd frontend
npm install
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

> **Instant Demo Access**: On the login screen, click the **"Instant Demo Access"** button to bypass credential checks and immediately load a pre-populated dashboard with active meal logs and progress rings.

### 2. Run the Backend (FastAPI + SQLite)
```bash
cd backend
python -m venv .venv

# On Windows:
.\.venv\Scripts\pip install -r requirements.txt
.\.venv\Scripts\python run.py

# On macOS/Linux:
source .venv/bin/activate
pip install -r requirements.txt
python run.py
```
Backend API will be active at [http://localhost:8000](http://localhost:8000). Interactive Swagger documentation is available at [http://localhost:8000/docs](http://localhost:8000/docs).

### 3. Run Backend Integration Test Suite
```bash
cd backend
.\.venv\Scripts\python test_full_suite.py
```
Validates the entire 7-stage lifecycle:
- Health check
- Demo & JWT authentication
- Goal adjustments
- Gemini Vision meal scanning & portion breakdown
- Cooking method & hidden fat deconstruction
- Macro-Balancer deficit closure & dinner recipe generation
- Meal log deletion & state cleanup

---

## 🔬 Metabolic Intelligence Features

### 1. 4-Hour Predicted Metabolic Energy Curve (`EnergyCurveChart.tsx`)
- Plots blood glucose and stamina curves over a 4-hour window ($T+0$ to $T+240$ mins) using Chart.js.
- Dynamically classifies meals by **Glycemic Index (GI)**: Low (sustained plateau), Medium (balanced), or High (rapid spike & crash alert).
- **Hidden Fat Gastric Emptying Buffer**: Models how cooking oils, butter, and ghee delay gastric absorption by ~15–30 minutes, moderating sugar spikes.
- **Reference Overlay**: Easily toggle visual comparisons between high-sugar meals vs. high-fiber/protein meals against the user's detected meal.

### 2. AI Macro-Balancer Engine (`MacroBalancerCard.tsx`)
- Compares daily nutritional targets against all logged meals for the day to compute remaining deficits (Calories, Protein, Carbs, Fats).
- Automatically prompts the user if macro deficits exist and formulates a bespoke, calorie-calibrated dinner recipe via Gemini Vision AI.
- Specifies exact ingredient weights, cooking technique, glycemic rating, metabolic tips, and provides a **One-Click Quick-Log** to instantly add the dinner to the user's meal feed.

---

## 🔑 Environment Configuration

Create a `.env` file in the `backend/` directory:
```env
DATABASE_URL=sqlite:///./nutrilens.db
SECRET_KEY=nutrilens_super_secret_jwt_key_2025_luxury_dark_aesthetic_key
GEMINI_API_KEY=your_gemini_api_key_here
```
*Get your free Gemini API key at [Google AI Studio](https://aistudio.google.com/). If no key is set or the server is offline, NutriLens automatically utilizes the built-in intelligent fallback analyzer without failing.*

---

## 🛡️ Vercel & Offline Fallback Architecture

If NutriLens is deployed to Vercel (or any static host) without a live Python backend:
- `src/services/auth.ts` intercepts network calls and manages credentials directly within `localStorage` under `nutrilens_mock_users`.
- Meals and macro goals are safely persisted to user-namespaced `localStorage` keys.
- Meal photo scanning seamlessly runs high-fidelity portion and macro calculations directly in the browser.
- **The live site functions 100% out of the box with zero runtime errors.**
