import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import Starfield from './components/Starfield.jsx';
import Planet from './components/Planet.jsx';
import { API_BASE } from './config.js';

export default function App() {
  const [status, setStatus] = useState('checking...');
  const [phase, setPhase] = useState('search');
  const [query, setQuery] = useState('');
  const [activeTopic, setActiveTopic] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debounceRef = useRef(null);

  useEffect(() => {
    axios.get(`${API_BASE}/api/health`)
      .then(res => setStatus(res.data.message))
      .catch(() => setStatus('Backend not reachable'));
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }
    debounceRef.current = setTimeout(() => {
      axios.get(`${API_BASE}/api/topics/search`, { params: { q: query.trim() } })
        .then((res) => setSuggestions(res.data))
        .catch(() => setSuggestions([]));
    }, 250);
    return () => clearTimeout(debounceRef.current);
  }, [query]);

  function slugify(term) {
    return term.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }

  function explore(term) {
    const key = slugify(term);
    if (!key) return;
    setShowSuggestions(false);
    setPhase('warping');
    setTimeout(() => {
      setActiveTopic(key);
      setPhase('planet');
    }, 1400);
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (suggestions.length > 0) {
      explore(suggestions[0].slug);
    } else {
      explore(query);
    }
  }

  function handleBack() {
    setPhase('search');
    setQuery('');
    setActiveTopic(null);
    setSuggestions([]);
  }

  return (
    <div className="relative w-screen h-screen overflow-hidden text-white">
      <Starfield warping={phase === 'warping'} />

      {phase === 'search' && (
        <div className="relative z-10 w-full h-full flex flex-col items-center justify-center">
          <p className="text-sm text-gray-400 mb-6">{status}</p>
          <p className="text-gray-300 mb-3">Search anything</p>

          <form onSubmit={handleSubmit} className="relative">
            <input
              type="text"
              value={query}
              onChange={(e) => { setQuery(e.target.value); setShowSuggestions(true); }}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
              placeholder="Search any topic, person, or place..."
              className="w-80 h-10 bg-white/5 border border-white/20 rounded-lg px-4 text-sm text-white placeholder-gray-500 outline-none focus:border-white/40"
              autoFocus
            />
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-12 left-0 w-80 bg-black/90 border border-white/15 rounded-lg overflow-hidden backdrop-blur-sm">
                {suggestions.map((s) => (
                  <button
                    key={s.slug}
                    type="button"
                    onMouseDown={() => explore(s.slug)}
                    className="w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-white/10 flex items-center gap-2"
                  >
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: s.color }} />
                    {s.title}
                  </button>
                ))}
              </div>
            )}
          </form>
          <p className="text-xs text-gray-600 mt-4">Powered by Wikipedia — search anything that has a Wikipedia article</p>
        </div>
      )}

      {phase === 'warping' && (
        <div className="relative z-10 w-full h-full flex items-center justify-center">
          <p className="text-sm tracking-[0.3em] text-purple-300 animate-pulse">WARPING</p>
        </div>
      )}

      {phase === 'planet' && (
        <Planet topicKey={activeTopic} onTravel={explore} onBack={handleBack} />
      )}
    </div>
  );
}
