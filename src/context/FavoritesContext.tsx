import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';

// Define the shape of our context
interface FavoritesContextType {
  favoriteTeams: string[];
  addFavoriteTeam: (teamId: string) => void;
  removeFavoriteTeam: (teamId: string) => void;
  isFavorite: (teamId: string) => boolean;
  favoritePlayers: string[];
  addFavoritePlayer: (playerId: string) => void;
  removeFavoritePlayer: (playerId: string) => void;
  isFavoritePlayer: (playerId: string) => boolean;
}

// Create the context with default values
const FavoritesContext = createContext<FavoritesContextType>({
  favoriteTeams: [],
  addFavoriteTeam: () => {},
  removeFavoriteTeam: () => {},
  isFavorite: () => false,
  favoritePlayers: [],
  addFavoritePlayer: () => {},
  removeFavoritePlayer: () => {},
  isFavoritePlayer: () => false,
});

// Custom hook to use the favorites context
export const useFavorites = () => useContext(FavoritesContext);

interface FavoritesProviderProps {
  children: ReactNode;
}

// Provider component to wrap our app
export const FavoritesProvider: React.FC<FavoritesProviderProps> = ({ children }) => {
  // Initialize state from localStorage if available (only in browser environment)
  const [favoriteTeams, setFavoriteTeams] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('favoriteTeams');
        return saved ? JSON.parse(saved) : [];
      } catch (e) {
        console.error('Error accessing localStorage for teams:', e);
        return [];
      }
    }
    return [];
  });

  const [favoritePlayers, setFavoritePlayers] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('favoritePlayers');
        return saved ? JSON.parse(saved) : [];
      } catch (e) {
        console.error('Error accessing localStorage for players:', e);
        return [];
      }
    }
    return [];
  });

  // Save to localStorage whenever favorites change (only in browser environment)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('favoriteTeams', JSON.stringify(favoriteTeams));
      } catch (e) {
        console.error('Error saving teams to localStorage:', e);
      }
    }
  }, [favoriteTeams]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('favoritePlayers', JSON.stringify(favoritePlayers));
      } catch (e) {
        console.error('Error saving players to localStorage:', e);
      }
    }
  }, [favoritePlayers]);

  // Add a team to favorites
  const addFavoriteTeam = (teamId: string) => {
    if (!favoriteTeams.includes(teamId)) {
      setFavoriteTeams([...favoriteTeams, teamId]);
    }
  };



  // Remove a team from favorites
  const removeFavoriteTeam = (teamId: string) => {
    setFavoriteTeams(favoriteTeams.filter(id => id !== teamId));
  };

  // Check if a team is a favorite
  const isFavorite = (teamId: string) => favoriteTeams.includes(teamId);

  // Add a player to favorites
  const addFavoritePlayer = (playerId: string) => {
    if (!favoritePlayers.includes(playerId)) {
      setFavoritePlayers([...favoritePlayers, playerId]);
    }
  };

  // Remove a player from favorites
  const removeFavoritePlayer = (playerId: string) => {
    setFavoritePlayers(favoritePlayers.filter(id => id !== playerId));
  };

  // Check if a player is a favorite
  const isFavoritePlayer = (playerId: string) => favoritePlayers.includes(playerId);

  // Provide the context to children
  return (
    <FavoritesContext.Provider value={{
      favoriteTeams,
      addFavoriteTeam,
      removeFavoriteTeam,
      isFavorite,
      favoritePlayers,
      addFavoritePlayer,
      removeFavoritePlayer,
      isFavoritePlayer
    }}>
      {children}
    </FavoritesContext.Provider>
  );
};

export default FavoritesProvider;
