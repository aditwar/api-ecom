"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const auth_router_1 = require("./routers/auth.router");
const author_router_1 = require("./routers/author.router");
const order_router_1 = require("./routers/order.router");
const event_router_1 = require("./routers/event.router");
const PORT = 8000;
class App {
    constructor() {
        this.app = (0, express_1.default)();
        this.configure();
        this.routes();
    }
    configure() {
        this.app.use((0, cors_1.default)({ origin: "http://localhost:3000", credentials: true }));
        this.app.use(express_1.default.json());
        this.app.use("/api/public", express_1.default.static(path_1.default.join(__dirname, "../public")));
    }
    routes() {
        this.app.get("/api", (req, res) => {
            res.send("Selamat! Sudah nyambung API");
        });
        const authRouter = new auth_router_1.AuthRouter();
        this.app.use("/api/auth", authRouter.getRouter());
        const authorRouter = new author_router_1.AuthorRouter();
        this.app.use("/api/author", authorRouter.getRouter());
        const eventRouter = new event_router_1.EventRouter();
        this.app.use("/api/events", eventRouter.getRouter());
        const orderRouter = new order_router_1.OrderRouter();
        this.app.use("/api/order", orderRouter.getRouter());
    }
    start() {
        this.app.listen(PORT, () => {
            console.log(`[API] http://localhost:${PORT}/api`);
        });
    }
}
exports.default = App;
