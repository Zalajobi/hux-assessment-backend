import { NextFunction, Request, Response } from 'express';
import {bearerTokenSchema} from "@schemas/commonSchemas";
import {verifyJSONToken} from "@util/index";
import {JsonApiResponse} from "@util/responses";

// Verify User has permission to access the endpoint... Skip verification for whitelisted endpoints
export const authorizeRequest = (req: Request, res: Response, next: NextFunction) => {
  const whitelistedEndpoints = [
    '/user/login',
    'user/create',
  ];


  if (whitelistedEndpoints.some((whitelist) => req.url.includes(whitelist))) {
    next();
    return;
  } else {
    const { authorization } = bearerTokenSchema.parse(req.headers);
    const verifiedUser = verifyJSONToken(authorization);

    if (!verifiedUser) {
      JsonApiResponse(
        res,
        'Not Authorized',
        false,
        null,
        401,
      )
      return;
    } else {
      next();
      return;
    }
  }
};
