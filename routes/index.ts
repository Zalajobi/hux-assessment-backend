import { Router } from 'express';
import {BASE_URL} from "@lib/config";
import userRouter from "@routes/userRouter";
import contactsRouter from "@routes/contactsRouter";

const router = Router();

router.use(`${BASE_URL}/user`, userRouter);
router.use(`${BASE_URL}/contact`, contactsRouter);

export default router;