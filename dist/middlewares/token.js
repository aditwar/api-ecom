"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkAdmin = exports.verifyToken = void 0;
const jsonwebtoken_1 = require("jsonwebtoken");
const secret_key = process.env.SECRET_KEY_JWT || 'Pass1234';
const verifyToken = async (req, res, next) => {
    try {
        const header = req.header('Authorization');
        const token = req.header('Authorization')?.replace('Bearer ', '');
        if (!token)
            throw 'SALAH! Token Author TIDAK ADA pakai PRISMA, JWT';
        const verifiedToken = (0, jsonwebtoken_1.verify)(token, secret_key);
        if (!verifiedToken)
            throw 'SALAH! Token Author TIDAK VERIFIED pakai PRISMA, JWT';
        req.author = verifiedToken;
        req.users = verifiedToken;
        next();
    }
    catch (err) {
        res.status(400).send({
            status: 'error',
            msg: err,
        });
    }
};
exports.verifyToken = verifyToken;
const checkAdmin = async (req, res, next) => {
    try {
        if (req.author?.role !== 'Seller')
            throw 'UnAuthorize! Bukan Seller lho';
        next();
    }
    catch (err) {
        res.status(400).send({
            status: 'error',
            msg: err,
        });
    }
};
exports.checkAdmin = checkAdmin;
