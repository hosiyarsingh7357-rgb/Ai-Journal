export interface Trade {
  id?: string;
  _id?: string;
  userId?: string;
  symbol?: string; // Old field
  pair?: string;   // New field
  type?: 'BUY' | 'SELL';
  size?: string;
  entryPrice?: string; // Old field
  entry?: number;      // New field
  exitPrice?: string;  // Old field
  exit?: number;       // New field
  pnl?: string;        // Old field
  profit?: number;     // New field
  isWinner?: boolean;
  entryDate?: string;
  exitDate?: string;
  date?: string | Date;
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
