import express from 'express'
import {authUser} from '../middleware/authMiddleware.js'
import { addUserToGroup, createGroup, getGroupMembers, getUserGroups } from '../controllers/createGroupController.js'


const router = express.Router()

router.use(authUser)

router.post('/create-group', createGroup)
router.get('/get-groups', getUserGroups);

router.post('/:groupId/members',authUser, addUserToGroup);
router.get('/:groupId/members', getGroupMembers);


export default router