import { NextFunction, Request, Response } from 'express';
import { verify } from 'jsonwebtoken';

const secret_key = process.env.SECRET_KEY_JWT || 'Pass1234';

type IAuthor = {
  id: number;
  name: string;
  email: string;
  password: string;
  role: string;
  avatar: string;
};

type IUsers = {
  id: number;
  name: string;
  email: string;
  provider: string;
  avatar: string;
  role: string;
};

export const verifyToken = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const header = req.header('Authorization');

    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) throw 'SALAH! Token Author TIDAK ADA pakai PRISMA, JWT';

    const verifiedToken = verify(token, secret_key);
    if (!verifiedToken)
      throw 'SALAH! Token Author TIDAK VERIFIED pakai PRISMA, JWT';

    req.author = verifiedToken as IAuthor;
    req.users = verifiedToken as IUsers;

    next();
  } catch (err: any) {
    res.status(400).send({
      status: 'error',
      msg: err,
    });
  }
};

export const checkAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (req.author?.role !== 'Seller') throw 'UnAuthorize! Bukan Seller lho';
    next();
  } catch (err: any) {
    res.status(400).send({
      status: 'error',
      msg: err,
    });
  }
};
