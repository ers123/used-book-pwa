# PRD: Personal Book Buyback Checker PWA

## 1. Overview

### 1.1 Purpose
A lightweight PWA for personal use that allows quick checking of **used book buyback prices** from major Korean platforms (Aladin, YES24, etc.).  
The app helps decide **whether each book can be sold**, **where to sell it**, and **how (in-store vs. parcel)**.  
This is intended for **single-user private use** while organizing books at home.

### 1.2 Goals
**Minimum goals (MVP):**
- Scan or enter ISBN
- Retrieve:
  - Aladin: buyback availability + price
  - YES24: buyback availability + price
- Determine recommended buyback channel (Aladin store / YES24 parcel / none)
- Store all scanned books locally for review

---

## 2. Target User & Key Scenarios

### 2.1 Target User
- A single user with many physical books who wants to sort and sell them efficiently.
- Uses an iPhone; prefers installation via PWA.

### 2.2 Key Scenarios
**Scenario A: Shelf-clearing mode**
1. Open PWA on iPhone  
2. Pick a book → scan barcode  
3. App fetches buyback info and recommends a selling method  
4. User saves the result to the local list  
5. Repeat for entire bookshelf

**Scenario B: Selling plan**
1. Open "My Book List"  
2. Filter:
   - Aladin recommended
   - YES24 recommended
   - Not buyable  
3. Prepare boxes accordingly (Aladin drop-off vs. YES24 parcel)

---

## 3. Scope

### 3.1 In Scope (MVP)
- PWA (React/Svelte + Vite)
- Functions:
  - Barcode scanning (EAN-13/ISBN-13)
  - Manual ISBN entry
  - Buyback lookup for:
    - Aladin
    - YES24
  - Local data storage (LocalStorage or IndexedDB)
  - List view with filtering and sorting
  - Basic stats: total value for Aladin vs. YES24

- Backend:
  - Small serverless function (Cloudflare/Vercel) for scraping buyback pages
  - Single-user traffic only

### 3.2 Out of Scope
- Multi-user features, login, cloud sync  
- Official partnerships with Aladin/YES24  
- Additional buyback sources (e.g., local bookstores)  
- Publishing, advanced analytics, AI recommendations  
- Native app shipping through App Store  

---

## 4. Functional Requirements

### 4.1 Barcode Scanner
**Purpose:** Extract ISBN via camera scanning.  
**Requirements:**
- Use `getUserMedia` to access camera
- Barcode formats: EAN-13 / ISBN-13
- On successful scan:
  - Display scanned ISBN
  - Trigger buyback lookup automatically
- On failure:
  - Provide manual ISBN input option

**Libraries**  
`zxing-js`, `QuaggaJS`, or equivalent browser barcode decoder.

---

### 4.2 Manual ISBN Entry
- Accept 10-digit or 13-digit ISBN
- Normalize to ISBN-13 server-side if needed
- Query triggered via “Lookup” button or ENTER

---

### 4.3 Buyback Lookup API

**Endpoint:**  
`GET /api/quote?isbn=9781234567890`

**Output Example:**
```json
{
  "isbn": "9781234567890",
  "title": "Book Title",
  "aladin": {
    "is_buyable": true,
    "price": 3500
  },
  "yes24": {
    "is_buyable": false,
    "price": 0
  },
  "recommendation": "aladin"
}

Requirements:
	•	Validate ISBN
	•	Scrape Aladin’s buyback page (HTML parsing)
	•	Scrape YES24’s buyback page (HTML parsing)
	•	If one source fails, return available data
	•	Implement caching (per ISBN, TTL: 1–7 days)
	•	Graceful error messaging for front-end

⸻

4.4 Recommendation Logic

Simple deterministic logic for MVP:
	1.	If Aladin is buyable → recommend "aladin"
	2.	Else if YES24 is buyable → recommend "yes24"
	3.	Else → "none"

Optional enhancement:
	•	If both buyable → pick higher price,
unless difference is small → prefer Aladin (in-store convenience)

⸻

4.5 Local Storage & Book List

Storage: LocalStorage or IndexedDB (no server persistence)

Fields stored:
	•	ISBN
	•	Title
	•	Aladin price & availability
	•	YES24 price & availability
	•	Recommendation
	•	Timestamp

Requirements:
	•	Re-looking up the same ISBN updates existing entry
	•	List view:
	•	Search (ISBN/title)
	•	Filters:
	•	Recommended: Aladin / YES24 / None
	•	Buyable / not buyable
	•	Sorting:
	•	By price, timestamp, provider
	•	Stats:
	•	Total books per category
	•	Total revenue potential for:
	•	Aladin drop-off
	•	YES24 parcel

⸻

4.6 UI/UX Requirements

Main screens:
	1.	Home
	•	Scan button
	•	Manual entry field
	•	Link to “My Book List”
	2.	Scanner
	•	Live camera view with target frame
	3.	Result
	•	Title + ISBN
	•	Aladin result
	•	YES24 result
	•	Recommendation
	•	“Add to List” button
	4.	My Book List
	•	Table/card view
	•	Filters + sorting
	•	Summary stats

PWA Requirements:
	•	manifest.json
	•	Service worker (minimal static caching)
	•	iOS installable (home screen integration)

⸻

5. Non-Functional Requirements

5.1 Performance
	•	Total lookup time (network + scraping): ideally 3–5 seconds
	•	Should handle batches of 50–200 books in one session

5.2 Reliability
	•	If scraping fails due to structure changes:
	•	Return partial data with clear error flags
	•	Local list remains intact
	•	Frontend handles error fallback gracefully

5.3 Privacy
	•	No cloud data storage
	•	Local-only storage of scanned books
	•	API transmits only ISBN

⸻

6. Technical Stack

Frontend (PWA)
	•	React or Svelte (lightweight)
	•	Vite build system
	•	Barcode decoding: zxing-js or QuaggaJS
	•	Storage: LocalStorage/IndexedDB

Backend (Serverless)
	•	Cloudflare Workers or Vercel Functions
	•	Node.js with:
	•	axios or fetch
	•	cheerio for HTML parsing
	•	Single endpoint /api/quote
	•	In-memory or KV caching (optional)

⸻

7. Milestones

M1 — Backend (Scraping Core)
	•	Implement /api/quote
	•	Aladin + YES24 scraping completed
	•	Basic caching

M2 — Minimal PWA
	•	Manual ISBN lookup
	•	Result display
	•	Local storage saving
	•	Basic list view

M3 — Barcode Scanning
	•	Camera access
	•	Real-time detection
	•	Hook into lookup flow

M4 — Enhanced List & Stats
	•	Filters, sorting, totals
	•	Minor UX optimizations

This set of milestones produces a fully usable personal tool for scanning and sorting book collections.

