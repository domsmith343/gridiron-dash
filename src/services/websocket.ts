import type { Game } from '../types/game';
import { mockGames } from './mockData';

// Define message types for WebSocket communication
export type WebSocketMessage = {
  type: 'gameUpdate' | 'scoreUpdate' | 'statusUpdate' | 'statUpdate' | 'newsUpdate' | 'error';
  payload: any;
  timestamp: string;
};

// Callback types for different message types
type GameUpdateCallback = (games: Game[]) => void;
type ScoreUpdateCallback = (gameId: string, homeScore: number, awayScore: number) => void;
type StatusUpdateCallback = (gameId: string, status: string, time?: string) => void;
type StatUpdateCallback = (stats: any) => void;
type NewsUpdateCallback = (news: any) => void;
type ErrorCallback = (error: string) => void;
type ConnectionStatusCallback = (status: 'connected' | 'disconnected' | 'connecting' | 'error') => void;

class WebSocketService {
  private ws: WebSocket | null = null;
  private gameUpdateCallbacks: GameUpdateCallback[] = [];
  private scoreUpdateCallbacks: ScoreUpdateCallback[] = [];
  private statusUpdateCallbacks: StatusUpdateCallback[] = [];
  private statUpdateCallbacks: StatUpdateCallback[] = [];
  private newsUpdateCallbacks: NewsUpdateCallback[] = [];
  private errorCallbacks: ErrorCallback[] = [];
  private connectionStatusCallbacks: ConnectionStatusCallback[] = [];
  
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;
  private reconnectTimeout = 1000; // Start with 1 second
  private connectionStatus: 'connected' | 'disconnected' | 'connecting' | 'error' = 'disconnected';
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private pingInterval: ReturnType<typeof setInterval> | null = null;
  private lastMessageTime = 0;

  constructor() {
    // In development, we'll simulate WebSocket updates
    if (import.meta.env.DEV) {
      this.simulateUpdates();
    }
  }

  public connect() {
    // Clear any existing reconnect timer
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    
    // Update connection status
    this.updateConnectionStatus('connecting');
    
    if (import.meta.env.DEV) {
      console.log('WebSocket simulation enabled in development');
      this.updateConnectionStatus('connected');
      return;
    }

    const wsUrl = import.meta.env.PUBLIC_WEBSOCKET_URL || 'wss://api.gridiron-dash.com/ws';
    if (!wsUrl) {
      console.error('WebSocket URL is not defined');
      this.updateConnectionStatus('error');
      this.notifyErrorCallbacks('WebSocket URL is not defined');
      return;
    }

    try {
      this.ws = new WebSocket(wsUrl);
      
      this.ws.onopen = () => {
        console.log('WebSocket connected');
        this.reconnectAttempts = 0;
        this.reconnectTimeout = 1000;
        this.updateConnectionStatus('connected');
        this.lastMessageTime = Date.now();
        
        // Setup ping interval to keep connection alive
        this.setupPingInterval();
        
        // Send authentication if needed
        this.sendMessage({
          type: 'auth',
          payload: {
            clientId: 'gridiron-dash-web',
            version: '1.0.0'
          }
        });
      };

      this.ws.onmessage = (event) => {
        try {
          this.lastMessageTime = Date.now();
          const message = JSON.parse(event.data) as WebSocketMessage;
          
          // Process message based on type
          switch (message.type) {
            case 'gameUpdate':
              this.notifyGameUpdateCallbacks(message.payload);
              break;
            case 'scoreUpdate':
              this.notifyScoreUpdateCallbacks(
                message.payload.gameId,
                message.payload.homeScore,
                message.payload.awayScore
              );
              break;
            case 'statusUpdate':
              this.notifyStatusUpdateCallbacks(
                message.payload.gameId,
                message.payload.status,
                message.payload.time
              );
              break;
            case 'statUpdate':
              this.notifyStatUpdateCallbacks(message.payload);
              break;
            case 'newsUpdate':
              this.notifyNewsUpdateCallbacks(message.payload);
              break;
            case 'error':
              this.notifyErrorCallbacks(message.payload);
              break;
            default:
              console.warn('Unknown message type:', message.type);
          }
        } catch (error) {
          console.error('Error processing WebSocket message:', error);
          this.notifyErrorCallbacks('Error processing message');
        }
      };

      this.ws.onclose = (event) => {
        console.log(`WebSocket disconnected: ${event.code} ${event.reason}`);
        this.updateConnectionStatus('disconnected');
        this.cleanupPingInterval();
        this.attemptReconnect();
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.updateConnectionStatus('error');
        this.notifyErrorCallbacks('Connection error');
      };
    } catch (error) {
      console.error('Error connecting to WebSocket:', error);
      this.updateConnectionStatus('error');
      this.notifyErrorCallbacks('Failed to establish connection');
      this.attemptReconnect();
    }
  }

