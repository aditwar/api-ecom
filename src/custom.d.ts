import 'express';

declare global {
  namespace Express {
    interface Request {
      author?: {
        id: number;
        name: string;
        email: string;
        password: string;
        role: string;
        avatar?: string;
        isVerify?: boolean;
      };
      users?: {
        id: number;
        name: string;
        email: string;
        provider?: string;
        avatar?: string;
        role: string;
        isVerify?: boolean;
      };
    }
  }
}
