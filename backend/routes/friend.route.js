// friend.route.js
import express from 'express';
import {
    sendFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
    getFriends,
    getFriendRequests,
    removeFriend,
    getFriendProfile,
     nudgeFriend, 
     listenForNudges,
     getNudges,
     deleteNudge
} from '../controllers/friend.controller.js';

// PROTECTROUTE IS THE AUTHENTICATION MIDDLEWARE TO ENSURE THESE ROUTES CAN ONLY BE ACCESSED IF A USER IS AUTHENTICATED
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
router.post('/nudge', nudgeFriend);
router.get('/listenForNudges', listenForNudges);
router.get('/nudges', getNudges);
router.post('/delete-nudge', deleteNudge);
// Route to get a specific friend's profile details (using friendId in URL)
router.get('/profile/:friendId', getFriendProfile);

export default router;