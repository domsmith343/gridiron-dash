import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import type { Player, Team, Game } from '../types';

interface AppState {
  selectedPlayer: Player | null;
  selectedTeam: Team | null;
  currentWeek: number;
  currentSeason: number;
  favorites: {
    players: string[];
    teams: string[];
  };
  settings: {
    theme: 'light' | 'dark' | 'system';
    notifications: boolean;
    autoRefresh: boolean;
    refreshInterval: number;
  };
  ui: {
    sidebarOpen: boolean;
    filterPanelOpen: boolean;
    loading: boolean;
    error: string | null;
  };
}

type AppAction =
  | { type: 'SET_SELECTED_PLAYER'; payload: Player | null }
  | { type: 'SET_SELECTED_TEAM'; payload: Team | null }
  | { type: 'SET_CURRENT_WEEK'; payload: number }
  | { type: 'SET_CURRENT_SEASON'; payload: number }
  | { type: 'ADD_FAVORITE_PLAYER'; payload: string }
  | { type: 'REMOVE_FAVORITE_PLAYER'; payload: string }
  | { type: 'ADD_FAVORITE_TEAM'; payload: string }
  | { type: 'REMOVE_FAVORITE_TEAM'; payload: string }
  | { type: 'UPDATE_SETTINGS'; payload: Partial<AppState['settings']> }
  | { type: 'TOGGLE_SIDEBAR' }
  | { type: 'TOGGLE_FILTER_PANEL' }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'RESET_ERROR' };

const initialState: AppState = {
  selectedPlayer: null,
  selectedTeam: null,
  currentWeek: 1,
  currentSeason: new Date().getFullYear(),
  favorites: {
    players: JSON.parse(localStorage.getItem('favoritePlayers') || '[]'),
    teams: JSON.parse(localStorage.getItem('favoriteTeams') || '[]'),
  },
  settings: {
    theme: (localStorage.getItem('theme') as AppState['settings']['theme']) || 'system',
    notifications: localStorage.getItem('notifications') !== 'false',
    autoRefresh: localStorage.getItem('autoRefresh') !== 'false',
    refreshInterval: parseInt(localStorage.getItem('refreshInterval') || '30000'),
  },
  ui: {
    sidebarOpen: false,
    filterPanelOpen: false,
    loading: false,
    error: null,
  },
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_SELECTED_PLAYER':
      return { ...state, selectedPlayer: action.payload };
    
    case 'SET_SELECTED_TEAM':
      return { ...state, selectedTeam: action.payload };
    
    case 'SET_CURRENT_WEEK':
      return { ...state, currentWeek: action.payload };
    
    case 'SET_CURRENT_SEASON':
      return { ...state, currentSeason: action.payload };
    
    case 'ADD_FAVORITE_PLAYER':
      const newPlayerFavorites = [...state.favorites.players, action.payload];
      localStorage.setItem('favoritePlayers', JSON.stringify(newPlayerFavorites));
      return {
        ...state,
        favorites: { ...state.favorites, players: newPlayerFavorites },
      };
    
    case 'REMOVE_FAVORITE_PLAYER':
      const filteredPlayerFavorites = state.favorites.players.filter(id => id !== action.payload);
      localStorage.setItem('favoritePlayers', JSON.stringify(filteredPlayerFavorites));
      return {
        ...state,
        favorites: { ...state.favorites, players: filteredPlayerFavorites },
      };
    
    case 'ADD_FAVORITE_TEAM':
      const newTeamFavorites = [...state.favorites.teams, action.payload];
      localStorage.setItem('favoriteTeams', JSON.stringify(newTeamFavorites));
      return {
        ...state,
        favorites: { ...state.favorites, teams: newTeamFavorites },
      };
    
    case 'REMOVE_FAVORITE_TEAM':
      const filteredTeamFavorites = state.favorites.teams.filter(id => id !== action.payload);
      localStorage.setItem('favoriteTeams', JSON.stringify(filteredTeamFavorites));
      return {
        ...state,
        favorites: { ...state.favorites, teams: filteredTeamFavorites },
      };
    
    case 'UPDATE_SETTINGS':
      const newSettings = { ...state.settings, ...action.payload };
      Object.entries(newSettings).forEach(([key, value]) => {
        localStorage.setItem(key, String(value));
      });
      return { ...state, settings: newSettings };
    
    case 'TOGGLE_SIDEBAR':
      return { ...state, ui: { ...state.ui, sidebarOpen: !state.ui.sidebarOpen } };
    
    case 'TOGGLE_FILTER_PANEL':
      return { ...state, ui: { ...state.ui, filterPanelOpen: !state.ui.filterPanelOpen } };
    
    case 'SET_LOADING':
      return { ...state, ui: { ...state.ui, loading: action.payload } };
    
    case 'SET_ERROR':
      return { ...state, ui: { ...state.ui, error: action.payload } };
    
    case 'RESET_ERROR':
      return { ...state, ui: { ...state.ui, error: null } };
    
    default:
      return state;
  }
}

const AppStateContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
} | null>(null);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  return (
    <AppStateContext.Provider value={{ state, dispatch }}>
      {children}
    </AppStateContext.Provider>
  );
}

export function useAppState() {
  const context = useContext(AppStateContext);
  if (!context) {
    throw new Error('useAppState must be used within an AppStateProvider');
  }
  return context;
}

// Selector hooks for specific pieces of state
export function useSelectedPlayer() {
  const { state } = useAppState();
  return state.selectedPlayer;
}

export function useSelectedTeam() {
  const { state } = useAppState();
  return state.selectedTeam;
}

export function useFavorites() {
  const { state, dispatch } = useAppState();
  
  const addPlayerToFavorites = (playerId: string) => {
    dispatch({ type: 'ADD_FAVORITE_PLAYER', payload: playerId });
  };
  
  const removePlayerFromFavorites = (playerId: string) => {
    dispatch({ type: 'REMOVE_FAVORITE_PLAYER', payload: playerId });
  };
  
  const addTeamToFavorites = (teamId: string) => {
    dispatch({ type: 'ADD_FAVORITE_TEAM', payload: teamId });
  };
  
  const removeTeamFromFavorites = (teamId: string) => {
    dispatch({ type: 'REMOVE_FAVORITE_TEAM', payload: teamId });
  };
  
  const isPlayerFavorite = (playerId: string) => {
    return state.favorites.players.includes(playerId);
  };
  
  const isTeamFavorite = (teamId: string) => {
    return state.favorites.teams.includes(teamId);
  };
  
  return {
    favorites: state.favorites,
    addPlayerToFavorites,
    removePlayerFromFavorites,
    addTeamToFavorites,
    removeTeamFromFavorites,
    isPlayerFavorite,
    isTeamFavorite,
  };
}

export function useAppSettings() {
  const { state, dispatch } = useAppState();
  
  const updateSettings = (newSettings: Partial<AppState['settings']>) => {
    dispatch({ type: 'UPDATE_SETTINGS', payload: newSettings });
  };
  
  return {
    settings: state.settings,
    updateSettings,
  };
}

export function useUIState() {
  const { state, dispatch } = useAppState();
  
  const toggleSidebar = () => dispatch({ type: 'TOGGLE_SIDEBAR' });
  const toggleFilterPanel = () => dispatch({ type: 'TOGGLE_FILTER_PANEL' });
  const setLoading = (loading: boolean) => dispatch({ type: 'SET_LOADING', payload: loading });
  const setError = (error: string | null) => dispatch({ type: 'SET_ERROR', payload: error });
  const resetError = () => dispatch({ type: 'RESET_ERROR' });
  
  return {
    ui: state.ui,
    toggleSidebar,
    toggleFilterPanel,
    setLoading,
    setError,
    resetError,
  };
}
