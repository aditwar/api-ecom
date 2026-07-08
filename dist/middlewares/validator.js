"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateLogin = exports.validateRegister = void 0;
const express_validator_1 = require("express-validator");
exports.validateRegister = [
    (0, express_validator_1.body)("name").notEmpty().withMessage("Isi nama dulu yaa cinta!"),
    (0, express_validator_1.body)("email")
        .notEmpty()
        .withMessage("Isi email dulu yach, jangan lupa")
        .isEmail()
        .withMessage("Format email salah lho!"),
    (0, express_validator_1.body)("password").notEmpty().withMessage("Butuh password lho!"),
    (req, res, next) => {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).send({
                status: "error",
                msg: errors.array(),
            });
        }
        next();
    },
];
exports.validateLogin = [
    (0, express_validator_1.body)("email")
        .notEmpty()
        .withMessage("Isi email dulu yach, jangan lupa")
        .isEmail()
        .withMessage("Format email salah lho!"),
    (0, express_validator_1.body)("password").notEmpty().withMessage("Butuh password lho!"),
    (req, res, next) => {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).send({
                status: "error",
                msg: errors.array(),
            });
        }
        next();
    },
];
