import { z } from 'zod';

export const createUserRequestSchema = z.object({
  email: z.string(),
  password: z.string().min(8),
  name: z.string(),
}).refine((data) => {
  return !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(data.email);
});