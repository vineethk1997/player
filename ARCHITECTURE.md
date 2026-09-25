# Architecture — LILA BLACK Player Journey Visualization Tool

## 1. What Was Built

An interactive, web-based **Player Journey Visualization Tool** ("Game Map Explorer") tailored for Level Designers at LILA Games. The application ingests 5 days of production telemetry (89,104 events across 796 matches) from **LILA BLACK**, transforming raw columnar Parquet data into real-time map trajectories, event markers, playback timeline controls, and density heatmaps.

---

## 2. Technology Choices

- **Data Processing**: Python 3.11 (`pyarrow`, `pandas`, `json`, `gzip`). Used to parse, clean, decode binary event strings, correct Unix timestamp metadata anomalies, and calculate map UV coordinates.
- **Frontend Framework**: React 19 + TypeScript + Vite. Provides strict type safety, fast build times, and clean modular component architecture.
- **Styling & UI Components**: Tailwind CSS + `lucide-react`. Modern dark-mode UI optimized for desktop level design workflows.
- **Visualization Engine**: HTML5 Canvas 2D. High-performance rendering of smooth polyline player paths, animated position markers, event icons, and custom kernel-density heatmaps at 60 FPS.
- **Deployment Platform**: Vercel / Netlify (Static JAMstack architecture).

---

## 3. Data Flow Architecture

```
Raw Parquet Files (1,243 files, ~89K events)
  └── Python Preprocessing Pipeline (process_parquet.py)
        ├── 1. Decode binary UTF-8 events
        ├── 2. Interpret raw integers as Unix Epoch Seconds
        ├── 3. Classify Human vs. Bot user_ids
        ├── 4. Convert (x, z) world coordinates to normalized (u, v) space
        └── Export Optimized Static JSON (frontend/public/data/)
              ├── summary.json (270 KB) — Match index & stats
              ├── matches.json (11.0 MB) — Full match trajectories & events
              └── map_aggregates.json (3.8 MB) — Map-level density points
                    └── React + TypeScript Web Application (HTML5 Canvas Engine)
```

---

## 4. Coordinate Mapping Formulas

In-game 3D world coordinates $(x, y, z)$ are converted to 2D minimap normalized UV coordinates $(u, v)$ and pixel positions:

1. **Height/Elevation**: The $y$ column represents vertical elevation and is preserved for hover inspection but excluded from 2D minimap plotting.
2. **Normalized UV Calculation**:
   $$u = \frac{x - \text{origin}_x}{\text{scale}}, \quad v = \frac{z - \text{origin}_z}{\text{scale}}$$
3. **Pixel Conversion** (for canvas width $W$ and height $H$):
   $$\text{pixel}_x = u \times W, \quad \text{pixel}_y = (1 - v) \times H$$
   *(Note: $v$ is inverted $(1 - v)$ because screen canvas origins start at the top-left corner).*

| Map Name | Scale | Origin X | Origin Z | Verified UV Range | Out-of-Bounds Error |
|----------|-------|----------|----------|--------------------|---------------------|
| **AmbroseValley** | 900 | -370 | -473 | $u \in [0.05, 0.75], v \in [0.10, 0.93]$ | **0.00%** |
| **GrandRift** | 581 | -290 | -290 | $u \in [0.11, 0.94], v \in [0.17, 0.79]$ | **0.00%** |
| **Lockdown** | 1000 | -500 | -500 | $u \in [0.09, 0.85], v \in [0.21, 0.83]$ | **0.00%** |

---

## 5. Important Assumptions & Nuances

- **Timestamp Anomaly (`ts`)**: Parquet schema declares `ts` as `datetime64[ms]`, but raw values are stored as **Unix Epoch Seconds** (e.g., `1,770,754,537` $\rightarrow$ Feb 10, 2026 UTC). Standard Parquet readers misinterpret this as Jan 21, 1970. Interpreting raw integers as epoch seconds recovers accurate match timelines averaging 5–15 minutes.
- **Bot Classification**: `user_id` values consisting solely of numeric digits (e.g., `1440`, `382`) or rows with `BotPosition`/`BotKill`/`BotKilled` are classified as bots. UUID string `user_id` values are classified as human players.
- **Event Encoding**: The `event` column contains byte-encoded strings (e.g. `b'Position'`, `b'Loot'`) requiring `.decode('utf-8')`.

---

## 6. Major Technical Trade-Offs

| Decision | Alternatives Considered | Why This Approach Was Chosen |
|----------|-------------------------|------------------------------|
| **Preprocessed Static JSON Payload** | Real-time DuckDB-WASM / Node.js Backend API | 1.52 MB gzipped JSON loads instantly in browser without cold starts, database servers, or backend hosting costs. |
| **HTML5 Canvas 2D Rendering** | Leaflet.js / SVG / WebGL | Canvas handles thousands of trajectory points and heatmaps smoothly at 60 FPS without DOM node overhead. |
| **Relative Match Playback Scrubber** | Absolute UTC Wall-Clock Time | Normalizes match start times to `00:00`, allowing Level Designers to compare player behavior progression across different matches easily. |
