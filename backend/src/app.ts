import * as express from 'express';
import * as cors from 'cors';
import { getPackage } from './package';

/**
 * Bootstrap the application framework
 */
export function createApp(): express.Express {
  const app = express();

  app.use(cors({
    origin: 'http://localhost:5173'
  }));
  app.use(express.json());

  app.get('/package/:name/:version', getPackage);

  return app;
}
