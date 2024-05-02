import { Response } from 'express';

// Global router response
export const JsonApiResponse = (
  res: Response,
  message: string,
  success: boolean,
  data: Record<string, any> | Record<string, any>[] | null,
  statusCode: number,
  error?: Record<string, any>
) => {
  res.status(statusCode).json({
    message,
    success,
    data,
    err: error
  });
};

// Default Response to send from calls to store
export const DefaultJsonResponse = (
  message: string,
  data: any,
  success?: boolean
) => {
  return {
    message,
    data,
    success,
  };
};
