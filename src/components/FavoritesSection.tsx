import React from 'react';
import { useFavorites } from '../context/FavoritesContext';
import { teams, generateMockPlayers, FantasyPlayer } from '../services/mockData';

const allPlayers = generateMockPlayers();

const FavoritesSection: React.FC<{ limit?: number, showSeeAll?: boolean }> = ({ limit, showSeeAll = false }) => {
  const { favoriteTeams, removeFavoriteTeam, favoritePlayers, removeFavoritePlayer, isFavoritePlayer } = useFavorites();
  const favoriteTeamObjs = teams
    .filter(team => favoriteTeams.includes(team.id))
    .map(team => ({ ...team, itemType: 'team' as const }));

  // Assuming allPlayers is an array of FantasyPlayer objects from mockData
  const favoritePlayerObjs = allPlayers
    .filter((player: FantasyPlayer) => favoritePlayers.includes(player.id))
    .map(player => ({ ...player, itemType: 'player' as const }));

  const combinedFavorites = [...favoriteTeamObjs, ...favoritePlayerObjs];
  // Sort combined favorites, e.g., by name or type, or keep as is (teams first, then players)
  // For now, keeping the order: teams then players.

  const displayItems = typeof limit === 'number' ? combinedFavorites.slice(0, limit) : combinedFavorites;

  if (favoriteTeams.length === 0 && favoritePlayers.length === 0) {
    return (
      <div className="favorites-empty text-gray-500 dark:text-gray-400 py-8 text-center">
        <p>You haven't added any favorite teams or players yet.</p>
        <p>Explore teams and players to add your favorites!</p>
      </div>
    );
  }

  return (
    <div className="favorites-list grid grid-cols-1 md:grid-cols-2 gap-6">
      {displayItems.map(item => {
        if (item.itemType === 'team') {
          return (
            <div key={`team-${item.id}`} className="favorite-item-card bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 flex flex-col justify-between hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center gap-4 mb-3">
                <img src={item.logoUrl} alt={item.name} className="w-14 h-14 rounded-full border-2 border-gray-200 dark:border-gray-700" />
                <div className="flex-1">
                  <h3 className="font-bold text-xl text-gray-800 dark:text-white">{item.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{item.abbreviation}</p>
                </div>
              </div>
              <div className="mt-auto flex flex-col items-start gap-2 text-sm">
                <a href={`/team/${item.id}`} className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 hover:underline font-medium">View Team Stats</a>
                <a href={`/schedule?team=${item.id}`} className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 hover:underline font-medium">Upcoming Games</a>
                <button onClick={() => removeFavoriteTeam(item.id)} className="mt-2 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:underline font-medium self-start">Remove Favorite</button>
              </div>
            </div>
          );
        } else if (item.itemType === 'player') {
          // Assuming item is a FantasyPlayer type with avatarUrl, name, position, team
          return (
            <div key={`player-${item.id}`} className="favorite-item-card bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 flex flex-col justify-between hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center gap-4 mb-3">
                <img 
                  src={item.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.name)}&background=random&color=fff`} 
                  alt={`${item.name} avatar`}
                  className="w-14 h-14 rounded-full border-2 border-gray-200 dark:border-gray-700"
                  onError={(e) => (e.currentTarget.src = 'https://ui-avatars.com/api/?name=P&background=cccccc&color=fff')} // Fallback
                />
                <div className="flex-1">
                  <h3 className="font-bold text-xl text-gray-800 dark:text-white">{item.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{item.position} • {item.team}</p>
                </div>
              </div>
              <div className="mt-auto flex flex-col items-start gap-2 text-sm">
                {/* Placeholder for player specific links - e.g., link to player page or fantasy tool */}
                <a href={`/tools#fantasy-football`} className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 hover:underline font-medium">View in Fantasy Tool</a>
                <button onClick={() => removeFavoritePlayer(item.id)} className="mt-2 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:underline font-medium self-start">Remove Favorite</button>
              </div>
            </div>
          );
        }
        return null;
      })}
      {showSeeAll && combinedFavorites.length > (limit ?? 0) && (
        <div className="see-all-favorites flex items-center justify-center col-span-full">
          <a href="/favorites" className="text-primary-600 font-semibold hover:underline">See all favorites →</a>
        </div>
      )}
    </div>
  );
};

export default FavoritesSection;
