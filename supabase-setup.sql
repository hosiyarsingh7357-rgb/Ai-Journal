-- Create users table
CREATE TABLE users (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  mt5Credentials JSONB,
  theme TEXT DEFAULT 'dark',
  currency TEXT DEFAULT 'USD',
  language TEXT DEFAULT 'en',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Create trades table
CREATE TABLE trades (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  userId UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  symbol TEXT NOT NULL,
  type TEXT CHECK (type IN ('BUY', 'SELL')) NOT NULL,
  size TEXT NOT NULL,
  entryPrice TEXT NOT NULL,
  exitPrice TEXT,
  pnl TEXT,
  isWinner BOOLEAN,
  entryDate TIMESTAMP WITH TIME ZONE,
  exitDate TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  screenshot TEXT,
  createdAt TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updatedAt TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Create journals table
CREATE TABLE journals (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  userId UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  tradeNotes TEXT,
  instrument TEXT,
  tradeType TEXT,
  volume TEXT,
  pnl TEXT,
  entryPrice TEXT,
  exitPrice TEXT,
  entryDate TIMESTAMP WITH TIME ZONE,
  exitDate TIMESTAMP WITH TIME ZONE,
  screenshot TEXT,
  date TEXT,
  time TEXT,
  status TEXT,
  confidence TEXT,
  logic TEXT,
  emotionalCheck TEXT,
  emotions JSONB,
  tags TEXT[],
  createdAt TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updatedAt TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE trades ENABLE ROW LEVEL SECURITY;
ALTER TABLE journals ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own data" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own data" ON users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert their own data" ON users FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can view their own trades" ON trades FOR SELECT USING (auth.uid() = userId);
CREATE POLICY "Users can insert their own trades" ON trades FOR INSERT WITH CHECK (auth.uid() = userId);
CREATE POLICY "Users can update their own trades" ON trades FOR UPDATE USING (auth.uid() = userId);
CREATE POLICY "Users can delete their own trades" ON trades FOR DELETE USING (auth.uid() = userId);

CREATE POLICY "Users can view their own journals" ON journals FOR SELECT USING (auth.uid() = userId);
CREATE POLICY "Users can insert their own journals" ON journals FOR INSERT WITH CHECK (auth.uid() = userId);
CREATE POLICY "Users can update their own journals" ON journals FOR UPDATE USING (auth.uid() = userId);
CREATE POLICY "Users can delete their own journals" ON journals FOR DELETE USING (auth.uid() = userId);

-- Create storage bucket for screenshots
-- Note: This usually needs to be done in the Supabase UI, but here is the SQL for reference
-- INSERT INTO storage.buckets (id, name) VALUES ('screenshots', 'screenshots');
-- CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING ( bucket_id = 'screenshots' );
-- CREATE POLICY "Authenticated users can upload screenshots" ON storage.objects FOR INSERT WITH CHECK ( bucket_id = 'screenshots' AND auth.role() = 'authenticated' );
