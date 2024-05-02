import {NextFunction, Request, Response, Router} from 'express';
import {createUserRequestSchema} from "@schemas/users";

const userRouter = Router();

userRouter.post('/create', (req:Request, res:Response, next:NextFunction) => {
  try {
    const requestBody = createUserRequestSchema.parse(req.body);
  } catch (error) {
    next(error)
  }
})

export default userRouter;