import { Router } from 'express';
import { AuthorController } from '../controllers/author.controller';
import { verifyToken } from '../middlewares/token';
import { validateLogin, validateRegister } from '../middlewares/validator';
import { uploader } from '../middlewares/uploader';

export class AuthorRouter {
  private router: Router;
  private authorController: AuthorController;

  constructor() {
    this.authorController = new AuthorController();

    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get(
      '/',
      // verifyToken,
      // checkAdmin,
      this.authorController.getAuthor,
    );

    this.router.get('/:id', this.authorController.getAuthorId);

    this.router.post('/', validateRegister, this.authorController.createAuthor);

    this.router.patch(
      '/verify',
      verifyToken,
      this.authorController.verifyAuthor,
    );

    this.router.post(
      '/login',
      validateLogin,
      this.authorController.loginAuthor,
    );

    this.router.patch(
      '/avatar',
      verifyToken,
      uploader('avatar', '/avatar').single('avatar'),
      this.authorController.editAvatar,
    );
    this.router.patch(
      '/:id',
      verifyToken,
      uploader('avatar', '/avatar').single('avatar'),
      this.authorController.updateAuthor,
    );
    this.router.patch(
      '/link',
      // verifyToken,
      this.authorController.linkAuthorUsers,
    );
    this.router.delete('/:id', this.authorController.deleteAuthor);
  }

  getRouter(): Router {
    return this.router;
  }
}
