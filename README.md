# 🌱 MahaKrushi AI - Smart Farming Intelligence Platform

![MahaKrushi AI Banner](https://via.placeholder.com/1200x400/10b981/ffffff?text=MahaKrushi+AI)

**MahaKrushi AI** is a next-generation, comprehensive agricultural intelligence platform designed to empower farmers, agribusinesses, and stakeholders across Maharashtra. The platform bridges the divide between traditional agrarian practices and cutting-edge technology by delivering real-time localized data, predictive AI analytics, satellite imagery, and on-demand agronomic insights—all through an accessible and visually stunning interface.

---

## 🚀 Key Features

### 🤖 AI Agent Ecosystem
A robust system of specialized, intelligent agents that automate and optimize complex agricultural decisions:
- **Farm Decision Agent:** Suggests the best crops to plant based on soil type, season, and historical yield data.
- **Harvest Planner:** Calculates optimal harvest windows to maximize yield quality and minimize resource waste.
- **Profit Estimator:** Projects potential revenue by analyzing current input costs against real-time market prices.
- **Risk Assessor:** Identifies potential risks (weather anomalies, pest outbreaks) and provides actionable mitigation strategies.
- **Buyer Agent:** Connects farmers directly with potential buyers, suggesting the best time and market to sell.

### 📊 Real-Time Data & Integrations
- **Live Mandi Prices:** Direct integration with `data.gov.in` to pull real-time agricultural commodity prices across various markets (Mandis).
- **Hyper-Local Weather:** Powered by **Open-Meteo**, providing hourly and daily forecasts, precipitation data, and severe weather alerts.
- **Automated Background Jobs:** Built-in `APScheduler` handles regular data fetching for weather (15m intervals) and market data (30m intervals).

### 🌾 End-To-End Agronomy Management
- **Crop Lifecycle Tracking:** Track seed to harvest progression, with automated reminders for fertilization and irrigation.
- **Disease & Pest Detection:** AI-driven computer vision capabilities for identifying agricultural diseases and pest infestations.
- **Satellite Health Monitoring:** Integration with satellite data to provide NDVI (Normalized Difference Vegetation Index) maps and land health metrics.

### 🗺️ Geospatial Intelligence
- **Interactive Infrastructure Maps:** Built with `Leaflet` and `React-Leaflet` to plot critical resources.
- **Find Resources:** Easily locate nearby Cold Storage facilities, soil testing Laboratories, Equipment rentals, and local agricultural experts.

---

## 💻 Technology Stack

### Frontend (User Interface)
- **Framework:** [Next.js](https://nextjs.org) (React 19, Turbopack)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/) & [Framer Motion](https://www.framer.com/motion/) for fluid animations
- **Maps & Charts:** `React-Leaflet` for interactive maps, `Recharts` for stunning data visualization
- **Icons & UI:** `Lucide React`
- **Authentication:** `Supabase SSR`
- **Language:** TypeScript

### Backend (API & AI Layer)
- **Framework:** [FastAPI](https://fastapi.tiangolo.com/) for high-performance, asynchronous Python APIs
- **Database:** SQLite (Async) - Designed for fast, localized data storage
- **Task Scheduling:** `APScheduler`
- **Concurrency:** Uses `uvicorn` and WebSockets for real-time notifications

---

## 🛠️ Getting Started

### Prerequisites
- **Node.js** (v18 or higher)
- **Python** (v3.10 or higher)
- **Supabase** Project (for Auth & User data)

### 1. Backend Setup
Navigate to the backend directory and set up the Python environment:
```bash
# Move to the backend folder
cd backend

# Create a virtual environment
python -m venv .venv

# Activate the virtual environment
# Windows:
.venv\Scripts\activate
# Mac/Linux:
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run the backend server
python -m uvicorn main:app --reload --port 8000
```
> The API will be available at [http://localhost:8000/docs](http://localhost:8000/docs)

### 2. Frontend Setup
Open a new terminal, navigate to the frontend directory, and start the Next.js server:
```bash
# Move to the frontend folder
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```
> The frontend will be available at [http://localhost:3000](http://localhost:3000)

---

## 🌍 Environment Variables

Create a `.env.local` file in the `frontend` directory with your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

---

## 🤝 Contributing
Contributions are absolutely welcome! Whether it's adding a new feature, hunting down a bug, or improving the documentation, please feel free to fork the repository and submit a Pull Request.

## 📄 License
This project is licensed under the MIT License - see the LICENSE file for details.
