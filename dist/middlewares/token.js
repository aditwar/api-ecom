"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkAdmin = exports.verifyToken = void 0;
const jsonwebtoken_1 = require("jsonwebtoken");
const secret_key = process.env.SECRET_KEY_JWT;
const verifyToken = async (req, res, next) => {
    var _a;
    try {
        const _header = req.header("Authorization");
        const token = (_a = req.header("Authorization")) === null || _a === void 0 ? void 0 : _a.replace("Bearer ", "");
        if (!token)
            throw "SALAH! Token Author TIDAK ADA pakai PRISMA, JWT";
        const verifiedToken = (0, jsonwebtoken_1.verify)(token, secret_key);
        if (!verifiedToken)
            throw "SALAH! Token Author TIDAK VERIFIED pakai PRISMA, JWT";
        req.author = verifiedToken;
        req.users = verifiedToken;
        next();
    }
    catch (err) {
        res.status(400).send({
            status: "error",
            msg: err,
        });
    }
};
exports.verifyToken = verifyToken;
const checkAdmin = async (req, res, next) => {
    var _a;
    try {
        if (((_a = req.author) === null || _a === void 0 ? void 0 : _a.role) !== "Seller")
            throw "UnAuthorize! Bukan Seller lho";
        next();
    }
    catch (err) {
        res.status(400).send({
            status: "error",
            msg: err,
        });
    }
};
exports.checkAdmin = checkAdmin;
