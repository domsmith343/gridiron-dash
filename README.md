# Gridiron Dash

A clean, fact-focused NFL dashboard that provides real-time scores, comprehensive stats, and news without opinions or predictions. Built as a modern alternative to ESPN, it prioritizes current game action and data-driven insights over commentary.

## Features

- Live game scores and updates
- Comprehensive NFL statistics
- Team and player analytics
- Fantasy Football integration
  - My Team dashboard with player stats
  - Top players leaderboard
  - Matchup analysis
- Team Comparison Tool
  - Side-by-side team stat comparison
  - Historical matchup data
  - Visual stat breakdowns
- Favorites system for tracking preferred teams
- Notification center for game alerts
- Clean, minimal design
- Dark/light mode support
- Mobile-responsive interface

## Tech Stack

- Astro (framework)
- React (UI components)
- Tailwind CSS (styling)
- TypeScript (type safety)
- WebSocket service (real-time updates)
- Context API (state management)
- Chart.js (data visualization)

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:4321](http://localhost:4321) in your browser

## Available Scripts

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `npm install`             | Installs dependencies                            |
| `npm run dev`             | Starts local dev server at `localhost:4321`      |
| `npm run build`           | Build your production site to `./dist/`          |
| `npm run preview`         | Preview your build locally, before deploying     |

## Project Structure

```text
/
├── public/          # Static assets
├── src/
│   ├── components/  # React components
│   │   ├── Game components (GameCard, GameDetail, etc.)
│   │   ├── Fantasy Football components
│   │   ├── Team Comparison components
│   │   └── UI utilities (ThemeToggle, SearchFilter, etc.)
│   ├── context/     # React context providers
│   │   ├── FavoritesContext.tsx
│   │   └── NotificationContext.tsx
│   ├── layouts/     # Page layouts
│   ├── pages/       # Astro pages
│   ├── services/    # API and data services
│   ├── styles/      # Global and component styles
│   └── utils/       # Utility functions
├── ROADMAP.md       # Future development plans
└── package.json
```

## Real-Time Updates

Gridiron Dash uses WebSocket connections to provide real-time updates for:
- Live game scores and statistics
- Fantasy football player performance
- Breaking news and injury reports

The WebSocket service automatically reconnects if the connection is lost and provides a seamless experience for tracking game day action.

## Future Development

See the [ROADMAP.md](./ROADMAP.md) file for planned features and enhancements.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
