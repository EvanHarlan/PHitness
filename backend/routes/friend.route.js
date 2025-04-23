// friend.route.js
import express from 'express';
import {
    sendFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
    getFriends,
    getFriendRequests,
    removeFriend,
    getFriendProfile // Import the new controller function
} from '../controllers/friend.controller.js';
import { protectRoute } from '../middleware/auth.middleware.js';

const router = express.Router();

// Apply authentication middleware to all friend routes
router.use(protectRoute);

// Existing friend relationship routes
router.post('/send-request', sendFriendRequest);
router.post('/accept-request', acceptFriendRequest);
router.post('/reject-request', rejectFriendRequest);
router.get('/list', getFriends);
router.get('/requests', getFriendRequests);
router.post('/remove', removeFriend);

// --- NEW ROUTE ---
// Route to get a specific friend's profile details (using friendId in URL)
router.get('/profile/:friendId', getFriendProfile);

export default router;