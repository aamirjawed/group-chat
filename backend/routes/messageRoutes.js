import express from 'express'
import { userMessageController } from '../controllers/userMessageController.js';
import { authUser } from '../middleware/authMiddleware.js';



const router = express.Router();

router.post('/user-message', authUser,userMessageController)


export default router