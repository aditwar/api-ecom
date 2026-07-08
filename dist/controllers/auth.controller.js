"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const prisma_1 = __importDefault(require("../prisma"));
const jsonwebtoken_1 = require("jsonwebtoken");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs")); //file sistem, saat handlebar
const nodemailer_1 = __importDefault(require("nodemailer"));
const handlebars_1 = __importDefault(require("handlebars"));
const secret_key = process.env.SECRET_KEY_JWT;
const mailuser = process.env.MAIL_USER;
const mailpass = process.env.MAIL_PASS;
class AuthController {
    constructor() {
        this.upgradeToAuthor = async (req, res) => {
            try {
                const email = req.body.email;
                if (!email) {
                    return res.status(400).json({ status: "error", msg: "Email required" });
                }
                let avatarUrl;
                if (req.file) {
                    avatarUrl = `/uploads/${req.file.filename}`;
                }
                else if (req.body.avatar) {
                    avatarUrl = req.body.avatar;
                }
                let author = await prisma_1.default.author.findUnique({ where: { email } });
                if (!author) {
                    return res.status(404).json({
                        status: "error",
                        msg: "Author with this email not found, cannot link",
                    });
                }
                author = await prisma_1.default.author.update({
                    where: { email: author.email },
                    data: {
                        email,
                        avatar: avatarUrl !== null && avatarUrl !== void 0 ? avatarUrl : author.avatar,
                    },
                });
                const user = await prisma_1.default.users.findUnique({ where: { email } });
                if (user) {
                    await prisma_1.default.users.update({
                        where: { email: user.email },
                        data: { authorEmail: author.email },
                    });
                }
                return res
                    .status(200)
                    .json({ status: "ok", msg: "Linked User to Author", author });
            }
            catch (err) {
                return res
                    .status(500)
                    .json({ status: "error", msg: err.message || "Internal server error" });
            }
        };
    }
    async getAuth(req, res) {
        try {
            const { name, email, avatar, provider, _isVerify } = req.body;
            if (!email) {
                return res
                    .status(400)
                    .json({ success: false, error: "Email required" });
            }
            let user = await prisma_1.default.users.findUnique({ where: { email } });
            if (!user) {
                user = await prisma_1.default.users.create({
                    data: {
                        name,
                        email,
                        provider,
                        avatar,
                        isVerify: false,
                    },
                });
                const payload = {
                    email: user.email,
                };
                const token = (0, jsonwebtoken_1.sign)(payload, secret_key, {
                    expiresIn: "1d",
                });
                const templatePath = path_1.default.join(__dirname, "../handlebars", "template.hbs");
                const templateSource = fs_1.default.readFileSync(templatePath, "utf-8");
                const compileTemplate = handlebars_1.default.compile(templateSource);
                const html = compileTemplate({
                    name: req.body.name,
                    email: req.body.email,
                    provider: req.body.provider,
                    link: `http://localhost:3000/verify/oauth/${token}`,
                });
                const transporter = nodemailer_1.default.createTransport({
                    service: "gmail",
                    auth: {
                        user: mailuser,
                        pass: mailpass,
                    },
                });
                await transporter.sendMail({
                    from: mailuser,
                    to: req.body.email,
                    subject: "Verify New User from MAILER",
                    html: html,
                });
            }
            else {
                user = await prisma_1.default.users.update({
                    where: { email },
                    data: {
                        name,
                        provider,
                        avatar,
                    },
                });
            }
            let author = await prisma_1.default.author.findUnique({ where: { email } });
            if (author) {
                await prisma_1.default.users.update({
                    where: { email },
                    data: { authorEmail: author.email },
                });
            }
            res.status(200).send({
                status: "ok",
                msg: "Selamat! Create/ Update User dengan PRISMA",
                user,
            });
        }
        catch (err) {
            res.status(400).send({
                status: "error",
                msg: err.message || err.toString(),
            });
        }
    }
    async verifyAuth(req, res) {
        try {
            console.log("bE controller verifyUsers from custom.d.ts:", req.users);
            const _user = await prisma_1.default.users.findUnique({
                where: { email: req.users.email },
            });
            await prisma_1.default.users.update({
                where: { email: req.users.email },
                data: {
                    isVerify: true,
                },
            });
            res.status(200).send({
                status: "ok",
                msg: "Selamat! verifyAuth dengan PRISMA",
            });
        }
        catch (err) {
            res.status(400).send({
                status: "error",
                msg: err.message || err.toString(),
            });
        }
    }
    async deleteAuth(req, res) {
        try {
            const user = await prisma_1.default.users.delete({
                where: { email: req.users.email },
            });
            if (!user)
                throw "SALAH! Email User tidak ditemukan";
            res.status(200).send({
                status: "ok",
                msg: "Selamat! DELETE User dengan PRISMA",
                user,
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
exports.AuthController = AuthController;
