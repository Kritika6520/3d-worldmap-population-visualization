import { useState, useEffect } from 'react';
import { CountryCensus } from '../types';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar, Cell } from 'recharts';
import { Users, TrendingUp, Compass, Globe, Sparkles, Building, Landmark, Languages, AlertCircle, Loader2, RotateCw } from 'lucide-react';

interface CountryDetailsProps {
  country: CountryCensus | null;
  onExploreDefault: () => void;
}

export default function CountryDetails({ country, onExploreDefault }: CountryDetailsProps) {
  const [aiInsight, setAiInsight] = useState<string>('');
  const [loadingInsight, setLoadingInsight] = useState<boolean>(false);
  const [insightError, setInsightError] = useState<string>('');

  // Clear previous insight when country changes
  useEffect(() => {
    setAiInsight('');
    setInsightError('');
  }, [country]);

  if (!country) {
    return (
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-8 flex flex-col items-center justify-center text-center h-full min-h-[350px]">
        <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-blue-400 mb-4 animate-pulse">
          <Globe className="w-8 h-8 text-blue-400" />
        </div>
        <h3 className="text-lg font-medium tracking-tight text-white mb-2">No Country Selected</h3>
        <p className="text-sm text-white/60 max-w-sm mb-6 leading-relaxed">
          Spin the interactive 3D globe and click on any country, or select from the ranking list to visualize custom population census profiles.
        </p>
        <button
          onClick={onExploreDefault}
          className="px-5 py-2.5 bg-blue-500 hover:bg-blue-600 text-black font-semibold rounded-xl text-xs tracking-wider transition-all shadow-lg shadow-blue-950/40 cursor-pointer flex items-center gap-1.5"
        >
          <Sparkles className="w-3.5 h-3.5" />
          EXPLORE UNITED STATES
        </button>
      </div>
    );
  }

  // Formatting large numbers for readable view
  const formatPopulation = (num: number) => {
    if (num >= 1000000000) return `${(num / 1000000000).toFixed(2)} Billion`;
    return `${(num / 1000000).toFixed(1)} Million`;
  };

  // Prepping trend data for Recharts
  const trendData = [
    { year: '1990', population: country.population1990 / 1000000 },
    { year: '2000', population: country.population2000 / 1000000 },
    { year: '2010', population: country.population2010 / 1000000 },
    { year: '2020', population: country.population2020 / 1000000 },
    { year: '2026', population: country.population2026 / 1000000 },
  ];

  // Prepping age demographics data
  const ageData = [
    { name: 'Under 15', value: country.demographics.age0_14, color: '#60a5fa' },
    { name: 'Active (15-64)', value: country.demographics.age15_64, color: '#3b82f6' },
    { name: 'Senior (65+)', value: country.demographics.age65Plus, color: '#4f46e5' },
  ];

  // Fetch AI Insight from server API
  const fetchDemographicInsight = async () => {
    setLoadingInsight(true);
    setInsightError('');
    setAiInsight('');

    try {
      const response = await fetch('/api/insight', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ country }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch demographic insight report');
      }

      const data = await response.json();
      setAiInsight(data.insight);
    } catch (err: any) {
      console.error(err);
      setInsightError(err.message || 'Error loading demographic report. Please try again.');
    } finally {
      setLoadingInsight(false);
    }
  };

  return (
    <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-5 md:p-6 flex flex-col gap-6 shadow-2xl h-full">
      {/* Flag / Header Card */}
      <div className="flex items-start justify-between border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <span className="text-4xl shadow-md cursor-default select-none" title={`${country.name} Flag`}>
              {/* Flag emoji dynamically constructed from country code */}
              {String.fromCodePoint(...country.code.toUpperCase().split('').map(char => 127397 + char.charCodeAt(0)))}
            </span>
            <span className="absolute -bottom-1 -right-1 bg-[#0A0C10] border border-white/10 text-[9px] font-mono font-bold text-blue-400 px-1 rounded">
              {country.id}
            </span>
          </div>
          <div>
            <h2 className="text-xl font-medium tracking-tight text-white flex items-center gap-2">
              {country.name}
            </h2>
            <div className="flex items-center gap-3 text-xs text-white/50 font-mono mt-0.5">
              <span className="flex items-center gap-1">
                <Landmark className="w-3 h-3 text-white/30" />
                Capital: {country.capital}
              </span>
              <span>•</span>
              <span className="text-blue-400">{country.continent}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid statistics metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white/5 p-3.5 rounded-xl border border-white/5 flex flex-col gap-1">
          <span className="text-[10px] font-mono tracking-wider text-white/40 uppercase flex items-center gap-1">
            <Users className="w-3 h-3 text-blue-400" /> Census (2026)
          </span>
          <span className="text-base font-semibold text-white font-sans">
            {formatPopulation(country.population2026)}
          </span>
        </div>

        <div className="bg-white/5 p-3.5 rounded-xl border border-white/5 flex flex-col gap-1">
          <span className="text-[10px] font-mono tracking-wider text-white/40 uppercase flex items-center gap-1">
            <TrendingUp className="w-3 h-3 text-green-400" /> Growth Rate
          </span>
          <span className={`text-base font-semibold font-sans ${country.growthRate >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {country.growthRate > 0 ? '+' : ''}
            {country.growthRate.toFixed(2)}%
          </span>
        </div>

        <div className="bg-white/5 p-3.5 rounded-xl border border-white/5 flex flex-col gap-1">
          <span className="text-[10px] font-mono tracking-wider text-white/40 uppercase flex items-center gap-1">
            <Compass className="w-3 h-3 text-blue-300" /> Pop. Density
          </span>
          <span className="text-base font-semibold text-white font-sans">
            {country.density.toLocaleString()}/km²
          </span>
        </div>

        <div className="bg-white/5 p-3.5 rounded-xl border border-white/5 flex flex-col gap-1">
          <span className="text-[10px] font-mono tracking-wider text-white/40 uppercase flex items-center gap-1">
            <Building className="w-3 h-3 text-indigo-400" /> Urban Ratio
          </span>
          <span className="text-base font-semibold text-white font-sans">
            {country.urbanPopPct.toFixed(1)}%
          </span>
        </div>
      </div>

      {/* Charts Section: Row layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recharts Area Chart: Historical Trend */}
        <div className="bg-white/5 p-4 rounded-xl border border-white/5 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-mono tracking-wider uppercase text-white/70">Historical Census Curve</h4>
            <span className="text-[10px] font-mono text-white/40">(1990 - 2026, Millions)</span>
          </div>
          <div className="h-[180px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 5, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="popTrendGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" />
                <XAxis dataKey="year" stroke="rgba(255, 255, 255, 0.3)" fontSize={10} fontFamily="monospace" />
                <YAxis stroke="rgba(255, 255, 255, 0.3)" fontSize={10} fontFamily="monospace" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0A0C10', borderColor: 'rgba(255, 255, 255, 0.1)', borderRadius: '8px' }}
                  labelStyle={{ fontFamily: 'monospace', color: 'rgba(255, 255, 255, 0.5)' }}
                  itemStyle={{ color: '#60a5fa', fontSize: '12px' }}
                  formatter={(value: any) => [`${parseFloat(value).toFixed(1)}M`, 'Population']}
                />
                <Area type="monotone" dataKey="population" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#popTrendGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recharts Bar Chart: Age Demographics */}
        <div className="bg-white/5 p-4 rounded-xl border border-white/5 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-mono tracking-wider uppercase text-white/70">Age Cohort Demographics</h4>
            <span className="text-[10px] font-mono text-white/40">(% of total population)</span>
          </div>
          <div className="h-[180px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ageData} margin={{ top: 10, right: 5, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" />
                <XAxis dataKey="name" stroke="rgba(255, 255, 255, 0.3)" fontSize={10} />
                <YAxis stroke="rgba(255, 255, 255, 0.3)" fontSize={10} fontFamily="monospace" unit="%" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0A0C10', borderColor: 'rgba(255, 255, 255, 0.1)', borderRadius: '8px' }}
                  itemStyle={{ fontSize: '12px' }}
                  formatter={(value: any) => [`${value}%`, 'Ratio']}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {ageData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Languages & Extras */}
      <div className="bg-white/5 p-4 rounded-xl border border-white/5 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <Languages className="w-4 h-4 text-white/30" />
          <span className="text-white/50 font-mono">Spoken Languages:</span>
          <div className="flex flex-wrap gap-1.5 ml-1">
            {country.languages.map((lang, idx) => (
              <span key={idx} className="bg-white/5 border border-white/5 text-white/80 px-2 py-0.5 rounded-md font-medium text-[11px]">
                {lang}
              </span>
            ))}
          </div>
        </div>
        <div className="text-white/40 font-mono text-[10px]">
          Median Age: <span className="text-white font-sans font-bold">{country.medianAge} yrs</span>
        </div>
      </div>

      {/* AI Census Analyst & Report Generator */}
      <div className="border-t border-white/10 pt-5 mt-auto flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            <span className="text-xs font-mono font-bold tracking-wider uppercase text-blue-400 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 animate-spin-slow text-blue-400" /> AI Demographic Analyst
            </span>
          </div>
          {!aiInsight && (
            <button
              onClick={fetchDemographicInsight}
              disabled={loadingInsight}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-black font-semibold rounded-lg text-xs tracking-wider transition-all flex items-center gap-1.5 cursor-pointer shadow-md hover:shadow-blue-500/10"
            >
              {loadingInsight ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-black" />
                  ANALYZING...
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-black" />
                  GENERATE AI REPORT
                </>
              )}
            </button>
          )}
        </div>

        {loadingInsight && (
          <div className="bg-[#05070A]/80 border border-white/10 rounded-xl p-4 flex flex-col items-center justify-center text-center gap-2.5 min-h-[100px] animate-pulse">
            <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
            <p className="text-[11px] font-mono text-blue-400 tracking-wide">
              Retrieving global registry... querying demographic projections...
            </p>
          </div>
        )}

        {insightError && (
          <div className="bg-red-950/30 border border-red-900/30 text-red-300 p-3.5 rounded-xl text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <p className="leading-normal">{insightError}</p>
          </div>
        )}

        {aiInsight && (
          <div className="bg-[#05070A]/50 border border-white/10 rounded-xl p-4 text-xs text-white/80 leading-relaxed font-sans max-h-[220px] overflow-y-auto custom-scrollbar flex flex-col gap-2">
            <div className="whitespace-pre-line prose prose-invert font-normal text-white/80">
              {aiInsight}
            </div>
            <button
              onClick={fetchDemographicInsight}
              disabled={loadingInsight}
              className="text-[10px] font-mono font-bold text-white/40 hover:text-blue-400 self-end mt-2 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <RotateCw className="w-3 h-3" /> Regenerate Analysis
            </button>
          </div>
        )}

        {!aiInsight && !loadingInsight && (
          <p className="text-[11px] text-white/60 leading-relaxed font-sans italic bg-white/5 px-3.5 py-3 rounded-xl border border-white/5">
            Generate an instant, on-demand AI report covering structural population changes, urban migration triggers, and demographic forecast analysis powered by Gemini.
          </p>
        )}
      </div>
    </div>
  );
}
