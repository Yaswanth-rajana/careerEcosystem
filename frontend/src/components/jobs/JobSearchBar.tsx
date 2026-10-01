import React, { useState, useEffect } from 'react';
import { Search, MapPin, X, ArrowRight } from 'lucide-react';
import { Button } from '@/components/design-system/Button';

interface Props {
  initialQuery?: string;
  initialLocation?: string;
  onSearch: (q: string, location: string) => void;
  className?: string;
}

export const JobSearchBar: React.FC<Props> = ({
  initialQuery = '',
  initialLocation = '',
  onSearch,
  className,
}) => {
  const [q, setQ] = useState(initialQuery);
  const [location, setLocation] = useState(initialLocation);

  useEffect(() => {
    setQ(initialQuery);
  }, [initialQuery]);

  useEffect(() => {
    setLocation(initialLocation);
  }, [initialLocation]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(q.trim(), location.trim());
  };

  const handleClearQ = () => {
    setQ('');
    onSearch('', location.trim());
  };

  const handleClearLocation = () => {
    setLocation('');
    onSearch(q.trim(), '');
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={`bg-white rounded-2xl border border-slate-200/90 shadow-sm p-2 sm:p-2.5 flex flex-col md:flex-row items-center gap-2 ${
        className || ''
      }`}
    >
      {/* Query Input */}
      <div className="relative flex-1 w-full flex items-center">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
        <input
          type="text"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search jobs, skills, companies..."
          className="w-full pl-10 pr-9 py-2.5 text-sm font-medium text-slate-900 placeholder:text-slate-400 bg-transparent rounded-xl focus:outline-none"
        />
        {q && (
          <button
            type="button"
            onClick={handleClearQ}
            className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 absolute right-2.5"
            aria-label="Clear job query"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      <div className="hidden md:block w-px h-7 bg-slate-200" />

      {/* Location Input */}
      <div className="relative flex-1 md:max-w-xs w-full flex items-center">
        <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
        <input
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="City, state, or Remote"
          className="w-full pl-10 pr-9 py-2.5 text-sm font-medium text-slate-900 placeholder:text-slate-400 bg-transparent rounded-xl focus:outline-none"
        />
        {location && (
          <button
            type="button"
            onClick={handleClearLocation}
            className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 absolute right-2.5"
            aria-label="Clear location"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        variant="primary"
        size="md"
        className="w-full md:w-auto px-5 py-2.5 text-xs sm:text-sm font-semibold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shrink-0"
        rightIcon={<ArrowRight className="w-4 h-4" />}
      >
        Search
      </Button>
    </form>
  );
};
