import { useState } from 'react';
import { CountryCensus, GlobeTheme, VizMode } from './types';
import { populationData, globalMetrics } from './data/populationData';
import PopulationGlobe from './components/PopulationGlobe';
import CountryDetails from './components/CountryDetails';
import CountryRankings from './components/CountryRankings';
import { Globe, Users, TrendingUp, Compass, Sparkles, Layout, Info, Layers, RefreshCw, Eye } from 'lucide-react';

export default function App() {
  const [selectedCountry, setSelectedCountry] = useState<CountryCensus | null>(
    populationData.find((c) => c.id === 'USA') || null
  );
  const [theme, setTheme] = useState<GlobeTheme>('classic');
  const [vizMode, setVizMode] = useState<VizMode>('spikes');
  const [autoRotate, setAutoRotate] = useState<boolean>(true);
  const [rotationSpeed, setRotationSpeed] = useState<number>(3);
  const [minPopulationFilter, setMinPopulationFilter] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<'profile' | 'rankings'>('profile');

  // Triggering explorer preset
  const handleExploreDefault = () => {
    const usa = populationData.find((c) => c.id === 'USA');
    if (usa) setSelectedCountry(usa);
  };

  // Helper: Formatting large numbers
  const formatNumber = (num: number) => {
    if (num >= 1000000000) return `${(num / 1000000000).toFixed(2)}B`;
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    return num.toLocaleString();
  };

  return (
    <div className="min-h-screen bg-[#05070A] text-white flex flex-col font-sans overflow-x-hidden selection:bg-blue-500 selection:text-black">
      {/* Background Atmosphere Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.06)_0%,transparent_70%)] pointer-events-none" />

      {/* Header Panel */}
      <header className="relative z-10 border-b border-white/10 bg-[#0A0C10]/80 backdrop-blur-md px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-500 rounded-sm flex items-center justify-center font-bold italic text-black">G</div>
            <div>
              <h1 className="text-lg md:text-xl font-medium tracking-tight text-white uppercase font-sans">
                3D WORLD POPULATION <span className="font-thin opacity-50 underline decoration-blue-500 underline-offset-4">GLOBE</span>
              </h1>
              <p className="text-[10px] md:text-xs font-mono text-white/50 tracking-widest uppercase">
                Geopolitical Demographic Intelligence & Census Visualizer
              </p>
            </div>
          </div>

          {/* Real-time Global Census Ledger Ticker */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4 bg-white/5 border border-white/10 backdrop-blur-md px-4 py-2 rounded-xl">
            <div className="flex items-center gap-2">
              <Users className="w-3.5 h-3.5 text-blue-400" />
              <div className="flex flex-col">
                <span className="text-[9px] font-mono text-white/40 uppercase tracking-[0.1em]">Global Pop.</span>
                <span className="text-xs font-semibold font-mono text-blue-100">
                  {formatNumber(globalMetrics.totalPopulation)}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-3.5 h-3.5 text-green-400" />
              <div className="flex flex-col">
                <span className="text-[9px] font-mono text-white/40 uppercase tracking-[0.1em]">World Ann. Δ</span>
                <span className="text-xs font-semibold font-mono text-green-400">
                  +{globalMetrics.growthRate}%
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Compass className="w-3.5 h-3.5 text-blue-300" />
              <div className="flex flex-col">
                <span className="text-[9px] font-mono text-white/40 uppercase tracking-[0.1em]">Urban Ratio</span>
                <span className="text-xs font-semibold font-mono text-blue-100">
                  {globalMetrics.urbanPct}%
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Info className="w-3.5 h-3.5 text-indigo-400" />
              <div className="flex flex-col">
                <span className="text-[9px] font-mono text-white/40 uppercase tracking-[0.1em]">Median Age</span>
                <span className="text-xs font-semibold font-mono text-blue-100">
                  {globalMetrics.medianAge} yrs
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Workspace Dashboard */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Section: 3D Globe Viewer & Render Settings Controls (7 Columns) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-4 flex flex-col h-[400px] md:h-[500px] shadow-2xl relative group overflow-hidden">
            {/* Corner absolute geometric lines for premium feeling */}
            <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-white/20 rounded-tl" />
            <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-white/20 rounded-tr" />
            <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-white/20 rounded-bl" />
            <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-white/20 rounded-br" />

            <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-2">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                <span className="text-[10px] font-mono tracking-[0.15em] uppercase text-white/60 font-bold">
                  Telemetry Feed: Active 3D Orthographic Projection
                </span>
              </div>
              <span className="text-[9px] font-mono text-white/40 tracking-wider">
                DRAG TO SPIN • CLICK COUNTRY
              </span>
            </div>

            {/* Render Globe component */}
            <PopulationGlobe
              selectedCountry={selectedCountry}
              onSelectCountry={setSelectedCountry}
              theme={theme}
              vizMode={vizMode}
              autoRotate={autoRotate}
              rotationSpeed={rotationSpeed}
              minPopulationFilter={minPopulationFilter}
            />
          </div>

          {/* Interactive Controller HUD Panel */}
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-5 shadow-2xl grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Visual themes & rendering modes */}
            <div className="flex flex-col gap-4">
              {/* Globe Theme Selector */}
              <div>
                <label className="text-[10px] font-mono tracking-[0.15em] uppercase text-white/50 font-bold mb-2 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-blue-400" /> Globe Visual Theme
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {(['classic', 'cyberpunk', 'eco', 'vintage'] as GlobeTheme[]).map((t) => (
                    <button
                      key={t}
                      id={`theme_btn_${t}`}
                      onClick={() => setTheme(t)}
                      className={`text-[10px] py-2 rounded-lg font-mono font-bold uppercase transition-all tracking-wide cursor-pointer border ${
                        theme === t
                          ? 'bg-blue-500 border-blue-400 text-black shadow-md shadow-blue-950/45'
                          : 'bg-white/5 border border-white/5 text-white/50 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Visualization Mode Selector */}
              <div>
                <label className="text-[10px] font-mono tracking-[0.15em] uppercase text-white/50 font-bold mb-2 flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-blue-400" /> Population Census Mode
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { id: 'choropleth', label: 'Choropleth' },
                    { id: 'spikes', label: 'Census Spikes' },
                    { id: 'density-dots', label: 'Density Rings' },
                  ].map((mode) => (
                    <button
                      key={mode.id}
                      id={`mode_btn_${mode.id}`}
                      onClick={() => setVizMode(mode.id as VizMode)}
                      className={`text-[10px] py-2 rounded-lg font-mono font-bold uppercase transition-all tracking-wide cursor-pointer border ${
                        vizMode === mode.id
                          ? 'bg-blue-500 border-blue-400 text-black shadow-md shadow-blue-950/45'
                          : 'bg-white/5 border border-white/5 text-white/50 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      {mode.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Spin settings & filter filters */}
            <div className="flex flex-col gap-4">
              {/* Rotation controller */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[10px] font-mono tracking-[0.15em] uppercase text-white/50 font-bold flex items-center gap-1.5">
                    <RefreshCw className="w-3.5 h-3.5 text-blue-400" /> Kinetic Auto-Rotation
                  </label>
                  <input
                    id="auto_rotate_toggle"
                    type="checkbox"
                    checked={autoRotate}
                    onChange={(e) => setAutoRotate(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-500 border-white/10 bg-[#0A0C10] accent-blue-500 cursor-pointer"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[9px] font-mono text-white/40 uppercase tracking-wider">Slow</span>
                  <input
                    id="rotation_speed_slider"
                    type="range"
                    min="1"
                    max="10"
                    value={rotationSpeed}
                    disabled={!autoRotate}
                    onChange={(e) => setRotationSpeed(parseInt(e.target.value))}
                    className="flex-1 h-1 bg-[#05070A] rounded-lg appearance-none cursor-pointer accent-blue-500 disabled:opacity-30"
                  />
                  <span className="text-[9px] font-mono text-white/40 uppercase tracking-wider">Fast</span>
                </div>
              </div>

              {/* Population Census Filter threshold */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[10px] font-mono tracking-[0.15em] uppercase text-white/50 font-bold flex items-center gap-1.5">
                    <Layout className="w-3.5 h-3.5 text-blue-400" /> Pop. Cutoff Threshold
                  </label>
                  <span className="text-[10px] font-mono font-bold text-blue-400">
                    {minPopulationFilter === 0 ? 'Show All' : `≥ ${formatNumber(minPopulationFilter)}`}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[9px] font-mono text-white/40 uppercase tracking-wider">0</span>
                  <input
                    id="population_cutoff_slider"
                    type="range"
                    min="0"
                    max="150000000" // 150 Million cutoff
                    step="10000000"
                    value={minPopulationFilter}
                    onChange={(e) => setMinPopulationFilter(parseInt(e.target.value))}
                    className="flex-1 h-1 bg-[#05070A] rounded-lg appearance-none cursor-pointer accent-blue-500"
                  />
                  <span className="text-[9px] font-mono text-white/40 uppercase tracking-wider">150M</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Section: Interactive Tabbed Panel (Country Profile vs Rankings Ledger - 5 Columns) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {/* Custom Tabs Navigation */}
          <div className="flex bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-1.5 select-none shadow-xl">
            <button
              id="tab_profile"
              onClick={() => setActiveTab('profile')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold tracking-wider transition-all cursor-pointer ${
                activeTab === 'profile'
                  ? 'bg-blue-500/10 border border-blue-500/30 text-blue-400 shadow-inner'
                  : 'text-white/50 hover:text-white hover:bg-white/5'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              CENSUS PROFILE
            </button>
            <button
              id="tab_rankings"
              onClick={() => setActiveTab('rankings')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold tracking-wider transition-all cursor-pointer ${
                activeTab === 'rankings'
                  ? 'bg-blue-500/10 border border-blue-500/30 text-blue-400 shadow-inner'
                  : 'text-white/50 hover:text-white hover:bg-white/5'
              }`}
            >
              <Layout className="w-3.5 h-3.5" />
              RANKINGS LEDGER
            </button>
          </div>

          {/* Tab contents */}
          <div className="flex-1">
            {activeTab === 'profile' ? (
              <CountryDetails
                country={selectedCountry}
                onExploreDefault={handleExploreDefault}
              />
            ) : (
              <CountryRankings
                onSelectCountry={(country) => {
                  setSelectedCountry(country);
                  setActiveTab('profile'); // Auto switch to profile when clicked
                }}
                selectedCountry={selectedCountry}
              />
            )}
          </div>
        </div>
      </main>

      {/* Decorative footer credentials */}
      <footer className="relative z-10 border-t border-white/10 bg-[#0A0C10] py-4 text-center text-[10px] font-mono text-white/40 select-none">
        <p>© 2026 World Population Census Control Center. Powered by AI Studio & Gemini.</p>
      </footer>
    </div>
  );
}
