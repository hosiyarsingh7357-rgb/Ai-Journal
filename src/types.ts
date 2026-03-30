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
  title: string;
  tradeNotes: string;
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
