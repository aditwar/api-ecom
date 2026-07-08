"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderRouter = void 0;
const express_1 = require("express");
const order_controller_1 = require("../controllers/order.controller");
const token_1 = require("../middlewares/token");
class OrderRouter {
    constructor() {
        this.orderController = new order_controller_1.OrderController();
        this.router = (0, express_1.Router)();
        this.initializeRoutes();
    }
    initializeRoutes() {
        this.router.post('/', token_1.verifyToken, this.orderController.createOrder);
        this.router.get('/', this.orderController.getOrder);
        this.router.get('/:id', this.orderController.getOrderId);
        this.router.delete('/:id', this.orderController.deleteOrder);
    }
    getRouter() {
        return this.router;
    }
}
exports.OrderRouter = OrderRouter;
