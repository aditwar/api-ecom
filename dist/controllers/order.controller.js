"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderController = void 0;
const prisma_1 = __importDefault(require("../prisma"));
class OrderController {
    async createOrder(req, res) {
        var _a;
        try {
            console.log("Author:", req.author);
            if (!((_a = req.author) === null || _a === void 0 ? void 0 : _a.email))
                throw "Author tidak ditemukan";
            const reqauthor = await prisma_1.default.author.findUnique({
                where: { email: req.author.email },
            });
            if (!reqauthor)
                throw "SALAH! Email tidak ditemukan yaa ...";
            const { pricePaid, eventId } = req.body;
            if (!eventId || !pricePaid)
                throw "Event ID PricePaid wajib dikirim di body";
            if (!req.params.slug)
                throw "Slug tidak ditemukan";
            const event = await prisma_1.default.event.findUnique({
                where: { slug: req.params.slug },
            });
            if (!event)
                throw "Slug tidak ditemukan";
            if (event.id !== Number(eventId)) {
                throw "SALAH! Event ID tidak cocok dengan slug";
            }
            const order = await prisma_1.default.order.create({
                data: {
                    pricePaid: Number(pricePaid),
                    author: { connect: { email: req.author.email } },
                    event: { connect: { id: +event.id } },
                },
            });
            res.status(200).send({
                status: "ok",
                msg: "Order berhasil dibuat",
                order,
            });
        }
        catch (err) {
            res.status(400).send({
                status: "error",
                msg: err.toString(),
            });
        }
    }
    async getOrder(req, res) {
        try {
            const orders = await prisma_1.default.order.findMany({
                include: {
                    author: true,
                    event: true,
                },
            });
            res.status(200).send({
                status: "ok",
                msg: "Berhasil get Orders",
                orders,
            });
        }
        catch (err) {
            res.status(400).send({
                status: "error",
                msg: err,
            });
        }
    }
    async getOrderId(req, res) {
        try {
            const order = await prisma_1.default.order.findUnique({
                where: { id: Number(req.params.id) },
                include: {
                    author: true,
                    event: true,
                },
            });
            if (!order)
                throw "SALAH! ID Order tidak ditemukan";
            res.status(200).send({
                status: "ok",
                msg: "Berhasil get ID Order",
                order,
            });
        }
        catch (err) {
            res.status(400).send({
                status: "error",
                msg: err,
            });
        }
    }
    async deleteOrder(req, res) {
        try {
            const deleted = await prisma_1.default.order.delete({
                where: { id: Number(req.params.id) },
            });
            res.status(200).send({
                status: "ok",
                msg: "Order terhapus",
                deleted,
            });
        }
        catch (err) {
            res.status(400).send({
                status: "error",
                msg: "SALAH! ID Order tidak ditemukan atau sudah dihapus",
            });
        }
    }
}
exports.OrderController = OrderController;
