export interface Trade {
  id?: string;
  userId?: string;
  symbol: string;
  type: 'BUY' | 'SELL';
  size: string;
  entryPrice: string;
  exitPrice?: string;
  pnl?: string;
  isWinner?: boolean;
  entryDate?: string;
  exitDate?: string;
  notes?: string;
  screenshot?: string;
  createdAt?: any;
}

export interface JournalEntry {
  id?: string;
  userId?: string;
  tradeId?: string;
  title: string;
  tradeNotes?: string;
  instrument: string;
  tradeType: 'BUY' | 'SELL';
  volume: string;
  pnl: string;
  entryPrice: string;
  exitPrice: string;
  entryDate: string;
  exitDate: string;
  screenshot?: string;
  date: string;
  time: string;
  status: 'won' | 'lost' | 'neutral';
  confidence?: string;
  logic?: string;
  emotionalCheck?: string;
  tags?: string[];
  
  // New fields for redesign
  preTradeAnalysis?: string;
  postTradeReview?: string;
  riskReward?: { risk: number; reward: number };
  emotions?: string;
  lessonsLearned?: string;
  rating?: number;
  checklist?: { label: string; checked: boolean }[];
  screenshots?: string[];
  
  createdAt?: any;
}

export interface UserData {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  theme?: 'dark' | 'light';
  currency?: string;
  language?: string;
  mt5Credentials?: {
    broker: string;
    account: string;
    platform: string;
    connectedAt: any;
  };
}
