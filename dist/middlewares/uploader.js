"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploader = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const uploader = (filePrefix, folderName) => {
    const root = path_1.default.resolve(__dirname, '../../public'); // absolute path
    const defaultDir = path_1.default.join(__dirname, '../../public');
    const storage = multer_1.default.diskStorage({
        destination: (req, file, cb) => {
            const destination = folderName ? defaultDir + folderName : defaultDir;
            cb(null, destination);
        },
        filename: (req, file, cb) => {
            const originalNameParts = file.originalname.split('.');
            const fileExtension = originalNameParts[originalNameParts.length - 1];
            const newFileName = filePrefix + Date.now() + '.' + fileExtension;
            cb(null, newFileName);
        },
    });
    return (0, multer_1.default)({ storage: storage });
};
exports.uploader = uploader;
