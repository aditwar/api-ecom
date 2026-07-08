import { body, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

export const validateRegister = [
  body('name').notEmpty().withMessage('Isi nama dulu yaa cinta!'),
  body('email')
    .notEmpty()
    .withMessage('Isi email dulu yach, jangan lupa')
    .isEmail()
    .withMessage('Format email salah lho!'),
  body('password').notEmpty().withMessage('Butuh password lho!'),

  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).send({
        status: 'error',
        msg: errors.array(),
      });
    }
    next();
  },
];

export const validateLogin = [
  body('email')
    .notEmpty()
    .withMessage('Isi email dulu yach, jangan lupa')
    .isEmail()
    .withMessage('Format email salah lho!'),
  body('password').notEmpty().withMessage('Butuh password lho!'),

  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).send({
        status: 'error',
        msg: errors.array(),
      });
    }
    next();
  },
];
