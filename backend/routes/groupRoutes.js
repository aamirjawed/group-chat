import express from 'express'
import {authUser} from '../middleware/authMiddleware.js'
import { addUserToGroup, createGroup } from '../controllers/createGroupController.js'


const router = express.Router()

router.use(authUser)

router.post('/create-group', createGroup)

router.post('/:groupId/members',authUser, addUserToGroup);



export default router