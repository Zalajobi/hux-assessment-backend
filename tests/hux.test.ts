import express, {Request, Response, NextFunction, Router} from 'express';
import request from 'supertest';
import bodyParser from 'body-parser';
import {LoginRequestSchema, createUserRequestSchema } from '@schemas/usersSchemas';
import {generateJSONTokenCredentials, generatePasswordHash, validatePassword, verifyJSONToken} from "@util/index";
import {createNewUser, getUserDataByEmail} from "@datastore/userStore";
import {JsonApiResponse} from "@util/responses";
import {createContactRequestSchema, UpdateContactRequestSchema} from "@schemas/contactsSchemas";
import {createContact, updateContactById} from "@datastore/contactStore";
import {contactRepo} from "@typeorm/repository";

jest.mock('@util/responses', () => ({
  JsonApiResponse: jest.fn()
}));

jest.mock('@typeorm/repository', () => ({
  contactRepo: () => ({
    update: jest.fn().mockResolvedValue({ affected: 1 })
  })
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

jest.mock('@datastore/contactStore', () => ({
  createContact: jest.fn().mockResolvedValue({
    message: 'Contact Successfully Created',
    success: true
  }),
  updateContactById: jest.fn().mockResolvedValue({
    message: 'Contact Successfully Created',
    success: true
  }),
}));

jest.mock('@util/index', () => ({
  generatePasswordHash: jest.fn(),
  validatePassword: jest.fn(),
  generateJSONTokenCredentials: jest.fn(),
  verifyJSONToken: jest.fn()
}));

jest.mock('@schemas/usersSchemas', () => ({
  createUserRequestSchema: {
    parse: jest.fn()
  },
  LoginRequestSchema: {
    parse: jest.fn()
  }
}));


jest.mock('@schemas/contactsSchemas', () => ({
  createContactRequestSchema: {
    parse: jest.fn()
  },
  UpdateContactRequestSchema: {
    parse: jest.fn()
  },
}));


const router = Router();

// Create User
router.post('/create', async (req: Request, res: Response, next: NextFunction) => {
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
router.post('/login', async (req: Request, res: Response, next: NextFunction) => {
  let jwtSignedData = '';

  try {
    const createUser = {
      name: 'John Doe',
      email: 'johnDoe@gmail.com',
      password: 'Password123'
    };
    createUser.password = generatePasswordHash(createUser.password);

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

router.post('/contacts/create', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const requestBody = createContactRequestSchema.parse(req.body);
    const decryptedData = verifyJSONToken(requestBody.authorization);
    requestBody.userId = decryptedData?.id;

    const contact = await createContact(requestBody);

    return JsonApiResponse(res, contact.message, contact.success, null, 201);
  } catch (error) {
    next(error)
  }
})

router.put('/contacts/update', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const requestBody = UpdateContactRequestSchema.parse(req.body);
    const { authorization, ...updateBody } = requestBody;

    const updateContact = await updateContactById(updateBody.id, updateBody);

    return JsonApiResponse(res, 'Contact Successfully Updated', !!updateContact, null, 200);
  } catch (error) {
    next(error);
  }
})

const app = express();
app.use(bodyParser.json());
app.use(router);

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
    expect(JsonApiResponse).toHaveBeenCalledWith(expect.anything(), "Login Successful", true, { token: mockJtwToken }, 200);
  })

  it('should handle errors and forward to error handler', async () => {
    const error = new Error('Database error');
    (LoginRequestSchema.parse as jest.Mock).mockImplementation(() => {
      throw error;
    });

    const response = await request(app).post('/login').send({ email: 'john@doe.com', password: 'password123' });
    expect(response.status).toBe(500);
  });
})

// Create Contact
describe('POST /contacts/create', () => {
  const mockContact = {
    first_name: 'John',
    last_name: 'Doe',
    email: 'john.doe@example.com',
    phone: '123-456-7890',
    userId: 'user123'
  };

  it('should create a contact successfully and return 201', async () => {
    // Setup mocks
    (createContactRequestSchema.parse as jest.Mock).mockReturnValue({
      ...mockContact,
      authorization: 'Bearer token123'
    });
    (verifyJSONToken as jest.Mock).mockReturnValue({ id: 'user123' });
    (createContact as jest.Mock).mockResolvedValue({
      message: 'Contact created successfully',
      success: true
    });

    const response = await request(app)
      .post('/contacts/create')
      .send(mockContact)
      .set('Authorization', 'Bearer token123');

    expect(response.status).toBe(201);
    expect(response.body).toEqual({
      message: 'Contact created successfully',
      success: true
    });

    expect(verifyJSONToken).toHaveBeenCalledWith('Bearer token123');
    expect(createContact).toHaveBeenCalledWith(expect.objectContaining({
      ...mockContact,
      userId: 'user123'
    }));
  });

  it('should handle errors and forward to error handler', async () => {
    const error = new Error('Failed to create contact');
    (createContactRequestSchema.parse as jest.Mock).mockImplementation(() => {
      throw error;
    });

    const response = await request(app)
      .post('/contacts/create')
      .send(mockContact);

    expect(response.status).toBe(500);
  });
});

// Update Contact Details
describe('PUT /contacts/update', () => {
  const mockContact = {
    first_name: 'John',
    last_name: 'Doe',
    email: 'john.doe@example.com',
    phone: '123-456-7890',
    userId: 'user123'
  };

  it('should create a contact successfully and return 201', async () => {
    // Setup mocks
    (createContactRequestSchema.parse as jest.Mock).mockReturnValue({
      ...mockContact,
      authorization: 'Bearer token123'
    });
    (verifyJSONToken as jest.Mock).mockReturnValue({ id: 'user123' });
    (createContact as jest.Mock).mockResolvedValue({
      message: 'Contact created successfully',
      success: true
    });

    const response = await request(app)
      .post('/contacts/create')
      .send(mockContact)
      .set('Authorization', 'Bearer token123');

    expect(response.status).toBe(201);
    expect(response.body).toEqual({
      message: 'Contact created successfully',
      success: true
    });

    expect(verifyJSONToken).toHaveBeenCalledWith('Bearer token123');
    expect(createContact).toHaveBeenCalledWith(expect.objectContaining({
      ...mockContact,
      userId: 'user123'
    }));
  });

  it('should update contact', async () => {
    // Setup mocks
    (UpdateContactRequestSchema.parse as jest.Mock).mockReturnValue({
      ...mockContact,
      authorization: 'Bearer token123'
    });

    (verifyJSONToken as jest.Mock).mockReturnValue({ id: 'user123' });
    (createContact as jest.Mock).mockResolvedValue({
      message: 'Contact created successfully',
      success: true
    });

    const response = await request(app)
      .put('/contacts/update')
      .send({
        ...mockContact,
        first_name: "Jane"
      })
      .set('Authorization', 'Bearer token123');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      message: 'Contact Successfully Updated',
      success: true
    });

    expect(verifyJSONToken).toHaveBeenCalledWith('Bearer token123');
    expect(createContact).toHaveBeenCalledWith(expect.objectContaining({
      ...mockContact,
      userId: 'user123'
    }));
  });
});