import {NextFunction, Request, Response, Router} from 'express';
import {createUserRequestSchema} from "@schemas/users";
import {JsonApiResponse} from "@util/responses";
import {createNewUser} from "@datastore/userStore";

const userRouter = Router();

userRouter.post('/create', async (req:Request, res:Response, next:NextFunction) => {
  try {
    const requestBody = createUserRequestSchema.parse(req.body);

    await createNewUser(requestBody);

    return JsonApiResponse(res, 'User created successfully', true, requestBody, 201)
  } catch (error) {
    next(error)
  }
})

export default userRouter;