import {z} from "zod";

export const ONE_MILLION = 1000000;

export const bearerTokenSchema = z.object({
  authorization: z.string().refine((data) => data.startsWith('Bearer '), {
    message: "Authorization header must start with 'Bearer '",
  }).transform((data) => data.replace('Bearer ', '')),
});
