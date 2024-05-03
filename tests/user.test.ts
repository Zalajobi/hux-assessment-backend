import express, {Request, Response, NextFunction, Router} from 'express';
import request from 'supertest';
import bodyParser from 'body-parser';
import {LoginRequestSchema, createUserRequestSchema } from '@schemas/usersSchemas';
import {generateJSONTokenCredentials, generatePasswordHash, validatePassword} from "@util/index";
import {createNewUser, getUserDataByEmail} from "@datastore/userStore";
import {JsonApiResponse} from "@util/responses";
import * as console from "console";

jest.mock('@util/responses', () => ({
  JsonApiResponse: jest.fn()
}));

jest.mock('@datastore/userStore', () => ({
  createNewUser: jest.fn().mockResolvedValue({
    message: 'User created successfully',
    success: true
  }),
  getUserDataByEmail: jest.fn().mockResolvedValue({
    email: 'johnDoe@gmail.com',
    password: 'Password123'
  })
}));

jest.mock('@util/index', () => ({
  generatePasswordHash: jest.fn(),
  validatePassword: jest.fn(),
  generateJSONTokenCredentials: jest.fn()
}));

jest.mock('@schemas/usersSchemas', () => ({
  createUserRequestSchema: {
    parse: jest.fn()
  },
  LoginRequestSchema: {
    parse: jest.fn()
  }
}));

const userRouter = Router();

// Create User
userRouter.post('/create', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const requestBody = createUserRequestSchema.parse(req.body);
    requestBody.password = generatePasswordHash(requestBody.password);
    const newUser = await createNewUser(requestBody);

    return JsonApiResponse(res, newUser.message, newUser.success, null, newUser.success ? 201 : 500);
  } catch (error) {
    next(error)
  }
})

// Login
userRouter.post('/login', async (req: Request, res: Response, next: NextFunction) => {
  let jwtSignedData = '';

  try {
    const createUser = {
      name: 'John Doe',
      email: 'johnDoe@gmail.com',
      password: 'Password123'
    };
    createUser.password = generatePasswordHash(createUser.password);
    await createNewUser(createUser);

    const requestBody = LoginRequestSchema.parse(req.body);
    const userAccount = await getUserDataByEmail(requestBody.email);

    if (validatePassword(requestBody.password, userAccount?.password ?? '')) {
      const jwtData = {
        id: userAccount?.id ?? '',
        email: userAccount?.email ?? ''
      }

      jwtSignedData = generateJSONTokenCredentials(jwtData);
    }

    return JsonApiResponse(res, 'Login Successful', true, {token: jwtSignedData}, 200);
  } catch (error) {
    next(error)
  }
})


const app = express();
app.use(bodyParser.json());
app.use(userRouter);

// Create User Test
describe('POST /create', () => {
  it('should create a new user and return 201', async () => {
    const newUser = {
      message: 'User created successfully',
      success: true
    };

    (createUserRequestSchema.parse as jest.Mock).mockImplementation((data: any) => data);
    (generatePasswordHash as jest.Mock).mockImplementation((password: string) => password);
    (createNewUser as jest.Mock).mockResolvedValue(newUser);
    (JsonApiResponse as jest.Mock).mockImplementation((res: Response, message: string, success: boolean, _: any, statusCode: number) => res.status(statusCode).send({ message, success }));

    const response = await request(app)
      .post('/create')
      .send({ name: 'John Doe', password: 'Password123', email: 'johnDoe@gmail.com' });

    expect(response.statusCode).toBe(201);
    expect(response.body).toEqual({ message: newUser.message, success: newUser.success });
    expect(createUserRequestSchema.parse).toBeCalledWith({ name: 'John Doe', password: 'Password123', email: 'johnDoe@gmail.com' });
    expect(generatePasswordHash).toBeCalledWith('Password123');
    expect(createNewUser).toBeCalledWith({ name: 'John Doe', password: 'Password123', email: 'johnDoe@gmail.com' });
  });

  it('should handle errors and forward to error handler', async () => {
    const error = new Error('Validation failed');
    (createUserRequestSchema.parse as jest.Mock).mockImplementation(() => { throw error; });

    const response = await request(app).post('/create').send({ name: 'John Doe', password: 'Password123' });

    expect(response.statusCode).toBe(500); // Assuming your error handler sends a 500 for this type of error
  });
});

// Login Test
describe('POST /login', () => {
  it('Should successfully login and return a jwt token', async () => {
    const mockUser = {
      email: 'johnDoe@gmail.com',
      password: 'Password123'
    }

    const mockJtwToken = 'jwt_token';

    (LoginRequestSchema.parse as jest.Mock).mockImplementation((data: any) => data);
    (generatePasswordHash as jest.Mock).mockImplementation((password: string) => password);
    (getUserDataByEmail as jest.Mock).mockResolvedValue(mockUser);
    (validatePassword as jest.Mock).mockReturnValue(true);
    (generateJSONTokenCredentials as jest.Mock).mockReturnValue(mockJtwToken);
    (JsonApiResponse as jest.Mock).mockImplementation((res: Response, message: string, success: boolean, _: any, statusCode: number) => res.status(statusCode).send({ message, success }));

    const response = await request(app)
      .post('/login')
      .send({ email: mockUser.email, password: mockUser.password });

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({ message: 'Login Successful', success: true });
  })
})
