import { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import {
  EntityNotFoundError,
  EntityPropertyNotFoundError,
  QueryFailedError,
  QueryRunnerAlreadyReleasedError,
  TransactionAlreadyStartedError,
  TransactionNotStartedError,
  UpdateValuesMissingError,
} from 'typeorm';
import { JsonWebTokenError } from 'jsonwebtoken';
import { JsonApiResponse } from '@util/responses';

export const errorMiddleware = async (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.log('Handle Middleware Error');

  // Schema Validation Error
  if (err instanceof ZodError) {
    console.log('Schema Validation Error');
    JsonApiResponse(res, 'Validation Error', false, null, 400, err.format());
    return;
  }

  // Query Failed Error
  if (err instanceof QueryFailedError) {
    console.log('Database Query Failed');
    JsonApiResponse(res, err.message, false, null, 500, err);
    return;
  }

  // Entity Not Found
  if (err instanceof EntityNotFoundError) {
    console.log('Entity Not Found');
    JsonApiResponse(res, err.message, false, null, 404, err);
    return;
  }

  // Query Runner Already Released Error
  if (err instanceof QueryRunnerAlreadyReleasedError) {
    console.log('Query Runner Already Released');
    JsonApiResponse(res, err.message, false, null, 500, err);
  }

  // Transaction Already Started Error
  if (err instanceof TransactionAlreadyStartedError) {
    console.log('Transaction Already Started');
    JsonApiResponse(res, err.message, false, null, 500, err);
    return;
  }

  // Transaction Not Started Error
  if (err instanceof TransactionNotStartedError) {
    console.log('Transaction Not Started');
    JsonApiResponse(res, err.message, false, null, 500, err);
    return;
  }

  // JWT Error
  if (err instanceof JsonWebTokenError) {
    console.log('JWT Error');
    JsonApiResponse(res, err.message, false, null, 401, err);
    return;
  }

  // Error Updating Data - Missing Columns to update
  if (err instanceof UpdateValuesMissingError) {
    console.log('Missing Update Body');
    JsonApiResponse(res, err.message, false, null, 500, err);
    return;
  }

  // Entity Not Found Error - TypeORM Error
  if (err instanceof EntityPropertyNotFoundError) {
    console.log('Entity Property Not Found');
    JsonApiResponse(res, err.message, false, null, 401, err);
    return;
  }

  // Generic Error
  if (err instanceof Error) {
    console.log('General Error');
    JsonApiResponse(res, err.message, false, null, 500, err);
    return;
  }
};
