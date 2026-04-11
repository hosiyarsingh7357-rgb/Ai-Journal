// TODO: Implement actual MT5 integration
export const mt5Service = {
  async connect(credentials: any) {
    console.log('Connecting to MT5 with:', credentials);
    return { status: 'connected' };
  },
  async getTrades(accountId: string) {
    console.log('Fetching trades for:', accountId);
    return [];
  }
};
