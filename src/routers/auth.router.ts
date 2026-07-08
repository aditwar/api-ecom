import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { verifyToken } from '../middlewares/token';

export class AuthRouter {
  private router: Router;
  private authController: AuthController;

  // Membentuk semua disini
  constructor() {
    this.authController = new AuthController();
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.post('/oauth', this.authController.getAuth);

    this.router.patch(
      '/verify',
      verifyToken,
      this.authController.verifyAuth,
    );

    this.router.patch(
      '/upgrade',
      // verifyToken,
      this.authController.upgradeToAuthor,
    );

    this.router.delete('/:id', this.authController.deleteAuth);
  }

  getRouter(): Router {
    return this.router;
  }
}
