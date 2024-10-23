import cors, { CorsOptions } from 'cors';

const corsOptions: CorsOptions = {
  optionsSuccessStatus: 200,
  origin: ['http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'credentials'],
  credentials: true,
};

export default cors(corsOptions);
