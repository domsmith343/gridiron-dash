import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';

// Define the shape of our context
interface FavoritesContextType {
  favoriteTeams: string[];
  addFavoriteTeam: (teamId: string) => void;
  removeFavoriteTeam: (teamId: string) => void;
  isFavorite: (teamId: string) => boolean;
}

// Create the context with default values
const FavoritesContext = createContext<FavoritesContextType>({
  favoriteTeams: [],
  addFavoriteTeam: () => {},
  removeFavoriteTeam: () => {},
  isFavorite: () => false,
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
        console.error('Error accessing localStorage:', e);
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
        console.error('Error saving to localStorage:', e);
      }
    }
  }, [favoriteTeams]);

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

  // Provide the context to children
  return (
    <FavoritesContext.Provider value={{ favoriteTeams, addFavoriteTeam, removeFavoriteTeam, isFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
};

export default FavoritesProvider;
