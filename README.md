# SakaySure 
**Team Semicolon** | **Entry:** Smart Mobility and Transportation

SakaySure is a smart, community-driven platform designed to take the guesswork out of commuting. It provides real-time ride availability and travel time predictions, helping you plan your journey with confidence.

### How Our Prediction Engine Works

SakaySure takes the guesswork out of commuting by acting as your personal route scout. Instead of using confusing math, our engine simply checks three powerful sources to figure out when your ride will arrive:

#### 1. Pinpoint ETAs
We no longer rely on rough guesses or historical averages. When you tap on a route, SakaySure immediately talks to the **Mapbox Traffic API** to calculate the exact, real-life driving time from the first stop to your destination.

#### 2. "Vehicles Near You"
How do we know how many jeepneys or buses are coming? 
- We look at the **live map**. If there are 3 drivers sharing their location on your route right now, we tell you exactly that!
- If no official drivers are online, we count the number of **community-shared routes** to gauge how heavy the informal local transit traffic is for that road.

#### 3. AI Commuter Advice
We integrated Google's Gemini AI directly into your prediction cards! Simply tap the **"Ask AI"** button. The AI instantly reads your current location, your route's ETA, and searches the web for live bus terminal schedules to give you a quick, actionable tip for your ride.

#### 4. The Confidence Score
We tell you how much you can trust our numbers right on the card:
- **High Confidence**: We literally see live drivers on the map right now. You are good to go!
- **Medium Confidence**: We don't see live drivers, but we have official dispatcher schedules or highly-rated community tips.
- **Low Confidence**: We only have generic time-of-day traffic estimates.

---

### Why
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
