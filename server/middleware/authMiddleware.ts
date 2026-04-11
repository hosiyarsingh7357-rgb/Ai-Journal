import { Request, Response, NextFunction } from 'express';

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  // TODO: Implement actual authentication (e.g., JWT, Firebase Auth)
  const token = req.headers.authorization;
  
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  // For now, just pass through
  next();
};
