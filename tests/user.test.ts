import express, {Request, Response, NextFunction, Router} from 'express';
import request from 'supertest';
import bodyParser from 'body-parser';
import { createUserRequestSchema } from '@schemas/usersSchemas';
import {generatePasswordHash} from "@util/index";
import {createNewUser} from "@datastore/userStore";
import {JsonApiResponse} from "@util/responses";

jest.mock('@util/responses', () => ({
  JsonApiResponse: jest.fn()
}));

jest.mock('@datastore/userStore', () => ({
  createNewUser: jest.fn().mockResolvedValue({
    message: 'User created successfully',
    success: true
  }),
}));

jest.mock('@util/index', () => ({
  generatePasswordHash: jest.fn(),
}));

jest.mock('@schemas/usersSchemas', () => ({
  createUserRequestSchema: {
    parse: jest.fn()
  },
}));

const userRouter = Router();
userRouter.post('/create', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const requestBody = createUserRequestSchema.parse(req.body);
    requestBody.password = generatePasswordHash(requestBody.password);
    const newUser = await createNewUser(requestBody);

    console.log({
      message: newUser.message,
      success: newUser.success
    })

    return JsonApiResponse(res, newUser.message, newUser.success, null, newUser.success ? 201 : 500);
  } catch (error) {
    next(error)
  }
})

const app = express();
app.use(bodyParser.json());
app.use(userRouter);

// Tests
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
