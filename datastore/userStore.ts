import {z} from "zod";
import {createUserRequestSchema} from "@schemas/users";
import {userRepo} from "@typeorm/repository";
import * as console from "console";

export const createNewUser = async (userData: z.infer<typeof createUserRequestSchema>) => {
  const userRepository = userRepo();

  const isUserUnique = await userRepository
    .createQueryBuilder('user')
    .where('LOWER(user.email) LIKE :email', {
      email: userData.email,
    })
    .getCount()

  if (isUserUnique > 0) {
    throw new Error('User with email already exists')
  }
}
