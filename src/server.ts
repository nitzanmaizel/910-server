import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import { OAuth2Client } from 'google-auth-library';

import routes from './routes';
import { connectDB, disconnectDB } from './config/MongoDB';
import cors from './middleware/cors';
import { IUser } from './types/UserTypes';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

connectDB();

declare module 'express' {
  interface Request {
    user?: IUser;
    oauth2Client?: OAuth2Client;
    accessToken?: string;
  }
}

app.get('/', (_req, res) => {
  res.send('Hello, world!');
});

app.use('/api/v1', routes);

const server = app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

process.on('SIGTERM', async () => {
  console.log('SIGTERM signal received: closing HTTP server');
  disconnectDB();
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});
