import {NextFunction, Request, Response, Router} from 'express';
import {createUserRequestSchema} from "@schemas/users";
import {JsonApiResponse} from "@util/responses";
import {createNewUser} from "@datastore/userStore";
import {generatePasswordHash} from "@util/index";

const userRouter = Router();

userRouter.post('/create', async (req:Request, res:Response, next:NextFunction) => {
  try {
    const requestBody = createUserRequestSchema.parse(req.body);
    requestBody.password = generatePasswordHash(requestBody.password)

    const newUser = await createNewUser(requestBody);

    return JsonApiResponse(res, newUser.message, newUser.success, null, newUser.success ? 201 : 500)
  } catch (error) {
    next(error)
  }
})

export default userRouter;