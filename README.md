# SakaySure 🚍
**Team Semicolon** | **Entry:** Smart Mobility and Transportation

SakaySure is a smart, community-driven platform designed to take the guesswork out of commuting. It provides real-time ride availability and travel time predictions, helping you plan your journey with confidence.

### Prediction Engine: The Mathematics of SakaySure

SakaySure's prediction engine calculates travel estimates by combining multiple data layers using the following formulas:

#### 1. Estimated Time of Arrival (ETA)
The final ETA is derived from a baseline value, adjusted by real-time driver availability and community feedback.

$$ \text{ETA}_{\text{final}} = \max(1, \text{round}(\text{ETA}_{\text{base}} \times \text{Multiplier}_{\text{driver}} \times \text{Multiplier}_{\text{commuter}})) $$

*   **$\text{ETA}_{\text{base}}$**: Historical baseline for the current hour (e.g., 20-40 mins during peak rush).
*   **$\text{Multiplier}_{\text{driver}}$**: Reduces ETA as more drivers are active or scheduled.
    *   *Formula*: $\max(0.5, 1 - (\text{Effective Drivers} \times 0.08))$
*   **$\text{Multiplier}_{\text{commuter}}$**: Adjusted by community-verified reliability (Helpful vs. Not Helpful votes).
    *   **0.9x** (10% faster) if helpful ratio $> 60\%$
    *   **1.1x** (10% slower) if helpful ratio $< 30\%$

#### 2. Predicted Vehicle Count
Estimates the number of available rides in the corridor.

$$ V_{\text{final}} = V_{\text{base}} + \text{Boost}_{\text{driver}} + \text{Boost}_{\text{commuter}} $$

*   **$V_{\text{base}}$**: Historical average for the current hour.
*   **$\text{Boost}_{\text{driver}}$**: Adds $+1$ for every active or scheduled driver detected.
*   **$\text{Boost}_{\text{commuter}}$**: Adds $+1$ if the community has shared 3 or more verified routes.

#### 3. Confidence Score
Determines the reliability of the prediction based on data source availability.

| Data Layer | Score Contribution |
| :--- | :--- |
| **Time of Day** (Baseline) | Always Active |
| **Driver Schedules** | +2 |
| **Live Driver Positions** | +3 |
| **Community Routes** | +1 |

**Final Rating:**
- **High**: Score $\ge 4$ (Live data + Schedules/Community)
- **Medium**: $2 \le \text{Score} < 4$ (Schedules or Community feedback)
- **Low**: Score $< 2$ (Baseline only)

---

### Competition Essentials
* **The Problem:** Urban commuting is often unpredictable, leading to wasted time and stress due to lack of real-time ride info.
* **The Solution:** A unified "Live Map of Availability" that merges driver data with community-verified routes.
* **Key Features:**
  * **Smart ETA & Confidence:** Know exactly when a ride is coming and how reliable that prediction is.
  * **Community Discovery:** Find and share the most efficient commuter routes.
  * **Premium Map Experience:** High-performance, interactive maps for easy route tracking.
* **Tech Stack:**
  * **Frontend:** React 19 (Vite), TypeScript, Tailwind CSS 4.
  * **Backend:** Firebase (Auth, Firestore, Functions).
  * **Maps:** Mapbox GL JS & Search API.

---

### Getting Started
1. **Clone the repo.**
2. **Install dependencies:** `npm install`
3. **Run locally:** `npm run dev`

---
**SakaySure—Commute without the doubt.**
