import {NextFunction, Request, Response, Router} from 'express';
import {
  createUserRequestSchema,
  LoginRequestSchema
} from "@schemas/usersSchemas";
import {JsonApiResponse} from "@util/responses";
import {createNewUser, getUserDataByEmail, getUserDataById} from "@datastore/userStore";
import {generateJSONTokenCredentials, generatePasswordHash, validatePassword, verifyJSONToken} from "@util/index";
import {JWTPayload} from "@util/object.types";
import {bearerTokenSchema} from "@schemas/commonSchemas";

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

userRouter.get('/details', async (req:Request, res:Response, next:NextFunction) => {
  try {
    const requestBody = bearerTokenSchema.parse({
      ...req.headers
    })

    const decryptedData = verifyJSONToken(requestBody.authorization);

    const userData = await getUserDataById(decryptedData?.id ?? '');

    return JsonApiResponse(res, "Success", true, userData, 200)
  } catch (error) {
    next(error)
  }
})

export default userRouter;