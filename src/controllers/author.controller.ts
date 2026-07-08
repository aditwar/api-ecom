import { Request, Response } from 'express';
import prisma from '../prisma';
import { compare, genSalt, hash } from 'bcryptjs';
import { sign } from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import path from 'path';
import fs from 'fs';
import Handlebars from 'handlebars';

const base_url = process.env.BASE_URL_API;
const secret_key = process.env.SECRET_KEY_JWT;
const mailuser = process.env.MAIL_USER;
const mailpass = process.env.MAIL_PASS;

export class AuthorController {
  async getAuthor(req: Request, res: Response) {
    try {
      const author = await prisma.author.findMany();

      res.status(200).send({
        status: 'ok',
        msg: 'Selamat! GET Author dengan PRISMA',
        author,
      });
    } catch (err: any) {
      res.status(400).send({
        status: 'error',
        msg: err.message || err.toString(),
      });
    }
  }

  async getAuthorId(req: Request, res: Response) {
    try {
      const author = await prisma.author.findUnique({
        where: { email: req.author!.email },
      });

      if (!author) throw 'SALAH! email Author tidak ditemukan';

      res.status(200).send({
        status: 'ok',
        msg: 'Selamat! GET email Author dengan PRISMA',
        author,
      });
    } catch (err: any) {
      res.status(400).send({
        status: 'error',
        msg: err.message || err.toString(),
      });
    }
  }

