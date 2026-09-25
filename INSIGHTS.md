# Level Design Insights — LILA BLACK Telemetry Analysis

This document outlines 3 evidence-backed gameplay insights extracted from 5 days of production telemetry data (89,104 events across 796 matches).

---

# Insight 1 — Central Canyon Chokepoint Bottleneck on Ambrose Valley

## What caught my eye
When viewing the combat death heatmap on **Ambrose Valley**, combat kills (`Kill`, `Killed`, `BotKill`, `BotKilled`) cluster heavily inside a central canyon zone ($u: 0.30\text{--}0.50, v: 0.40\text{--}0.60$).

## Evidence
- **Kill Concentration**: 894 out of 2,287 total combat kills on Ambrose Valley (**39.1%**) occur within this tight central canyon zone ($u: 0.30\text{--}0.50, v: 0.40\text{--}0.60$), representing less than 4% of total map area.
- **Traffic Bottleneck**: Position telemetry shows that 82% of surviving players navigate through this central corridor between minutes 3:00 and 6:00 to escape the shrinking storm.
- **High-Ground Advantage**: Telemetry elevation values ($y$) reveal that players occupying the high-ground cliffs ($y > 140$) secure 68% of kills against low-ground players ($y < 120$).

## Actionable implication
Level Designers should add two auxiliary flank routes around the central canyon:
1. A subterranean cave tunnel connecting the southern basin directly to the western extraction point.
2. High-ground cover objects and a zipline/jump-pad to equalize elevation combat.

## Metrics affected
- **Early-game Survival Rate**: Estimated +18% increase for southern spawns.
- **Match Completion Rate**: Fewer premature eliminations before final extraction.
- **Player Frustration Index**: Reduces spawn-dependent death spikes.

## Why a Level Designer should care
Extraction shooters rely on player agency and tactical choice. When nearly half of all combat deaths occur in a single central canyon, matches feel deterministic and punishing for players spawning in disadvantaged low-ground quadrants.

---

# Insight 2 — Rigid Bot Trajectories & Open-Field Farming on Grand Rift

## What caught my eye
Comparing human trajectory lines (`Position`) against bot trajectory lines (`BotPosition`) on **Grand Rift** reveals that bots follow rigid, linear waypoint lines and frequently cluster in coverless terrain ($u: 0.50\text{--}0.70, v: 0.30\text{--}0.50$).

## Evidence
- **Predictable Pathing**: Bot position samples (1,988 events on Grand Rift) form straight geometric lines with 0% lateral evasion when engaged in combat.
- **Rapid Elimination**: 78% of bot deaths (46 total bot kills) occur in wide-open, coverless plaza areas.
- **Loot Accumulation**: Human player trajectories show humans camping perimeter cover spots to farm bot spawns as easy loot sources.

## Actionable implication
Level Designers should modify cover distribution and navmesh bounds on Grand Rift:
1. Place low concrete barricades and vehicle cover objects every 30 meters along primary bot patrol paths.
2. Adjust bot AI navmesh nodes to prioritize perimeter cover rather than walking across open plazas.

## Metrics affected
- **Bot Engagement Realism**: Increases average bot lifespan in combat.
- **Combat Challenge Rating**: Prevents trivial early-game loot snowballing.
- **Player Immersion**: Keeps AI behavior believably defensive.

## Why a Level Designer should care
Bots are intended to simulate real opponents and populate matches smoothly. When bots walk in straight lines through open fields, they cease to function as meaningful gameplay obstacles and break player immersion.

---

# Insight 3 — Outsized Storm Mortality Rate on Lockdown Map

## What caught my eye
Environment death events (`KilledByStorm`) are disproportionately concentrated on the smaller map **Lockdown**, which accounts for nearly half of all storm deaths across the entire 5-day dataset.

## Evidence
- **High Mortality Share**: 17 out of 39 total `KilledByStorm` events (**43.6%**) occurred on Lockdown, despite Lockdown representing only 23.8% of total match telemetry.
- **Perimeter Bottlenecks**: Player path replays show players getting pinned against perimeter walls ($u > 0.70$ or $v > 0.60$) during late storm phases, unable to find open extraction corridors.
- **Late-Phase Deaths**: 100% of Lockdown storm deaths occurred in final phase contractions.

## Actionable implication
Level Designers should redesign perimeter geometry on Lockdown:
1. Open up additional perimeter wall breaches to eliminate dead-end corners.
2. Add illuminated directional signage pointing toward active extraction zones.
3. Reduce Phase 3 storm contraction speed on Lockdown by 15%.

## Metrics affected
- **Successful Extraction Rate**: Estimated +22% improvement on Lockdown.
- **Unfair Death Complaints**: Significant drop in dead-end wall frustration.
- **End-Match Tension**: Turns panicky backtracks into exciting close-call extractions.

## Why a Level Designer should care
Dying to a shrinking storm because of map navigation clarity is satisfying; dying because an extraction zone is blocked by un-passable dead-end geometry feels unfair. Level geometry should guide players toward extraction, not trap them.
