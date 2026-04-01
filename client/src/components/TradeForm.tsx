import React, { useState } from 'react';
import { useTrades } from '../context/TradeContext';
import { Card } from './ui/Card';
import { Button } from './ui/Button';

export const TradeForm = () => {
  const { addTrade } = useTrades();
  const [formData, setFormData] = useState({
    pair: '',
    entry: '',
    exit: ''
  });
  const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);

    if (!formData.entry || !formData.exit) {
      setStatus({ type: 'error', message: 'Please fill all fields' });
      return;
    }

    try {
      await addTrade({
        pair: formData.pair || 'GENERAL',
        entry: Number(formData.entry),
        exit: Number(formData.exit)
      } as any);
      
      setStatus({ type: 'success', message: 'Trade Saved ✅' });
      setFormData({ pair: '', entry: '', exit: '' });
    } catch (error) {
      setStatus({ type: 'error', message: 'Failed to save trade' });
    }
  };

  return (
    <Card className="p-6 max-w-md mx-auto mt-8">
      <h2 className="text-xl font-bold mb-4">Save New Trade</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Entry Price</label>
          <input
            type="number"
            step="any"
            value={formData.entry}
            onChange={(e) => setFormData({ ...formData, entry: e.target.value })}
            className="w-full p-2 border rounded bg-transparent"
            placeholder="0.00"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Exit Price</label>
          <input
            type="number"
            step="any"
            value={formData.exit}
            onChange={(e) => setFormData({ ...formData, exit: e.target.value })}
            className="w-full p-2 border rounded bg-transparent"
            placeholder="0.00"
          />
        </div>
        <Button type="submit" className="w-full">
          Save Trade
        </Button>
        {status && (
          <p className={`text-center mt-2 ${status.type === 'success' ? 'text-green-500' : 'text-red-500'}`}>
            {status.message}
          </p>
        )}
      </form>
    </Card>
  );
};
