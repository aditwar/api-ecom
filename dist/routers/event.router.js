"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventRouter = void 0;
const express_1 = require("express");
const event_controller_1 = require("../controllers/event.controller");
const uploader_1 = require("../middlewares/uploader");
const token_1 = require("../middlewares/token");
class EventRouter {
    constructor() {
        this.eventController = new event_controller_1.EventController();
        this.router = (0, express_1.Router)();
        this.initializeRoutes();
    }
    initializeRoutes() {
        this.router.post('/', token_1.verifyToken, (0, uploader_1.uploader)('event-', '/events').single('image'), this.eventController.createEvent);
        this.router.get('/', this.eventController.getEvent);
        this.router.get('/:slug', this.eventController.getEventSlug);
        this.router.patch('/:id/editimage', token_1.verifyToken, (0, uploader_1.uploader)('event', '/events').single('image'), this.eventController.editImage);
        this.router.patch('/:id', token_1.verifyToken, (0, uploader_1.uploader)('event', '/events').single('image'), this.eventController.updateEvent);
        this.router.delete('/:id', this.eventController.deleteEvent);
    }
    getRouter() {
        return this.router;
    }
}
exports.EventRouter = EventRouter;
