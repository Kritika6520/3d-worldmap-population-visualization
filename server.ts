import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route: Generate AI Census Insights
  app.post('/api/insight', async (req, res) => {
    const { country } = req.body;

    if (!country) {
      return res.status(400).json({ error: 'Country data payload is required' });
    }

    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({
          error: 'GEMINI_API_KEY is not configured on the server. Please check your Secrets settings.'
        });
      }

      // Initialize Google Gen AI client with appropriate headers
      const ai = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      const prompt = `You are a world-class demographic expert and census analyst. Provide an executive summary of the demographic profile, census statistics, and future trends of ${country.name} (${country.id}) located in ${country.continent}.

Statistical Profile:
- Current (2026) census population: ${country.population2026.toLocaleString()} citizens
- Land area: ${country.area.toLocaleString()} sq km
- Population density: ${country.density} people per sq km
- Annual growth rate: ${country.growthRate}%
- Urban population ratio: ${country.urbanPopPct}%
- Median age: ${country.medianAge} years old
- Age Cohorts: Children (0-14): ${country.demographics.age0_14}%, Working-age (15-64): ${country.demographics.age15_64}%, Seniors (65+): ${country.demographics.age65Plus}%
- Languages: ${country.languages.join(', ')}
- Capital: ${country.capital}

Provide a structured analysis in exactly 3 short, bulleted paragraphs:
1. **Current Trajectory**: Explain the population dynamics, density implications, and urban ratio context.
2. **Age Distribution & Work Force**: Analyze the workforce ratio based on the age cohort percentages (whether they face an aging crisis or benefit from a demographic dividend).
3. **2030-2050 Forecast**: Provide realistic future projections based on the growth rate and demographic indicators.

Keep the response highly professional, factual, and formatted as a clean report with bold bullet subheadings. Do not use Markdown headers like '#' or '##'. Keep each paragraph concise.`;

      // Call Gemini 3.5 Flash for the text analysis task
      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: prompt,
      });

      const insight = response.text || 'Demographic analysis is currently unavailable.';
      res.json({ insight });
    } catch (error: any) {
      console.error('Gemini API Error:', error);
      res.status(500).json({ error: error.message || 'An error occurred while generating insights.' });
    }
  });

  // API Route: Health Check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'healthy', time: new Date().toISOString() });
  });

  // Vite Integration
  if (process.env.NODE_ENV !== 'production') {
    console.log('Running server in development mode with Vite Middleware...');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    console.log('Running server in production mode...');
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Express Server listening on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
