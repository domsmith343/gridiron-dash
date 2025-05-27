import type { Game } from '../types/game';
import { mockGames } from './mockData';

type GameUpdateCallback = (games: Game[]) => void;

class WebSocketService {
  private ws: WebSocket | null = null;
  private callbacks: GameUpdateCallback[] = [];
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectTimeout = 1000; // Start with 1 second

  constructor() {
    // In development, we'll simulate WebSocket updates
    if (import.meta.env.DEV) {
      this.simulateUpdates();
    }
  }

  public connect() {
    if (import.meta.env.DEV) {
      console.log('WebSocket simulation enabled in development');
      return;
    }

    try {
      this.ws = new WebSocket(import.meta.env.PUBLIC_WEBSOCKET_URL || 'wss://api.gridiron-dash.com/ws');
      
      this.ws.onopen = () => {
        console.log('WebSocket connected');
        this.reconnectAttempts = 0;
        this.reconnectTimeout = 1000;
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.notifyCallbacks(data);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      this.ws.onclose = () => {
        console.log('WebSocket disconnected');
        this.attemptReconnect();
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
    } catch (error) {
      console.error('Error connecting to WebSocket:', error);
      this.attemptReconnect();
    }
  }

  public subscribe(callback: GameUpdateCallback) {
    this.callbacks.push(callback);
    return () => {
      this.callbacks = this.callbacks.filter(cb => cb !== callback);
    };
  }

  private notifyCallbacks(games: Game[]) {
    this.callbacks.forEach(callback => callback(games));
  }

  private attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    this.reconnectTimeout *= 2; // Exponential backoff

    setTimeout(() => {
      console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
      this.connect();
    }, this.reconnectTimeout);
  }

  // Development-only simulation
  private simulateUpdates() {
    setInterval(() => {
      // Simulate random score updates
      const updatedGames = mockGames.map((game: Game) => {
        if (game.status === 'LIVE') {
          return {
            ...game,
            homeScore: Math.random() > 0.5 ? game.homeScore + 1 : game.homeScore,
            awayScore: Math.random() > 0.5 ? game.awayScore + 1 : game.awayScore,
            time: `${Math.floor(Math.random() * 15)}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}`
          };
        }
        return game;
      });
      this.notifyCallbacks(updatedGames);
    }, 5000); // Update every 5 seconds
  }

  public disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}

export const websocketService = new WebSocketService(); 