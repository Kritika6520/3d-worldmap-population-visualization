# 🌐 3D World Population Globe & Demographic Intelligence Atlas

A sophisticated, full-stack demographic intelligence platform that merges an interactive 3D orthographic Earth projection with server-side generative AI to provide real-time, curated demographic audits. 

## Features

* Interactive 3D orthographic Earth visualization
* Population density and demographic data visualization
* AI-generated demographic analysis and future population forecasts
* Country search, rankings, and historical population charts
* Multiple UI themes and globe controls
* Secure backend API integration with Gemini

## Tech Stack

* React + Vite
* Express.js
* Tailwind CSS
* D3.js & TopoJSON
* Recharts
* Google Gemini API

## Setup

```bash
npm install
```

Create a `.env` file:

```env
GEMINI_API_KEY=your_api_key
```

Run the project:

```bash
npm run dev
```

Open:

```
http://localhost:3000
```

## Production

Build:

```bash
npm run build
```

Run:

```bash
npm start
```

## Project Structure

```
src/
├── components/
│   ├── PopulationGlobe.tsx
│   ├── CountryDetails.tsx
│   └── CountryRankings.tsx
├── data/
├── App.tsx
├── main.tsx
└── types.ts

server.ts
package.json
vite.config.ts
```

## License

MIT License.

