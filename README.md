# LILA BLACK — Player Journey Visualization Tool

An interactive, web-based **Game Map Explorer** designed for Level Designers at LILA Games to analyze 5 days of production telemetry (89,104 events across 796 matches) from **LILA BLACK**, an extraction shooter.

---

## 🌐 Live Deployed Application

- **Live URL**: `https://lila-black-map-explorer.vercel.app` *(or Netlify URL)*
- **GitHub Repository**: `https://github.com/vineet/lila-player-data-explorer`

---

## ✨ Key Features

- **Interactive Map Canvas**: High-performance HTML5 Canvas rendering 2D minimaps for all 3 maps (`AmbroseValley`, `GrandRift`, `Lockdown`).
- **Player Journey Trajectories**: Smooth path polyline visualization distinguishing **Human Players** (Blue) vs. **Bots** (Slate).
- **Distinct Event Markers**: Custom icons for combat events (`Kill`, `Killed`, `BotKill`, `BotKilled`), item acquisition (`Loot`), and environment deaths (`KilledByStorm`).
- **Multi-Level Filters**: Filter by Map, Date (Feb 10–14), Match session, Human/Bot visibility, and event types.
- **Match Playback Engine**: Scrub through match timelines with Play/Pause, jump controls, and speed multipliers ($1\times, 2\times, 5\times, 10\times$).
- **Density Heatmap Overlays**: Real-time 2D Canvas kernel-density heatmaps for **Player Traffic**, **Kill Zones**, and **Death Concentration**.
- **Real-World Coordinate Inspector**: Hover over any point on the map to inspect normalized UV coordinates and transformed in-game 3D World $(x, y, z)$ coordinates.
- **3 Level Design Insights**: Embedded interactive drawer presenting evidence-backed insights for map balance.

---

## 🛠️ Technology Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS, Lucide Icons.
- **Visualization**: Pure HTML5 Canvas 2D Engine (paths, heatmaps, markers).
- **Data Preprocessing**: Python 3.11 (`pyarrow`, `pandas`).
- **Architecture**: Zero-backend static JAMstack (1.52 MB gzipped JSON dataset served directly from CDN).

---

## 🚀 Local Setup & Development Guide

### Prerequisites
- **Node.js**: v18.0.0 or higher (v22 tested)
- **Python**: v3.9+ with `pyarrow` and `pandas` installed

### 1. Clone Repository & Install Dependencies
```bash
git clone https://github.com/vineet/lila-player-data-explorer.git
cd lila-player-data-explorer/frontend
npm install
```

### 2. Run Data Preprocessing Script (Optional)
If you want to re-process the raw Parquet files from scratch:
```bash
python scripts/process_parquet.py
```
This generates `summary.json`, `matches.json`, and `map_aggregates.json` inside `frontend/public/data/`.

### 3. Start Local Development Server
```bash
cd frontend
npm run dev
```
Open `http://localhost:3000` in your browser.

### 4. Build for Production
```bash
cd frontend
npm run build
```
The optimized production build will be generated in `frontend/dist/`.

---

## 🗺️ Coordinate Transformation & Math

In-game 3D world coordinates $(x, y, z)$ map to 2D minimap normalized UV coordinates $(u, v)$ using:

$$u = \frac{x - \text{origin}_x}{\text{scale}}, \quad v = \frac{z - \text{origin}_z}{\text{scale}}$$

Screen canvas pixel coordinates (top-left origin):
$$\text{pixel}_x = u \times \text{Width}, \quad \text{pixel}_y = (1 - v) \times \text{Height}$$

| Map Name | Scale | Origin X | Origin Z | Minimap File |
|----------|-------|----------|----------|--------------|
| **Ambrose Valley** | 900 | -370 | -473 | `AmbroseValley_Minimap.png` (4320x4320) |
| **Grand Rift** | 581 | -290 | -290 | `GrandRift_Minimap.png` (2160x2158) |
| **Lockdown** | 1000 | -500 | -500 | `Lockdown_Minimap.jpg` (9000x9000) |

---

## 📁 Repository Structure

```
player_data/
├── frontend/             <- React + TypeScript + Vite + Tailwind CSS app
│   ├── public/
│   │   ├── minimaps/     <- Minimap image assets
│   │   └── data/         <- Preprocessed JSON datasets
│   ├── src/
│   │   ├── components/   <- Map canvas, sidebar, timeline, header, insights
│   │   ├── types/        <- TypeScript schema interfaces
│   │   ├── utils/        <- Coordinate math & canvas heatmap renderer
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   └── vite.config.ts
├── scripts/
│   ├── process_parquet.py<- Parquet -> JSON converter
│   └── analyze_insights.py<- Data evidence extraction script
├── README.md             <- Main documentation
├── ARCHITECTURE.md       <- 1-page technical architecture & trade-offs
└── INSIGHTS.md           <- 3 evidence-backed level design insights
```

---

## 📝 License & Attribution
Created for the LILA Games Product Engineer Written Test. Telemetry data and minimaps property of LILA Games.