  // Subscription methods for different message types
  public subscribeToGameUpdates(callback: GameUpdateCallback) {
    this.gameUpdateCallbacks.push(callback);
    return () => {
      this.gameUpdateCallbacks = this.gameUpdateCallbacks.filter(cb => cb !== callback);
    };
  }
  
  public subscribeToScoreUpdates(callback: ScoreUpdateCallback) {
    this.scoreUpdateCallbacks.push(callback);
    return () => {
      this.scoreUpdateCallbacks = this.scoreUpdateCallbacks.filter(cb => cb !== callback);
    };
  }
  
  public subscribeToStatusUpdates(callback: StatusUpdateCallback) {
    this.statusUpdateCallbacks.push(callback);
    return () => {
      this.statusUpdateCallbacks = this.statusUpdateCallbacks.filter(cb => cb !== callback);
    };
  }
  
  public subscribeToStatUpdates(callback: StatUpdateCallback) {
    this.statUpdateCallbacks.push(callback);
    return () => {
      this.statUpdateCallbacks = this.statUpdateCallbacks.filter(cb => cb !== callback);
    };
  }
  
  public subscribeToNewsUpdates(callback: NewsUpdateCallback) {
    this.newsUpdateCallbacks.push(callback);
    return () => {
      this.newsUpdateCallbacks = this.newsUpdateCallbacks.filter(cb => cb !== callback);
    };
  }
  
  public subscribeToErrors(callback: ErrorCallback) {
    this.errorCallbacks.push(callback);
    return () => {
      this.errorCallbacks = this.errorCallbacks.filter(cb => cb !== callback);
    };
  }
  
  public subscribeToConnectionStatus(callback: ConnectionStatusCallback) {
    this.connectionStatusCallbacks.push(callback);
    // Immediately notify with current status
    callback(this.connectionStatus);
    return () => {
      this.connectionStatusCallbacks = this.connectionStatusCallbacks.filter(cb => cb !== callback);
    };
  }
  
  // Legacy method for backward compatibility
  public subscribe(callback: GameUpdateCallback) {
    return this.subscribeToGameUpdates(callback);
  }

  // Notification methods for different callback types
  private notifyGameUpdateCallbacks(games: Game[]) {
    if (!games || !Array.isArray(games)) {
      console.error('Invalid game data received');
      return;
    }
    this.gameUpdateCallbacks.forEach(callback => callback(games));
  }
  
  private notifyScoreUpdateCallbacks(gameId: string, homeScore: number, awayScore: number) {
    this.scoreUpdateCallbacks.forEach(callback => callback(gameId, homeScore, awayScore));
  }
  
  private notifyStatusUpdateCallbacks(gameId: string, status: string, time?: string) {
    this.statusUpdateCallbacks.forEach(callback => callback(gameId, status, time));
  }
  
  private notifyStatUpdateCallbacks(stats: any) {
    this.statUpdateCallbacks.forEach(callback => callback(stats));
  }
  
  private notifyNewsUpdateCallbacks(news: any) {
    this.newsUpdateCallbacks.forEach(callback => callback(news));
  }
  
  private notifyErrorCallbacks(error: string) {
    this.errorCallbacks.forEach(callback => callback(error));
  }
  
  private updateConnectionStatus(status: 'connected' | 'disconnected' | 'connecting' | 'error') {
    this.connectionStatus = status;
    this.connectionStatusCallbacks.forEach(callback => callback(status));
  }
  
  // Legacy method for backward compatibility
  private notifyCallbacks(games: Game[]) {
    this.notifyGameUpdateCallbacks(games);
  }

