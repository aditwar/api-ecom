// apps/api/src/controllers/auth.js
import { Request, Response } from 'express';
import prisma from '../prisma';
import { sign } from 'jsonwebtoken';
import path from 'path';
import fs from 'fs'; //file sistem, saat handlebar
import nodemailer from 'nodemailer';
import Handlebars from 'handlebars';

const secret_key = process.env.SECRET_KEY_JWT || 'Pass1234';
const mailuser = process.env.MAIL_USER || 'wardanaaditya49@gmail.com';
const mailpass = process.env.MAIL_PASS || 'sfph lflq amkm ejmd';

export class AuthController {
  async getAuth(req: Request, res: Response) {
    try {
      const { name, email, avatar, provider, isVerify } = req.body;

      if (!email) {
        return res
          .status(400)
          .json({ success: false, error: 'Email required' });
      }

      let user = await prisma.users.findUnique({ where: { email } });

      if (!user) {
        user = await prisma.users.create({
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
          provider: req.body.provider,
          link: `http://localhost:3000/verify/oauth/${token}`,
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
      } else {
        user = await prisma.users.update({
          where: { email },
          data: {
            name,
            provider,
            avatar,
          },
        });
      }

      let author = await prisma.author.findUnique({ where: { email } });

      if (author) {
        await prisma.users.update({
          where: { email },
          data: { authorEmail: author.email },
        });
      }

      res.status(200).send({
        status: 'ok',
        msg: 'Selamat! Create/ Update User dengan PRISMA',
        user,
      });
    } catch (err: any) {
      res.status(400).send({
        status: 'error',
        msg: err.message || err.toString(),
      });
    }
  }

  async verifyAuth(req: Request, res: Response) {
    try {
      const user = await prisma.users.findUnique({
        where: { email: req.users!.email },
      });

      await prisma.users.update({
        where: { email: req.users!.email },
        data: {
          isVerify: true,
        },
      });

      res.status(200).send({
        status: 'ok',
        msg: 'Selamat! verifyAuth dengan PRISMA',
      });
    } catch (err: any) {
      res.status(400).send({
        status: 'error',
        msg: err.message || err.toString(),
      });
    }
  }

  upgradeToAuthor = async (req: Request, res: Response) => {
    try {
      const email = req.body.email;
      if (!email) {
        return res.status(400).json({ status: 'error', msg: 'Email required' });
      }

      let avatarUrl: string | undefined;
      if ((req as any).file) {
        avatarUrl = `/uploads/${(req as any).file.filename}`;
      } else if (req.body.avatar) {
        avatarUrl = req.body.avatar;
      }

      let author = await prisma.author.findUnique({ where: { email } });
      if (!author) {
        return res.status(404).json({
          status: 'error',
          msg: 'Author with this email not found, cannot link',
        });
      }

      author = await prisma.author.update({
        where: { email: author.email },
        data: {
          email,
          avatar: avatarUrl ?? author.avatar,
        },
      });

      const user = await prisma.users.findUnique({ where: { email } });
      if (user) {
        await prisma.users.update({
          where: { email: user.email },
          data: { authorEmail: author.email },
        });
      }

      return res
        .status(200)
        .json({ status: 'ok', msg: 'Linked User to Author', author });
    } catch (err: any) {
      return res
        .status(500)
        .json({ status: 'error', msg: err.message || 'Internal server error' });
    }
  };

  async deleteAuth(req: Request, res: Response) {
    try {
      const user = await prisma.users.delete({
        where: { email: req.users!.email },
      });
      if (!user) throw 'SALAH! Email User tidak ditemukan';

      res.status(200).send({
        status: 'ok',
        msg: 'Selamat! DELETE User dengan PRISMA',
        user,
      });
    } catch (err: any) {
      res.status(400).send({
        status: 'error',
        msg: err.message || err.toString(),
      });
    }
  }
}
