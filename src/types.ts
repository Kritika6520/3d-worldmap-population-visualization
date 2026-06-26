export interface CountryDemographics {
  age0_14: number; // percentage
  age15_64: number; // percentage
  age65Plus: number; // percentage
}

export interface CountryCensus {
  id: string; // ISO3 code, e.g., "USA"
  name: string;
  code: string; // ISO2 code, e.g., "US"
  continent: string;
  population2026: number;
  population2020: number;
  population2010: number;
  population2000: number;
  population1990: number;
  area: number; // square km
  density: number; // people per sq km
  growthRate: number; // % annual growth
  urbanPopPct: number; // % of urban population
  medianAge: number;
  capital: string;
  demographics: CountryDemographics;
  languages: string[];
}

export interface GlobalMetrics {
  totalPopulation: number;
  averageDensity: number;
  growthRate: number;
  urbanPct: number;
  medianAge: number;
}

export type GlobeTheme = 'classic' | 'cyberpunk' | 'vintage' | 'eco';

export type VizMode = 'choropleth' | 'spikes' | 'density-dots';
