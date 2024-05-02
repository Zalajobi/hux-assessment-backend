import {z} from "zod";

export const bearerTokenSchema = z.object({
  Authorization: z.string().refine((data) => data.startsWith('Bearer '), {
    message: "Authorization header must start with 'Bearer '",
  }).transform((data) => data.replace('Bearer ', '')),
});