"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventController = void 0;
const prisma_1 = __importDefault(require("../prisma"));
const client_1 = require("@prisma/client");
class EventController {
    async createEvent(req, res) {
        var _a;
        try {
            const link = `http://localhost:8000/api/public/events/${(_a = req === null || req === void 0 ? void 0 : req.file) === null || _a === void 0 ? void 0 : _a.filename}`;
            const { title, _slug, priceRupiah, date, location, seats, isAvailable, category, content, } = req.body;
            const parsedPrice = Number(priceRupiah);
            const parsedSeats = Number(seats);
            const parsedAvailable = isAvailable === true || isAvailable === "true";
            if (!date)
                throw "Date is required";
            const parsedDate = new Date(date);
            if (isNaN(parsedDate.getTime())) {
                throw "Invalid date format";
            }
            if (!req.body.slug) {
                req.body.slug = req.body.title
                    .toLowerCase()
                    .trim()
                    .replace(/\s+/g, "-");
            }
            const data = {
                title,
                slug: req.body.slug,
                priceRupiah: parsedPrice,
                date: parsedDate,
                location,
                seats: parsedSeats,
                isAvailable: parsedAvailable,
                category,
                content,
                image: link,
            };
            if (req.author) {
                data.author = { connect: { email: req.author.email } };
            }
            else {
                throw "SALAH! Tidak ada user/author yang login";
            }
            const event = await prisma_1.default.event.create({ data });
            res.status(200).send({
                status: "ok",
                msg: "Selamat! POST Event dengan PRISMA",
                event,
            });
        }
        catch (err) {
            res.status(400).send({
                status: "error",
                msg: err.message || err.toString(),
            });
        }
    }
    async getEvent(req, res) {
        try {
            const { search, location, category, startDate, endDate } = req.query;
            let filter = {};
            if (search) {
                const matchedCategories = Object.values(client_1.Category).filter((cat) => cat.toLowerCase().includes(search.toLowerCase()));
                filter.OR = [
                    { title: { contains: search } },
                    { author: { name: { contains: search } } },
                    matchedCategories.length > 0
                        ? { category: { in: matchedCategories } }
                        : undefined,
                ].filter(Boolean);
            }
            if (location && Object.values(client_1.Location).includes(location)) {
                filter.location = location;
            }
            if (category && Object.values(client_1.Category).includes(category)) {
                filter.category = category;
            }
            if (startDate || endDate) {
                filter.date = {};
                if (startDate) {
                    filter.date.gte = new Date(startDate);
                }
                if (endDate) {
                    filter.date.lte = new Date(endDate);
                }
            }
            const event = await prisma_1.default.event.findMany({
                where: filter,
                include: { author: true },
                orderBy: { createdAt: "desc" },
            });
            res.status(200).send({
                status: "ok",
                msg: "Selamat! GET Banyak Events dengan PRISMA",
                event,
            });
        }
        catch (err) {
            console.error(err);
            res.status(400).send({
                status: "error",
                msg: err.message || err.toString(),
            });
        }
    }
    async getEventSlug(req, res) {
        try {
            if (!req.params.slug)
                throw "Slug tidak ditemukan";
            const event = await prisma_1.default.event.findUnique({
                where: { slug: req.params.slug },
                include: { author: true },
            });
            res.status(200).send({
                status: "ok",
                msg: "Selamat! GET 1 Event dengan PRISMA",
                event,
            });
        }
        catch (err) {
            res.status(400).send({
                status: "error",
                msg: err.message || err.toString(),
            });
        }
    }
    async updateEvent(req, res) {
        var _a;
        try {
            if (!req.file)
                throw "UPLOAD FILE dulu kocak";
            const link = `http://localhost:8000/api/public/events/${(_a = req === null || req === void 0 ? void 0 : req.file) === null || _a === void 0 ? void 0 : _a.filename}`;
            const eventId = Number(req.params.id);
            if (isNaN(eventId)) {
                return res
                    .status(400)
                    .send({ status: "error", msg: "ID format SALAH" });
            }
            const { _id, title, priceRupiah, date, location, seats, isAvailable, slug, category, content, } = req.body;
            const parsedPrice = Number(+priceRupiah);
            const parsedSeats = Number(+seats);
            if (!date)
                throw "Date is required";
            const parsedDate = new Date(date);
            if (isNaN(parsedDate.getTime())) {
                throw "Date tanggal SALAH FORMAT yaa";
            }
            const parsedAvailable = isAvailable === true || isAvailable === "true";
            if (!slug) {
                req.body.slug = req.body.title
                    .toLowerCase()
                    .trim()
                    .replace(/\s+/g, "-");
            }
            const event = await prisma_1.default.event.update({
                where: { id: eventId },
                data: {
                    title,
                    priceRupiah: parsedPrice,
                    date: parsedDate,
                    seats: parsedSeats,
                    isAvailable: parsedAvailable,
                    slug,
                    category,
                    content,
                    image: link,
                    location,
                    author: {
                        connect: {
                            email: req.author.email,
                        },
                    },
                },
            });
            if (!event)
                throw new Error("SALAH! Event GAGAL UPDATE dengan PRISMA");
            res.status(200).send({
                status: "ok",
                msg: "Selamat! UPDATE Event dengan PRISMA",
                event,
            });
        }
        catch (err) {
            res.status(400).send({
                status: "error",
                msg: err.message || err.toString(),
            });
        }
    }
    async editImage(req, res) {
        var _a;
        try {
            if (!req.file)
                throw "UPLOAD FILE dulu kocak";
            const link = `http://localhost:8000/api/public/events/${(_a = req === null || req === void 0 ? void 0 : req.file) === null || _a === void 0 ? void 0 : _a.filename}`;
            const existingImage = await prisma_1.default.event.findUnique({
                where: { id: +req.params.id },
            });
            if (!existingImage)
                throw new Error("event ID salah.");
            await prisma_1.default.event.update({
                where: { id: +req.params.id },
                data: {
                    image: link,
                },
            });
            res.status(200).send({
                status: "ok",
                msg: "Selamat! Edit Image Event success",
            });
        }
        catch (err) {
            res.status(400).send({
                status: "error",
                msg: err.message || err.toString(),
            });
        }
    }
    async deleteEvent(req, res) {
        try {
            const event = await prisma_1.default.event.delete({
                where: { id: +req.params.id },
            });
            if (!event)
                throw "SALAH! ID Event tidak ditemukan";
            res.status(200).send({
                status: "ok",
                msg: "Selamat! DELETE Event dengan PRISMA",
                event,
            });
        }
        catch (err) {
            res.status(400).send({
                status: "error",
                msg: err.message || err.toString(),
            });
        }
    }
}
exports.EventController = EventController;
