import { Router } from 'express';
import { EventController } from '../controllers/event.controller';
import { uploader } from '../middlewares/uploader';
import { verifyToken } from '../middlewares/token';

export class EventRouter {
  private router: Router;
  private eventController: EventController;

  constructor() {
    this.eventController = new EventController();

    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.post(
      '/',
      verifyToken,
      uploader('event-', '/events').single('image'),
      this.eventController.createEvent,
    );
    this.router.get('/', this.eventController.getEvent);
    this.router.get('/:slug', this.eventController.getEventSlug);

    this.router.patch(
      '/:id/editimage',
      verifyToken,
      uploader('event', '/events').single('image'),
      this.eventController.editImage,
    );

    this.router.patch(
      '/:id',
      verifyToken,
      uploader('event', '/events').single('image'),
      this.eventController.updateEvent,
    );

    this.router.delete('/:id', this.eventController.deleteEvent);
  }

  getRouter(): Router {
    return this.router;
  }
}
