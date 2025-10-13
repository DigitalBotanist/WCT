# 🦁 Wildlife Threat Controller

> **Empowering people and technology to protect wildlife through knowledge, data, and intelligent insights.**  
> A future where every species thrives — guided by awareness, collaboration, and AI-driven conservation.

---

## 🌿 Overview

**Wildlife Threat Controller (WTC)** is an **Agentic AI system** designed to understand, analyze, and protect wildlife.  
It is built to help researchers, conservationists, and policy makers:

- Identify wildlife species from images 🐾  
- Track migration routes and behavioral patterns 📍  
- Detect emerging threats like poaching, habitat loss, and climate impact 🌍  
- Visualize and share insights to guide conservation action 📊  

---

## 🧠 System Architecture

The system follows a **multi-agent architecture** controlled by an **Orchestrator (Manager Agent)**.  
Each agent specializes in a domain — image understanding, movement analysis, or threat assessment.

### 🧩 Agents Overview

#### 🧭 Orchestrator (Manager Agent)
- Central controller that manages all sub-agents.  
- Receives user inputs (queries, images, data).  
- Routes requests to the correct specialized agent.  
- Combines responses into a final user-facing result.  
- Coordinates workflow: **Species → Migration → Threats → Visualization.**

---

#### 🐆 Species Identifier (CNN Agent)
- Identifies animal species from uploaded images using a **Convolutional Neural Network (CNN)** built with **TensorFlow**.  
- Provides **confidence scores** for species classification.  
- Can handle multiple species and environmental backgrounds.

---

#### 🕊️ Migration Pattern Analyzer
Analyzes **GPS and timestamp data** to study species movement, routes, and behavioral patterns.

**Sub-Agents:**
- **Pattern Finder:** Detects migration routes, timing, and anomalies.  
- **GPS Clustering:** Groups key locations like stopovers, breeding sites, and feeding zones.

---

#### 🌋 Threat Analyzer
Detects potential risks affecting species survival and habitat safety.

**Sub-Agents:**
- **Threat Finder:** Uses **Serper API (Google Search)** to gather real-time data on poaching, deforestation, or climate threats.  
- **Visualization Agent:** Maps risks and generates interactive dashboards and graphs (React + D3/Chart.js).

---

## 🧱 Tech Stack

| Layer | Technologies |
|-------|---------------|
| **Frontend** | React, TypeScript, Node.js |
| **Backend** | FastAPI, Python |
| **AI/ML** | TensorFlow, Scikit-learn |
| **Database** | PostgreSQL |
| **Search / Data** | Serper API (Google Search), Kaggle Datasets |
| **LLM / Reasoning** | Gemini API |
| **Visualization** | React Charts |

---

## ⚙️ Installation & Setup

### 1️⃣ Clone the Repository
- git clone https://github.com/DigitalBotanist/WCT.git
- cd WCT
- venv\Scripts\activate

### 2️⃣ Backend Setup
- cd agent/image_classification Uvicorn main:app --reload --port 8001
- cd agent/migration_patter_analyzer Uvicorn main:app --reload --port 8002
- cd Backend Uvicorn app.main:app --reload
  
### 3️⃣ Frontend Setup
- cd frontend
npm install
npm run dev
