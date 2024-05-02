import {z} from "zod";
import {createUserRequestSchema} from "@schemas/users";
import {userRepo} from "@typeorm/repository";
import * as console from "console";
import {User} from "@typeorm/entity/user";
import {DefaultJsonResponse} from "@util/responses";

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

  const newUser = await userRepository.save(new User(userData))

  if (!newUser)
    throw new Error("Error Creating User")

  return DefaultJsonResponse('User Created Successfully', null, true)
}
