// API Configuration
export const API_CONFIG = {
  BASE_URL: process.env.NODE_ENV === 'production' 
    ? 'https://api.gridiron-dash.com' 
    : 'http://localhost:3001',
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
} as const;

// Performance thresholds
export const PERFORMANCE_THRESHOLDS = {
  SLOW_COMPONENT_RENDER: 16, // ms
  SLOW_API_CALL: 2000, // ms
  MEMORY_WARNING: 50 * 1024 * 1024, // 50MB
  BUNDLE_SIZE_WARNING: 5 * 1024 * 1024, // 5MB
} as const;

// Fantasy football scoring
export const FANTASY_SCORING = {
  QB: {
    PASSING_YARDS: 0.04,
    PASSING_TD: 4,
    INTERCEPTION: -1,
    RUSHING_YARDS: 0.1,
    RUSHING_TD: 6,
    FUMBLE: -2,
  },
  RB: {
    RUSHING_YARDS: 0.1,
    RUSHING_TD: 6,
    RECEIVING_YARDS: 0.1,
    RECEPTION: 0.5,
    RECEIVING_TD: 6,
    FUMBLE: -2,
  },
  WR: {
    RECEIVING_YARDS: 0.1,
    RECEPTION: 0.5,
    RECEIVING_TD: 6,
    RUSHING_YARDS: 0.1,
    RUSHING_TD: 6,
    FUMBLE: -2,
  },
  TE: {
    RECEIVING_YARDS: 0.1,
    RECEPTION: 0.5,
    RECEIVING_TD: 6,
    FUMBLE: -2,
  },
  K: {
    FIELD_GOAL: 3,
    EXTRA_POINT: 1,
    FIELD_GOAL_MISS: -1,
  },
  DEF: {
    TOUCHDOWN: 6,
    INTERCEPTION: 2,
    FUMBLE_RECOVERY: 2,
    SACK: 1,
    SAFETY: 2,
    POINTS_ALLOWED_0: 10,
    POINTS_ALLOWED_1_6: 7,
    POINTS_ALLOWED_7_13: 4,
    POINTS_ALLOWED_14_20: 1,
    POINTS_ALLOWED_21_27: 0,
    POINTS_ALLOWED_28_34: -1,
    POINTS_ALLOWED_35_PLUS: -4,
  },
} as const;

// Team colors for UI consistency
export const TEAM_COLORS = {
  ARI: { primary: '#97233F', secondary: '#000000' },
  ATL: { primary: '#A71930', secondary: '#000000' },
  BAL: { primary: '#241773', secondary: '#000000' },
  BUF: { primary: '#00338D', secondary: '#C60C30' },
  CAR: { primary: '#0085CA', secondary: '#000000' },
  CHI: { primary: '#0B162A', secondary: '#C83803' },
  CIN: { primary: '#FB4F14', secondary: '#000000' },
  CLE: { primary: '#311D00', secondary: '#FF3C00' },
  DAL: { primary: '#003594', secondary: '#869397' },
  DEN: { primary: '#FB4F14', secondary: '#002244' },
  DET: { primary: '#0076B6', secondary: '#B0B7BC' },
  GB: { primary: '#203731', secondary: '#FFB612' },
  HOU: { primary: '#03202F', secondary: '#A71930' },
  IND: { primary: '#002C5F', secondary: '#A2AAAD' },
  JAX: { primary: '#006778', secondary: '#9F792C' },
  KC: { primary: '#E31837', secondary: '#FFB81C' },
  LV: { primary: '#000000', secondary: '#A5ACAF' },
  LAC: { primary: '#0080C6', secondary: '#FFC20E' },
  LAR: { primary: '#003594', secondary: '#FFA300' },
  MIA: { primary: '#008E97', secondary: '#FC4C02' },
  MIN: { primary: '#4F2683', secondary: '#FFC62F' },
  NE: { primary: '#002244', secondary: '#C60C30' },
  NO: { primary: '#D3BC8D', secondary: '#000000' },
  NYG: { primary: '#0B2265', secondary: '#A71930' },
  NYJ: { primary: '#125740', secondary: '#000000' },
  PHI: { primary: '#004C54', secondary: '#A5ACAF' },
  PIT: { primary: '#FFB612', secondary: '#000000' },
  SF: { primary: '#AA0000', secondary: '#B3995D' },
  SEA: { primary: '#002244', secondary: '#69BE28' },
  TB: { primary: '#D50A0A', secondary: '#FF7900' },
  TEN: { primary: '#0C2340', secondary: '#4B92DB' },
  WAS: { primary: '#5A1414', secondary: '#FFB612' },
} as const;

// Position groupings
export const POSITION_GROUPS = {
  OFFENSE: ['QB', 'RB', 'WR', 'TE'],
  DEFENSE: ['DEF', 'LB', 'DB', 'DL'],
  SPECIAL_TEAMS: ['K', 'P'],
} as const;

// Chart colors for consistent theming
export const CHART_COLORS = {
  PRIMARY: '#3B82F6',
  SECONDARY: '#EF4444',
  SUCCESS: '#10B981',
  WARNING: '#F59E0B',
  INFO: '#06B6D4',
  PURPLE: '#8B5CF6',
  PINK: '#EC4899',
  INDIGO: '#6366F1',
} as const;

// UI Constants
export const UI_CONFIG = {
  BREAKPOINTS: {
    SM: 640,
    MD: 768,
    LG: 1024,
    XL: 1280,
    '2XL': 1536,
  },
  ANIMATION_DURATION: {
    FAST: 150,
    NORMAL: 300,
    SLOW: 500,
  },
  DEBOUNCE_DELAY: {
    SEARCH: 300,
    RESIZE: 150,
    SCROLL: 50,
  },
} as const;

// Error messages
export const ERROR_MESSAGES = {
  GENERIC: 'Something went wrong. Please try again.',
  NETWORK: 'Network error. Please check your connection.',
  TIMEOUT: 'Request timed out. Please try again.',
  NOT_FOUND: 'The requested resource was not found.',
  UNAUTHORIZED: 'You are not authorized to access this resource.',
  VALIDATION: 'Please check your input and try again.',
  SERVER_ERROR: 'Server error. Please try again later.',
} as const;

// Local storage keys
export const STORAGE_KEYS = {
  THEME: 'gridiron-dash-theme',
  USER_PREFERENCES: 'gridiron-dash-user-prefs',
  CACHED_DATA: 'gridiron-dash-cache',
  PERFORMANCE_METRICS: 'gridiron-dash-perf',
} as const;

// Component display names for debugging
export const COMPONENT_NAMES = {
  DETAILED_PLAYER_STATS: 'DetailedPlayerStats',
  FANTASY_FOOTBALL: 'FantasyFootball',
  ERROR_BOUNDARY: 'ErrorBoundary',
  LOADING: 'Loading',
  CARD: 'Card',
  BUTTON: 'Button',
  TAB_NAVIGATION: 'TabNavigation',
} as const;
