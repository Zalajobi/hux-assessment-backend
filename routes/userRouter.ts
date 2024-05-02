import {NextFunction, Request, Response, Router} from 'express';
import {createUserRequestSchema, LoginRequestSchema} from "@schemas/users";
import {JsonApiResponse} from "@util/responses";
import {createNewUser, getUserDataByEmail} from "@datastore/userStore";
import {generateJSONTokenCredentials, generatePasswordHash, validatePassword} from "@util/index";
import {JWTPayload} from "@util/object.types";

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

userRouter.post('/login', async (req:Request, res:Response, next:NextFunction) => {
  let jwtSignedData = '';

  try {
    const requestBody = LoginRequestSchema.parse(req.body);

    const userAccount = await getUserDataByEmail(requestBody.email);

    if (validatePassword(requestBody.password, userAccount?.password ?? '')) {
      const jwtData:JWTPayload = {
        id: userAccount?.id ?? '',
        email: userAccount?.email ?? '',
      };

      jwtSignedData = generateJSONTokenCredentials(
        jwtData,
      );
    }

    return JsonApiResponse(res, "Login Successful", true, {
      token: jwtSignedData
    }, 200)
  } catch (error) {
    next(error)
  }
})

export default userRouter;