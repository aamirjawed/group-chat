import express from 'express'
import { userMessageController } from '../controllers/userMessageController.js';
import { authUser } from '../middleware/authMiddleware.js';



const router = express.Router();

router.post('/', authUser, userMessageController)


export default router