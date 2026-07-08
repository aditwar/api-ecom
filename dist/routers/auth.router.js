"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthRouter = void 0;
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth.controller");
const token_1 = require("../middlewares/token");
class AuthRouter {
    // Membentuk semua disini
    constructor() {
        this.authController = new auth_controller_1.AuthController();
        this.router = (0, express_1.Router)();
        this.initializeRoutes();
    }
    initializeRoutes() {
        this.router.post('/oauth', this.authController.getAuth);
        this.router.patch('/verify', token_1.verifyToken, this.authController.verifyAuth);
        this.router.patch('/upgrade', 
        // verifyToken,
        this.authController.upgradeToAuthor);
        this.router.delete('/:id', this.authController.deleteAuth);
    }
    getRouter() {
        return this.router;
    }
}
exports.AuthRouter = AuthRouter;
