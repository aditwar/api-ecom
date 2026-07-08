import { Request, Response } from 'express';
import prisma from '../prisma';

export class OrderController {
  async createOrder(req: Request, res: Response) {
    try {
      if (!req.author?.email) throw 'Author tidak ditemukan';

      const reqauthor = await prisma.author.findUnique({
        where: { email: req.author.email },
      });
      if (!reqauthor) throw 'SALAH! Email tidak ditemukan yaa ...';

      const { pricePaid, eventId } = req.body

      if (!eventId) throw 'Event ID wajib dikirim di body';

      const event = await prisma.event.findUnique({
        where: { slug: req.params.slug },
      });
      if (!event) throw 'SALAH! Event Slug tidak ditemukan';

      if (event.id !== Number(eventId)) {
        throw 'SALAH! Event ID tidak cocok dengan slug';
      }

      const order = await prisma.order.create({
        data: {
          pricePaid: Number(pricePaid),
          author: { connect: { email: req.author.email } },
          event: { connect: { id: +event.id } },
        },
      });

      res.status(200).send({
        status: 'ok',
        msg: 'Order berhasil dibuat',
        order,
      });
    } catch (err: any) {
      res.status(400).send({
        status: 'error',
        msg: err.toString(),
      });
    }
  }

  async getOrder(req: Request, res: Response) {
    try {
      const orders = await prisma.order.findMany({
        include: {
          author: true,
          event: true,
        },
      });

      res.status(200).send({
        status: 'ok',
        msg: 'Berhasil get Orders',
        orders,
      });
    } catch (err) {
      res.status(400).send({
        status: 'error',
        msg: err,
      });
    }
  }

  async getOrderId(req: Request, res: Response) {
    try {
      const order = await prisma.order.findUnique({
        where: { id: Number(req.params.id) },
        include: {
          author: true,
          event: true,
        },
      });

      if (!order) throw 'SALAH! ID Order tidak ditemukan';

      res.status(200).send({
        status: 'ok',
        msg: 'Berhasil get ID Order',
        order,
      });
    } catch (err) {
      res.status(400).send({
        status: 'error',
        msg: err,
      });
    }
  }

  async deleteOrder(req: Request, res: Response) {
    try {
      const deleted = await prisma.order.delete({
        where: { id: Number(req.params.id) },
      });

      res.status(200).send({
        status: 'ok',
        msg: 'Order terhapus',
        deleted,
      });
    } catch (err: any) {
      res.status(400).send({
        status: 'error',
        msg: 'SALAH! ID Order tidak ditemukan atau sudah dihapus',
      });
    }
  }
}