  private attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      this.notifyErrorCallbacks('Maximum reconnection attempts reached. Please refresh the page.');
      return;
    }

    this.reconnectAttempts++;
    this.reconnectTimeout = Math.min(30000, this.reconnectTimeout * 1.5); // Exponential backoff with 30s cap

    console.log(`Scheduling reconnect attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts} in ${this.reconnectTimeout}ms`);
    
    this.reconnectTimer = setTimeout(() => {
      console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
      this.connect();
    }, this.reconnectTimeout);
  }
  
  private setupPingInterval() {
    // Clear any existing interval
    this.cleanupPingInterval();
    
    // Set up ping every 30 seconds to keep connection alive
    this.pingInterval = setInterval(() => {
      // Check if we haven't received a message in over 45 seconds
      const now = Date.now();
      if (now - this.lastMessageTime > 45000) {
        console.warn('No messages received for 45 seconds, reconnecting...');
        this.reconnect();
        return;
      }
      
      // Send ping
      this.sendMessage({ type: 'ping', payload: { timestamp: now } });
    }, 30000);
  }
  
  private cleanupPingInterval() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }
  
  public reconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.connect();
  }
  
  public sendMessage(message: any) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.error('Cannot send message, WebSocket is not connected');
      return false;
    }
    
    try {
      const fullMessage = {
        ...message,
        timestamp: new Date().toISOString()
      };
      this.ws.send(JSON.stringify(fullMessage));
      return true;
    } catch (error) {
      console.error('Error sending message:', error);
      return false;
    }
  }

  // Development-only simulation with more realistic updates
  private simulateUpdates() {
    // Simulate initial game data
    setTimeout(() => {
      this.notifyGameUpdateCallbacks(mockGames);
    }, 500);
    
    // Simulate score updates
    setInterval(() => {
      // Choose a random game to update
      const gameIndex = Math.floor(Math.random() * mockGames.length);
      const game = mockGames[gameIndex];
      
      if (game.gameStatus === 'LIVE') {
        // Update scores
        const homeScoreChange = Math.random() > 0.8 ? (Math.random() > 0.7 ? 7 : 3) : 0;
        const awayScoreChange = Math.random() > 0.8 ? (Math.random() > 0.7 ? 7 : 3) : 0;
        
        if (homeScoreChange > 0 || awayScoreChange > 0) {
          game.homeScore += homeScoreChange;
          game.awayScore += awayScoreChange;
          
          // Notify score update
          this.notifyScoreUpdateCallbacks(game.id, game.homeScore, game.awayScore);
          
          // Simulate news update for scoring play
          if (homeScoreChange > 0) {
            this.notifyNewsUpdateCallbacks({
              id: `news-${Date.now()}`,
              headline: `${game.homeTeam.name} scores ${homeScoreChange === 7 ? 'touchdown' : 'field goal'}!`,
              summary: `${game.homeTeam.name} ${homeScoreChange === 7 ? 'touchdown' : 'field goal'} against ${game.awayTeam.name}`,
              timestamp: new Date().toISOString(),
              gameId: game.id
            });
          } else if (awayScoreChange > 0) {
            this.notifyNewsUpdateCallbacks({
              id: `news-${Date.now()}`,
              headline: `${game.awayTeam.name} scores ${awayScoreChange === 7 ? 'touchdown' : 'field goal'}!`,
              summary: `${game.awayTeam.name} ${awayScoreChange === 7 ? 'touchdown' : 'field goal'} against ${game.homeTeam.name}`,
              timestamp: new Date().toISOString(),
              gameId: game.id
            });
          }
        }
        
        // Update time
        const quarter = Math.min(4, Math.floor(Math.random() * 5));
        const minutes = Math.floor(Math.random() * 15);
        const seconds = Math.floor(Math.random() * 60);
        const timeString = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        const quarterString = quarter === 4 && minutes === 0 && seconds === 0 ? 'FINAL' : `Q${quarter}`;
        
        // Notify status update
        this.notifyStatusUpdateCallbacks(game.id, quarterString, timeString);
        
        // Update game object
        game.quarter = quarterString;
        game.timeRemaining = timeString;
        
        // Occasionally change possession
        if (Math.random() > 0.9) {
          game.possession = game.possession === game.homeTeam.id ? game.awayTeam.id : game.homeTeam.id;
          game.redZone = Math.random() > 0.7;
          
          // Notify status update for possession change
          this.notifyNewsUpdateCallbacks({
            id: `news-${Date.now()}`,
            headline: `${game.possession === game.homeTeam.id ? game.homeTeam.name : game.awayTeam.name} takes possession`,
            summary: `Turnover gives ${game.possession === game.homeTeam.id ? game.homeTeam.name : game.awayTeam.name} the ball${game.redZone ? ' in the red zone' : ''}`,
            timestamp: new Date().toISOString(),
            gameId: game.id
          });
        }
      } else if (game.gameStatus === 'SCHEDULED' && Math.random() > 0.95) {
        // Occasionally start a scheduled game
        game.gameStatus = 'LIVE';
        game.quarter = 'Q1';
        game.timeRemaining = '15:00';
        game.possession = Math.random() > 0.5 ? game.homeTeam.id : game.awayTeam.id;
        
        this.notifyStatusUpdateCallbacks(game.id, 'LIVE', 'Q1 15:00');
        this.notifyNewsUpdateCallbacks({
          id: `news-${Date.now()}`,
          headline: `${game.homeTeam.name} vs ${game.awayTeam.name} is now live!`,
          summary: `Game between ${game.homeTeam.name} and ${game.awayTeam.name} has started`,
          timestamp: new Date().toISOString(),
          gameId: game.id
        });
      }
    }, 5000); // Update every 5 seconds
    
    // Simulate occasional stat updates
    setInterval(() => {
      const randomGame = mockGames[Math.floor(Math.random() * mockGames.length)];
      
      if (randomGame.gameStatus === 'LIVE') {
        // Generate random player stats
        const homeTeamStats = {
          passing: {
            attempts: Math.floor(Math.random() * 40) + 10,
            completions: Math.floor(Math.random() * 30) + 5,
            yards: Math.floor(Math.random() * 300) + 50,
            touchdowns: Math.floor(Math.random() * 4),
            interceptions: Math.floor(Math.random() * 3)
          },
          rushing: {
            attempts: Math.floor(Math.random() * 25) + 5,
            yards: Math.floor(Math.random() * 150) + 20,
            touchdowns: Math.floor(Math.random() * 3)
          },
          receiving: {
            receptions: Math.floor(Math.random() * 20) + 5,
            yards: Math.floor(Math.random() * 250) + 30,
            touchdowns: Math.floor(Math.random() * 3)
          }
        };
        
        const awayTeamStats = {
          passing: {
            attempts: Math.floor(Math.random() * 40) + 10,
            completions: Math.floor(Math.random() * 30) + 5,
            yards: Math.floor(Math.random() * 300) + 50,
            touchdowns: Math.floor(Math.random() * 4),
            interceptions: Math.floor(Math.random() * 3)
          },
          rushing: {
            attempts: Math.floor(Math.random() * 25) + 5,
            yards: Math.floor(Math.random() * 150) + 20,
            touchdowns: Math.floor(Math.random() * 3)
          },
          receiving: {
            receptions: Math.floor(Math.random() * 20) + 5,
            yards: Math.floor(Math.random() * 250) + 30,
            touchdowns: Math.floor(Math.random() * 3)
          }
        };
        
        this.notifyStatUpdateCallbacks({
          gameId: randomGame.id,
          homeTeam: {
            id: randomGame.homeTeam.id,
            stats: homeTeamStats
          },
          awayTeam: {
            id: randomGame.awayTeam.id,
            stats: awayTeamStats
          }
        });
      }
    }, 15000); // Update every 15 seconds
    
    // Simulate occasional news updates
    setInterval(() => {
      const newsTypes = ['injury', 'highlight', 'milestone', 'general'];
      const newsType = newsTypes[Math.floor(Math.random() * newsTypes.length)];
      
      let newsItem;
      
      switch (newsType) {
        case 'injury':
          const injuredGame = mockGames[Math.floor(Math.random() * mockGames.length)];
          const team = Math.random() > 0.5 ? injuredGame.homeTeam : injuredGame.awayTeam;
          newsItem = {
            id: `news-${Date.now()}`,
            type: 'injury',
            headline: `${team.name} player leaves game with injury`,
            summary: `A player from the ${team.name} has left the game with an apparent injury. Status updates to follow.`,
            timestamp: new Date().toISOString(),
            teamId: team.id
          };
          break;
          
        case 'highlight':
          const highlightGame = mockGames.filter(g => g.gameStatus === 'LIVE')[0];
          if (highlightGame) {
            const team = Math.random() > 0.5 ? highlightGame.homeTeam : highlightGame.awayTeam;
            newsItem = {
              id: `news-${Date.now()}`,
              type: 'highlight',
              headline: `Spectacular play by ${team.name}`,
              summary: `${team.name} just made a highlight-reel worthy play against ${team === highlightGame.homeTeam ? highlightGame.awayTeam.name : highlightGame.homeTeam.name}.`,
              timestamp: new Date().toISOString(),
              gameId: highlightGame.id,
              teamId: team.id
            };
          }
          break;
          
        case 'milestone':
          const milestoneGame = mockGames.filter(g => g.gameStatus === 'LIVE')[0];
          if (milestoneGame) {
            const team = Math.random() > 0.5 ? milestoneGame.homeTeam : milestoneGame.awayTeam;
            newsItem = {
              id: `news-${Date.now()}`,
              type: 'milestone',
              headline: `${team.name} reaches significant milestone`,
              summary: `The ${team.name} have reached a significant statistical milestone in today's game.`,
              timestamp: new Date().toISOString(),
              teamId: team.id
            };
          }
          break;
          
        default:
          newsItem = {
            id: `news-${Date.now()}`,
            type: 'general',
            headline: 'League announces schedule changes',
            summary: 'The NFL has announced several schedule changes affecting upcoming games.',
            timestamp: new Date().toISOString()
          };
      }
      
      if (newsItem) {
        this.notifyNewsUpdateCallbacks(newsItem);
      }
    }, 25000); // Update every 25 seconds
  }

  public disconnect() {
    this.cleanupPingInterval();
    
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    
    this.updateConnectionStatus('disconnected');
  }
  
  public getConnectionStatus() {
    return this.connectionStatus;
  }
  
  public isConnected() {
    return this.connectionStatus === 'connected';
  }
}

export const websocketService = new WebSocketService(); 