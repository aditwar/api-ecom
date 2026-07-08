import { Router } from 'express';
import { OrderController } from '../controllers/order.controller';
import { verifyToken } from '../middlewares/token';


export class OrderRouter {
  private router: Router;
  private orderController: OrderController;

  constructor() {
    this.orderController = new OrderController();
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.post(
      '/',
      verifyToken,
      this.orderController.createOrder,
    );
    this.router.get('/', this.orderController.getOrder);
    this.router.get('/:id', this.orderController.getOrderId);

    this.router.delete('/:id', this.orderController.deleteOrder);
  }

  getRouter(): Router {
    return this.router;
  }
}
