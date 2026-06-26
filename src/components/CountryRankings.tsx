import { useState } from 'react';
import { CountryCensus } from '../types';
import { populationData } from '../data/populationData';
import { Search, SlidersHorizontal, ArrowUpDown, Globe, HelpCircle } from 'lucide-react';

interface CountryRankingsProps {
  onSelectCountry: (country: CountryCensus) => void;
  selectedCountry: CountryCensus | null;
}

type SortField = 'rank' | 'name' | 'population' | 'density' | 'growthRate';
type SortOrder = 'asc' | 'desc';

export default function CountryRankings({ onSelectCountry, selectedCountry }: CountryRankingsProps) {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedContinent, setSelectedContinent] = useState<string>('All');
  const [sortField, setSortField] = useState<SortField>('population');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  // Available continents
  const continents = ['All', 'Asia', 'Europe', 'North America', 'South America', 'Africa', 'Oceania'];

  // Toggle sort fields
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc'); // default to descending for numbers
    }
  };

  // Filter & sort list of countries
  const filteredCountries = populationData
    .filter((c) => {
      const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            c.id.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesContinent = selectedContinent === 'All' || c.continent === selectedContinent;
      return matchesSearch && matchesContinent;
    })
    .sort((a, b) => {
      let comparison = 0;
      if (sortField === 'rank' || sortField === 'population') {
        comparison = a.population2026 - b.population2026;
      } else if (sortField === 'name') {
        comparison = a.name.localeCompare(b.name);
      } else if (sortField === 'density') {
        comparison = a.density - b.density;
      } else if (sortField === 'growthRate') {
        comparison = a.growthRate - b.growthRate;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

  // Calculate rank based on full sorted dataset of population
  const getGlobalRank = (countryId: string) => {
    const sorted = [...populationData].sort((a, b) => b.population2026 - a.population2026);
    return sorted.findIndex((c) => c.id === countryId) + 1;
  };

  return (
    <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-5 shadow-2xl flex flex-col h-full gap-4">
      {/* Filtering Controls */}
      <div className="flex flex-col gap-3">
        <h3 className="text-sm font-semibold tracking-wider font-mono uppercase text-white/80 flex items-center gap-2">
          <Globe className="w-4 h-4 text-blue-400" /> Census Ledger & Rankings
        </h3>

        {/* Search input */}
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-white/30" />
          <input
            id="country_search_input"
            type="text"
            placeholder="Search country name or code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-[#0A0C10] border border-white/10 rounded-xl text-xs text-white placeholder-white/40 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all font-sans"
          />
        </div>

        {/* Continent Filter pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 scrollbar-thin select-none">
          {continents.map((continent) => (
            <button
              key={continent}
              id={`filter_${continent.toLowerCase().replace(' ', '_')}`}
              onClick={() => setSelectedContinent(continent)}
              className={`text-[10px] font-medium tracking-wide px-2.5 py-1 rounded-lg border transition-all cursor-pointer whitespace-nowrap ${
                selectedContinent === continent
                  ? 'bg-blue-500 border-blue-400 text-black font-semibold shadow-lg shadow-blue-950/35'
                  : 'bg-white/5 border border-white/5 text-white/50 hover:text-white hover:bg-white/10'
              }`}
            >
              {continent}
            </button>
          ))}
        </div>
      </div>

      {/* Table Headers / Sort buttons */}
      <div className="grid grid-cols-12 px-3 py-2 bg-white/5 border border-white/5 rounded-lg text-[10px] font-mono tracking-wider text-white/40 uppercase select-none gap-2">
        <button
          onClick={() => handleSort('rank')}
          className="col-span-2 text-left hover:text-white/80 flex items-center gap-1 cursor-pointer"
        >
          RANK {sortField === 'rank' && <ArrowUpDown className="w-3 h-3 text-blue-400" />}
        </button>
        <button
          onClick={() => handleSort('name')}
          className="col-span-4 text-left hover:text-white/80 flex items-center gap-1 cursor-pointer"
        >
          COUNTRY {sortField === 'name' && <ArrowUpDown className="w-3 h-3 text-blue-400" />}
        </button>
        <button
          onClick={() => handleSort('population')}
          className="col-span-3 text-right hover:text-white/80 flex items-center gap-1 justify-end cursor-pointer"
        >
          CENSUS {sortField === 'population' && <ArrowUpDown className="w-3 h-3 text-blue-400" />}
        </button>
        <button
          onClick={() => handleSort('growthRate')}
          className="col-span-3 text-right hover:text-white/80 flex items-center gap-1 justify-end cursor-pointer"
        >
          ANN. Δ {sortField === 'growthRate' && <ArrowUpDown className="w-3 h-3 text-blue-400" />}
        </button>
      </div>

      {/* Rankings Rows */}
      <div className="flex-1 overflow-y-auto max-h-[380px] custom-scrollbar flex flex-col gap-1.5 pr-1">
        {filteredCountries.length > 0 ? (
          filteredCountries.map((c) => {
            const isSelected = selectedCountry?.id === c.id;
            const rank = getGlobalRank(c.id);

            return (
              <div
                key={c.id}
                id={`ranking_row_${c.id}`}
                onClick={() => onSelectCountry(c)}
                className={`grid grid-cols-12 px-3 py-2.5 rounded-xl border transition-all cursor-pointer items-center text-xs gap-2 ${
                  isSelected
                    ? 'bg-white/10 border-blue-500/50 text-white shadow-inner'
                    : 'bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 text-white/80'
                }`}
              >
                {/* Rank Badge */}
                <span className="col-span-2 font-mono text-[10px] font-bold text-white/40 flex items-center">
                  #{rank}
                </span>

                {/* Flag + Name */}
                <div className="col-span-4 flex items-center gap-2 font-medium truncate">
                  <span className="text-lg select-none shrink-0">
                    {String.fromCodePoint(...c.code.toUpperCase().split('').map(char => 127397 + char.charCodeAt(0)))}
                  </span>
                  <span className="truncate" title={c.name}>{c.name}</span>
                </div>

                {/* Census population */}
                <span className="col-span-3 text-right font-mono font-medium text-white/90">
                  {c.population2026 >= 1000000000
                    ? `${(c.population2026 / 1000000000).toFixed(2)}B`
                    : `${(c.population2026 / 1000000).toFixed(1)}M`}
                </span>

                {/* Growth Rate */}
                <span className={`col-span-3 text-right font-mono text-[11px] font-bold ${
                  c.growthRate >= 0 ? 'text-green-400' : 'text-red-400'
                }`}>
                  {c.growthRate > 0 ? '+' : ''}
                  {c.growthRate.toFixed(2)}%
                </span>
              </div>
            );
          })
        ) : (
          <div className="text-center py-10 text-white/30 font-mono text-xs border border-dashed border-white/10 rounded-xl">
            No record matches filter search query
          </div>
        )}
      </div>

      {/* Footnote instruction */}
      <div className="text-[10px] text-white/40 font-mono text-center pt-2 border-t border-white/10 flex items-center justify-center gap-1.5">
        <HelpCircle className="w-3 h-3 text-white/20" />
        <span>Click country to target rotation vector on 3D Earth.</span>
      </div>
    </div>
  );
}
