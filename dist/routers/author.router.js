"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthorRouter = void 0;
const express_1 = require("express");
const author_controller_1 = require("../controllers/author.controller");
const token_1 = require("../middlewares/token");
const validator_1 = require("../middlewares/validator");
const uploader_1 = require("../middlewares/uploader");
class AuthorRouter {
    constructor() {
        this.authorController = new author_controller_1.AuthorController();
        this.router = (0, express_1.Router)();
        this.initializeRoutes();
    }
    initializeRoutes() {
        this.router.get('/', 
        // verifyToken,
        // checkAdmin,
        this.authorController.getAuthor);
        this.router.get('/:id', this.authorController.getAuthorId);
        this.router.post('/', validator_1.validateRegister, this.authorController.createAuthor);
        this.router.patch('/verify', token_1.verifyToken, this.authorController.verifyAuthor);
        this.router.post('/login', validator_1.validateLogin, this.authorController.loginAuthor);
        this.router.patch('/avatar', token_1.verifyToken, (0, uploader_1.uploader)('avatar', '/avatar').single('avatar'), this.authorController.editAvatar);
        this.router.patch('/:id', token_1.verifyToken, (0, uploader_1.uploader)('avatar', '/avatar').single('avatar'), this.authorController.updateAuthor);
        this.router.patch('/link', 
        // verifyToken,
        this.authorController.linkAuthorUsers);
        this.router.delete('/:id', this.authorController.deleteAuthor);
    }
    getRouter() {
        return this.router;
    }
}
exports.AuthorRouter = AuthorRouter;