  async createAuthor(req: Request, res: Response) {
    try {
      const { name, email, password, confirmPassword, role } = req.body;

      const existNameAuthor = await prisma.author.findUnique({
        where: { name },
      });
      if (existNameAuthor) throw 'SALAH! Name sudah pernah dipakai yaa ...';

      const existEmailAuthor = await prisma.author.findUnique({
        where: { email },
      });
      if (existEmailAuthor) throw 'SALAH! Email sudah pernah dipakai yaa ...';

      if (password !== confirmPassword)
        throw 'SALAH! Password dan Confirm Password tidak sama yaa ...';

      const salt = await genSalt(10);
      const hashPassword = await hash(password, salt);

      const author = await prisma.author.create({
        data: { name, email, password: hashPassword, role },
      });

      const payload = {
        email: author.email,
      };
      const token = sign(payload, secret_key!, {
        expiresIn: '1d',
      });

      const templatePath = path.join(
        __dirname,
        '../handlebars',
        'template.hbs',
      );

      const templateSource = fs.readFileSync(templatePath, 'utf-8');
      const compileTemplate = Handlebars.compile(templateSource);
      const html = compileTemplate({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        role: author.role,
        link: `http://localhost:3000/verify/${token}`,
      });

      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: mailuser,
          pass: mailpass,
        },
      });

      await transporter.sendMail({
        from: mailuser,
        to: req.body.email,
        subject: 'Verify New User from MAILER',
        html: html,
      });

      res.status(200).send({
        status: 'ok',
        msg: 'Selamat! Author CREATED dengan PRISMA',
        author,
      });

    } catch (err: any) {
      res.status(400).send({
        status: 'error',
        msg: err.message || err.toString(),
      });
    }
  }

  async verifyAuthor(req: Request, res: Response) {
    try {
      const author = await prisma.author.findUnique({
        where: { email: req.author!.email },
      });

      await prisma.author.update({
        where: { email: req.author!.email },
        data: { isVerify: true },
      });
      res.status(200).send({
        status: 'ok',
        msg: 'Selamat! verifyAuthor dengan PRISMA',
      });
    } catch (err: any) {
      res.status(400).send({
        status: 'error',
        msg: err.message || err.toString(),
      });
    }
  }

  async loginAuthor(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      const loginEmailAuthor = await prisma.author.findUnique({
        where: { email: email },
      });
      if (!loginEmailAuthor)
        throw 'SALAH! Email Author tidak ditemukan dengan PRISMA';

      if (!loginEmailAuthor.isVerify)
        throw 'BELUM ADA VERIFIKASI EMAIL, cek Email dulu yaa';

      const loginPasswordAuthor = await compare(
        password,
        loginEmailAuthor.password,
      );
      if (!loginPasswordAuthor)
        throw 'SALAH! Password Author salah dengan PRISMA, bcryptjs';

      const roleEmailAuthor = {
        email: loginEmailAuthor.email,
        role: loginEmailAuthor.role,
      };
      const tokenAuthor = sign(roleEmailAuthor, secret_key!, {
        expiresIn: '1d',
      });
      if (!tokenAuthor) throw 'GAGAL STORE TOKEN';

      res.status(200).send({
        status: 'ok',
        msg: 'Selamat! LOGIN Author dengan PRISMA',
        tokenAuthor,
        author: loginEmailAuthor,
      });
    } catch (err: any) {
      res.status(400).send({
        status: 'error',
        msg: err.message || err.toString(),
      });
    }
  }

  async editAvatar(req: Request, res: Response) {
    try {
      if (!req.file) throw 'UPLOAD FILE dulu kocak';

      const existingAuthor = await prisma.author.findUnique({
        where: { email: req.author?.email },
      });

      const link = `${base_url}/public/avatar/${req?.file?.filename}`;

      await prisma.author.update({
        where: { email: req.author!.email },
        data: { avatar: link },
      });

      res.status(200).send({
        status: 'ok',
        msg: 'Selamat! Edit Avatar success with uploader',
      });
    } catch (err: any) {
      res.status(400).send({
        status: 'error',
        msg: err.message || err.toString(),
      });
    }
  }

  async updateAuthor(req: Request, res: Response) {
    try {
      const { name, email, password, role, avatar, usersEmail } = req.body;

      const link = req.file
        ? `${base_url}/public/avatar/${req.file.filename}`
        : avatar === 'null'
          ? null
          : avatar;

      const author = await prisma.author.update({
        where: { email: req.author!.email },
        data: {
          name,
          email,
          password,
          role,
          avatar: link,
          ...(usersEmail ? { users: { connect: { email: usersEmail } } } : {}),
        },
      });
      if (!author) throw new Error('SALAH! Author GAGAL UPDATE dengan PRISMA');

      res.status(200).send({
        status: 'ok',
        msg: 'Selamat! UPDATE Author dengan PRISMA',
        author,
      });
    } catch (err: any) {
      res.status(400).send({
        status: 'error',
        msg: err.message || err.toString(),
      });
    }
  }

  async linkAuthorUsers(req: Request, res: Response) {
    try {
      const { authorEmail, usersEmail, provider } = req.body;

      const author = await prisma.author.findUnique({
        where: { email: authorEmail },
      });
      const user = await prisma.users.findUnique({
        where: { email: usersEmail },
      });
      if (!author || !user) {
        return res
          .status(404)
          .json({ ok: false, msg: 'User atau Author tidak ditemukan' });
      }

      const updatedUser = await prisma.users.update({
        where: { email: usersEmail },
        data: {
          provider,
          authorEmail: authorEmail,
        },
      });

      res.status(200).send({
        status: 'ok',
        msg: 'Selamat! Link Author dengan PRISMA',
        user: updatedUser,
        author,
      });
    } catch (err: any) {
      res.status(400).send({
        status: 'error',
        msg: err.message || err.toString(),
      });
    }
  }

  async deleteAuthor(req: Request, res: Response) {
    try {
      const { id, email } = req.body;

      const lastAuthor = await prisma.author.findFirst({
        orderBy: { id: 'desc' },
      });
      if (!lastAuthor) {
        return res
          .status(400)
          .json({ ok: false, msg: 'Tidak ada Author terakhir' });
      }

      await prisma.event.updateMany({
        where: { authorEmail: email },
        data: { authorEmail: lastAuthor.email },
      });

      await prisma.order.deleteMany({
        where: { authorEmail: email },
      });

      await prisma.users.deleteMany({
        where: { email },
      });

      const delAuthor = await prisma.author.delete({
        where: { email: email },
      });

      res.status(200).json({
        ok: true,
        msg: 'Author berhasil dihapus, Event dialihkan, Order & Invoice dihapus',
        delAuthor,
      });
    } catch (err: any) {
      res.status(400).json({ ok: false, msg: err.message || err.toString() });
    }
  }
}
