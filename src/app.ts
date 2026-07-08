import express, { Express, Request, Response } from 'express';

import cors from 'cors';
import path from 'path';
import { AuthRouter } from './routers/auth.router';
import { AuthorRouter } from './routers/author.router';
import { OrderRouter } from './routers/order.router';
import { EventRouter } from './routers/event.router';

const PORT: number = 8000;

export default class App {
  private app: Express;

  constructor() {
    this.app = express();
    this.configure();
    this.routes();
  }

  private configure(): void {
    this.app.use(cors({ origin: 'http://localhost:3000', credentials: true }));

    //! BACKEND ALWAYS STORES JSON FILE
    this.app.use(express.json());
    this.app.use(
      '/api/public',
      express.static(path.join(__dirname, '../public')),
    );
  }

  private routes(): void {
    this.app.get('/api', (req: Request, res: Response) => {
      res.send('Selamat! Sudah nyambung API');
    });

    //! AUTH ROUTER disini
    const authRouter = new AuthRouter();
    this.app.use('/api/auth', authRouter.getRouter());

    //! AUTHOR ROUTER disini
    const authorRouter = new AuthorRouter();
    this.app.use('/api/author', authorRouter.getRouter());

    //! EVENT ROUTER disini
    const eventRouter = new EventRouter();
    this.app.use('/api/events', eventRouter.getRouter());

    //! ORDER ROUTER disini
    const orderRouter = new OrderRouter();
    this.app.use('/api/order', orderRouter.getRouter());
  }

  public start(): void {
    this.app.listen(PORT, () => {
      console.log(`[API] http://localhost:${PORT}/api`);
    });
  }
}
