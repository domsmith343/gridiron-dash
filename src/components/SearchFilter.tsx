import React, { useState, useEffect } from 'react';
import { teams } from '../services/mockData';
import type { GameStatus } from '../types/game';

interface SearchFilterProps {
  className?: string;
  onFilterChange: (filters: FilterOptions) => void;
}

export interface FilterOptions {
  searchQuery: string;
  teamId?: string;
  status?: GameStatus;
}

const SearchFilter: React.FC<SearchFilterProps> = ({ className = '', onFilterChange }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTeam, setSelectedTeam] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<GameStatus | ''>('');

  // Apply filters when any filter option changes
  useEffect(() => {
    const filters: FilterOptions = {
      searchQuery
    };
    
    if (selectedTeam) {
      filters.teamId = selectedTeam;
    }
    
    if (selectedStatus) {
      filters.status = selectedStatus as GameStatus;
    }
    
    onFilterChange(filters);
  }, [searchQuery, selectedTeam, selectedStatus, onFilterChange]);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedTeam('');
    setSelectedStatus('');
  };

  return (
    <div className={`search-filter ${className}`}>
      {/* Search Bar */}
      <div className="relative">
        <input 
          type="search" 
          placeholder="Search teams, players..." 
          className="w-full md:w-64 pl-10 pr-4 py-2 rounded-full bg-white/80 dark:bg-gray-800/80 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        
        {/* Filter Toggle Button */}
        <button 
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400"
          onClick={toggleExpand}
          aria-label="Toggle filters"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
      
      {/* Expanded Filter Options */}
      {isExpanded && (
        <div className="mt-2 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Team Filter */}
            <div>
              <label htmlFor="team-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Team
              </label>
              <select
                id="team-filter"
                className="w-full p-2 rounded bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600"
                value={selectedTeam}
                onChange={(e) => setSelectedTeam(e.target.value)}
              >
                <option value="">All Teams</option>
                {teams.map((team) => (
                  <option key={team.id} value={team.id}>
                    {team.city} {team.name}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Status Filter */}
            <div>
              <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Game Status
              </label>
              <select
                id="status-filter"
                className="w-full p-2 rounded bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value as GameStatus | '')}
              >
                <option value="">All Statuses</option>
                <option value="LIVE">Live</option>
                <option value="FINAL">Final</option>
                <option value="UPCOMING">Upcoming</option>
                <option value="SCHEDULED">Scheduled</option>
                <option value="POSTPONED">Postponed</option>
              </select>
            </div>
            
            {/* Clear Filters Button */}
            <div className="flex items-end">
              <button
                onClick={clearFilters}
                className="w-full p-2 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 rounded text-gray-700 dark:text-gray-200 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchFilter;
