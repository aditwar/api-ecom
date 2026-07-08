import { Request, Response } from 'express';
import prisma from '../prisma';
import { Prisma, Category, Location } from '@prisma/client';
import { boolean } from 'yup';

export class EventController {
  async createEvent(req: Request, res: Response) {
    try {
      const link = `http://localhost:8000/api/public/events/${req?.file?.filename}`;

      const {
        title,
        slug,
        priceRupiah,
        date,
        location,
        seats,
        isAvailable,
        category,
        content,
      } = req.body;

      const parsedPrice = Number(priceRupiah);
      const parsedSeats = Number(seats);
      const parsedAvailable = isAvailable === true || isAvailable === 'true';

      if (!date) throw 'Date is required';
      const parsedDate = new Date(date);
      if (isNaN(parsedDate.getTime())) {
        throw 'Invalid date format';
      }

      if (!req.body.slug) {
        req.body.slug = req.body.title
          .toLowerCase()
          .trim()
          .replace(/\s+/g, '-');
      }

      const data: any = {
        title,
        slug: req.body.slug,
        priceRupiah: parsedPrice,
        date: parsedDate,
        location,
        seats: parsedSeats,
        isAvailable: parsedAvailable,
        category,
        content,
        image: link,
      };

      if (req.author) {
        data.author = { connect: { email: req.author.email } };
      } else {
        throw 'SALAH! Tidak ada user/author yang login';
      }

      const event = await prisma.event.create({ data });

      res.status(200).send({
        status: 'ok',
        msg: 'Selamat! POST Event dengan PRISMA',
        event,
      });
    } catch (err: any) {
      res.status(400).send({
        status: 'error',
        msg: err.message || err.toString(),
      });
    }
  }

  async getEvent(req: Request, res: Response) {
    try {
      const { search, location, category, startDate, endDate } = req.query;

      let filter: Prisma.EventWhereInput = {};

      if (search) {
        const matchedCategories = Object.values(Category).filter((cat) =>
          cat.toLowerCase().includes((search as string).toLowerCase()),
        );

        filter.OR = [
          { title: { contains: search as string } },
          { author: { name: { contains: search as string } } },
          matchedCategories.length > 0
            ? { category: { in: matchedCategories as Category[] } }
            : undefined,
        ].filter(Boolean) as Prisma.EventWhereInput[];
      }

      if (location && Object.values(Location).includes(location as Location)) {
        filter.location = location as Location;
      }

      if (category && Object.values(Category).includes(category as Category)) {
        filter.category = category as Category;
      }

      if (startDate || endDate) {
        filter.date = {};
        if (startDate) {
          (filter.date as Prisma.DateTimeFilter).gte = new Date(
            startDate as string,
          );
        }
        if (endDate) {
          (filter.date as Prisma.DateTimeFilter).lte = new Date(
            endDate as string,
          );
        }
      }

      const event = await prisma.event.findMany({
        where: filter,
        include: { author: true },
        orderBy: { createdAt: 'desc' },
      });

      res.status(200).send({
        status: 'ok',
        msg: 'Selamat! GET Banyak Events dengan PRISMA',
        event,
      });
    } catch (err: any) {
      console.error(err);

      res.status(400).send({
        status: 'error',
        msg: err.message || err.toString(),
      });
    }
  }

  async getEventSlug(req: Request, res: Response) {
    try {
      const event = await prisma.event.findUnique({
        where: { slug: req.params.slug },
        include: { author: true }, //! ini untuk GABUNGIN ke TABEL AUTHOR
      });
      res.status(200).send({
        status: 'ok',
        msg: 'Selamat! GET 1 Event dengan PRISMA',
        event,
      });
    } catch (err: any) {
      res.status(400).send({
        status: 'error',
        msg: err.message || err.toString(),
      });
    }
  }

  async updateEvent(req: Request, res: Response) {
    try {
      if (!req.file) throw 'UPLOAD FILE dulu kocak';
      const link = `http://localhost:8000/api/public/events/${req?.file?.filename}`;

      const eventId = Number(req.params.id);
      if (isNaN(eventId)) {
        return res
          .status(400)
          .send({ status: 'error', msg: 'ID format SALAH' });
      }

      const {
        id,
        title,
        priceRupiah,
        date,
        location,
        seats,
        isAvailable,
        slug,
        category,
        content,
      } = req.body;

      const parsedPrice = Number(+priceRupiah);
      const parsedSeats = Number(+seats);

      if (!date) throw 'Date is required';
      const parsedDate = new Date(date);
      if (isNaN(parsedDate.getTime())) {
        throw 'Date tanggal SALAH FORMAT yaa';
      }

      const parsedAvailable = isAvailable === true || isAvailable === 'true';

      if (!slug) {
        req.body.slug = req.body.title
          .toLowerCase()
          .trim()
          .replace(/\s+/g, '-');
      }

      const event = await prisma.event.update({
        where: { id: eventId },
        data: {
          title,
          priceRupiah: parsedPrice,
          date: parsedDate,
          seats: parsedSeats,
          isAvailable: parsedAvailable,
          slug,
          category,
          content,
          image: link,
          location,
          author: {
            connect: {
              email: req.author!.email,
            },
          },
        },
      });

      if (!event) throw new Error('SALAH! Event GAGAL UPDATE dengan PRISMA');

      res.status(200).send({
        status: 'ok',
        msg: 'Selamat! UPDATE Event dengan PRISMA',
        event,
      });
    } catch (err: any) {
      res.status(400).send({
        status: 'error',
        msg: err.message || err.toString(),
      });
    }
  }

  async editImage(req: Request, res: Response) {
    try {
      if (!req.file) throw 'UPLOAD FILE dulu kocak';
      const link = `http://localhost:8000/api/public/events/${req?.file?.filename}`;
      const existingImage = await prisma.event.findUnique({
        where: { id: +req.params.id },
      });

      if (!existingImage) throw new Error('event ID salah.');

      await prisma.event.update({
        where: { id: +req.params.id },
        data: {
          image: link,
        },
      });

      res.status(200).send({
        status: 'ok',
        msg: 'Selamat! Edit Image Event success',
      });
    } catch (err: any) {
      res.status(400).send({
        status: 'error',
        msg: err.message || err.toString(),
      });
    }
  }

  async deleteEvent(req: Request, res: Response) {
    try {
      const event = await prisma.event.delete({
        where: { id: +req.params.id },
      });

      if (!event) throw 'SALAH! ID Event tidak ditemukan';

      res.status(200).send({
        status: 'ok',
        msg: 'Selamat! DELETE Event dengan PRISMA',
        event,
      });
    } catch (err: any) {
      res.status(400).send({
        status: 'error',
        msg: err.message || err.toString(),
      });
    }
  }
}
