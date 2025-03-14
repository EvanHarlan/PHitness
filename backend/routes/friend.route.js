// friend.route.js
import express from 'express';
import { sendFriendRequest, acceptFriendRequest, rejectFriendRequest, getFriends, getFriendRequests, removeFriend } from '../controllers/friend.controller.js';
import { protectRoute } from '../middleware/auth.middleware.js';

const router = express.Router();

// Apply authentication middleware to all friend routes
router.use(protectRoute);

router.post('/send-request', sendFriendRequest);
router.post('/accept-request', acceptFriendRequest);
router.post('/reject-request', rejectFriendRequest);
router.get('/list', getFriends);
router.get('/requests', getFriendRequests);
router.post('/remove', removeFriend);

export default router;