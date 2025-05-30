import React, { ReactNode } from 'react';
import { FavoritesProvider } from '../context/FavoritesContext';

interface FavoritesWrapperProps {
  children: ReactNode;
}

const FavoritesWrapper: React.FC<FavoritesWrapperProps> = ({ children }) => {
  return <FavoritesProvider>{children}</FavoritesProvider>;
};

export default FavoritesWrapper;
