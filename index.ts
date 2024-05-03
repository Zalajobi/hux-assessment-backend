import 'dotenv/config';
import 'module-alias/register';
import 'reflect-metadata';
import express = require('express');
import cors = require('cors');
import { AppDataSource } from './data-source';
import router from "@routes/index";
import {errorMiddleware} from "@middlewares/error";
import {authorizeRequest} from "@middlewares/jwt";

const app = express();

app.use(express.json());
app.use(cors());
app.use(authorizeRequest);
app.use('/', router)
app.use(errorMiddleware);

AppDataSource.initialize()
  .then(async () => {
    console.log('Initialising TypeORM...');

    // console.log('Generating Test User...');
    // const user = new User();
    // user.email = 'zalajobi@gmail.com';
    // user.name = 'Zhikrullah IGBALAJOBI';
    // user.password = generatePasswordHash('password123');
    //
    // await userRepo().save(user)
    //
    // console.log('Test User Generated Successfully');
  })
  .catch((error) => console.log(error));


const PROJECT_PORT = process.env.PROJECT_PORT!;
app.listen(PROJECT_PORT, () => {
  console.log(`Example app listening on port ${PROJECT_PORT}`);
});