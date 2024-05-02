import crypto = require('crypto');
import {JWT_SECRET_KEY, PASSWORD_HASH_SECRET} from "@lib/config";
import jwt = require('jsonwebtoken');

export const generatePasswordHash = (password: string) => {
  return crypto
    .pbkdf2Sync(password, PASSWORD_HASH_SECRET, 1000, 64, 'sha512')
    .toString('hex');
};

export const validatePassword = (
  reqPassword: string,
  comparePassword: string
) => {
  const generatedPasswordHash = crypto
    .pbkdf2Sync(reqPassword, PASSWORD_HASH_SECRET, 1000, 64, 'sha512')
    .toString('hex');

  if (!(generatedPasswordHash === comparePassword))
    throw new Error("Invalid Email or Password")

  return generatedPasswordHash === comparePassword;
};

export const generateJSONTokenCredentials = (
  data: any,
  exp = Math.floor(Date.now() / 1000) + 60 * 360 // Expire in 6hrs by default
) => {
  return jwt.sign(
    {
      data,
      exp,
    },
    JWT_SECRET_KEY
  );
};