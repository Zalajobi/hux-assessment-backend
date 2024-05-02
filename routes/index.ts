import { Router } from 'express';
import {BASE_URL} from "@lib/config";
import userRouter from "@routes/userRouter";

const router = Router();

router.use(`${BASE_URL}/user`, userRouter);

export default router;