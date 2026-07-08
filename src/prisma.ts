// SETUP PERTAMA utk PRISMA

import { PrismaClient } from "@prisma/client";

export default new PrismaClient({ log: ['query', 'info', 'warn', 'error'] })