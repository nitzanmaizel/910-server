import { Request, Response, NextFunction } from 'express';
import { refreshAccessToken } from '../services/authServices';
import { oAuth2Client } from '../config/oauth2Client';
import User from '../models/UserModal';

export const refreshTokenMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const userId = req.user.userId;

  try {
    const user = await User.findById(userId);

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const tokenExpiryDate = user.tokenExpiryDate;
    const accessToken = user.accessToken;

    if (!accessToken || !tokenExpiryDate || tokenExpiryDate <= new Date()) {
      await refreshAccessToken(userId);
    }

    oAuth2Client.setCredentials({ access_token: user.accessToken });

    req.oauth2Client = oAuth2Client;
    req.accessToken = user.accessToken;

    next();
  } catch (error) {
    console.error('Error in ensureValidAccessToken middleware:', error);
    res.status(401).json({ error: 'Unauthorized' });
  }
};
