// friend.controller.js
import User from '../models/user.model.js';
import Nudge from '../models/nudge.model.js';
// Send friend request
export const sendFriendRequest = async (req, res) => {
  try {
    const { friendId } = req.body;
    const userId = req.user._id; // Assuming you have authentication middleware
    
    // Check if users exist
    const [user, friend] = await Promise.all([
      User.findById(userId),
      User.findById(friendId)
    ]);
    
    if (!friend) return res.status(404).json({ message: 'User not found' });
    
    // Check if friend request already sent
    if (user.sentRequests.some(id => id.toString() === friendId.toString()) || 
        friend.friendRequests.some(id => id.toString() === userId.toString())) {
      return res.status(400).json({ message: 'Friend request already sent' });
    }
    
    // Check if already friends
    if (user.friends.some(id => id.toString() === friendId.toString())) {
      return res.status(400).json({ message: 'Already friends with this user' });
    }
    
    // Add to sent requests for current user
    user.sentRequests.push(friendId);
    // Add to friend requests for the other user
    friend.friendRequests.push(userId);
    
    await Promise.all([user.save(), friend.save()]);
    
    res.status(200).json({ message: 'Friend request sent successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Accept friend request
export const acceptFriendRequest = async (req, res) => {
  try {
    const { friendId } = req.body;
    const userId = req.user._id;
    
    const [user, friend] = await Promise.all([
      User.findById(userId),
      User.findById(friendId)
    ]);
    
    if (!friend) return res.status(404).json({ message: 'User not found' });
    
    // Check if friend request exists
    if (!user.friendRequests.some(id => id.toString() === friendId.toString())) {
      return res.status(400).json({ message: 'No friend request from this user' });
    }
    
    // Add each user to the other's friends array
    user.friends.push(friendId);
    friend.friends.push(userId);
    
    // Remove from requests arrays
    user.friendRequests = user.friendRequests.filter(id => id.toString() !== friendId.toString());
    friend.sentRequests = friend.sentRequests.filter(id => id.toString() !== userId.toString());
    
    await Promise.all([user.save(), friend.save()]);
    
    res.status(200).json({ message: 'Friend request accepted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Reject friend request
export const rejectFriendRequest = async (req, res) => {
  try {
    const { friendId } = req.body;
    const userId = req.user._id;
    
    const [user, friend] = await Promise.all([
      User.findById(userId),
      User.findById(friendId)
    ]);
    
    if (!friend) return res.status(404).json({ message: 'User not found' });
    
    // Remove from requests arrays
    user.friendRequests = user.friendRequests.filter(id => id.toString() !== friendId.toString());
    friend.sentRequests = friend.sentRequests.filter(id => id.toString() !== userId.toString());
    
    await Promise.all([user.save(), friend.save()]);
    
    res.status(200).json({ message: 'Friend request rejected' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get friend list
export const getFriends = async (req, res) => {
  try {
    const userId = req.user._id;
    
    const user = await User.findById(userId).populate('friends', 'name email');
    
    res.status(200).json({ friends: user.friends });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get friend requests
export const getFriendRequests = async (req, res) => {
  try {
    const userId = req.user._id;
    
    const user = await User.findById(userId).populate('friendRequests', 'name email');
    
    res.status(200).json({ friendRequests: user.friendRequests });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Remove friend
export const removeFriend = async (req, res) => {
  try {
    const { friendId } = req.body;
    const userId = req.user._id;
    
    const [user, friend] = await Promise.all([
      User.findById(userId),
      User.findById(friendId)
    ]);
    
    if (!friend) return res.status(404).json({ message: 'User not found' });
    
    // Remove from friends arrays
    user.friends = user.friends.filter(id => id.toString() !== friendId.toString());
    friend.friends = friend.friends.filter(id => id.toString() !== userId.toString());
    
    await Promise.all([user.save(), friend.save()]);
    
    res.status(200).json({ message: 'Friend removed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Friend Profile (respecting visibility)
export const getFriendProfile = async (req, res) => {
  try {
      const requestedFriendId = req.params.friendId; // Get the ID of the profile being requested from URL param
      const requestingUserId = req.user._id; // Get the ID of the user making the request (from protectRoute)

      // Fetch the friend whose profile is requested
      const requestedFriendUser = await User.findById(requestedFriendId)
          .select('username name avatar bio achievements profileVisibility friends'); // Select needed fields

      if (!requestedFriendUser) {
          return res.status(404).json({ message: 'Friend user not found' });
      }

      // Fetch the user making the request to check friendship status easily
      const requestingUser = await User.findById(requestingUserId).select('friends');
       if (!requestingUser) {
           // Should not happen if protectRoute works, but good practice
          return res.status(404).json({ message: 'Requesting user not found' });
      }

      // Check visibility permissions
      let canView = false;
      const isFriend = requestingUser.friends.some(friendId => friendId.toString() === requestedFriendId.toString());
      const isSelf = requestingUserId.toString() === requestedFriendId.toString(); // Check if viewing own profile


      if (requestedFriendUser.profileVisibility === 'public') {
          canView = true;
      } else if (requestedFriendUser.profileVisibility === 'friends') {
          // Check if the requesting user is friends with the requested user
          canView = isFriend;
      } else if (requestedFriendUser.profileVisibility === 'private') {
          // Only the user themselves can view their private profile
          canView = isSelf;
      }

      // Important: Even if they are friends, only allow viewing if the requesting user IS a friend
      // This handles the case where someone might try to access a 'friends' profile they aren't friends with
      if (!isFriend && !isSelf && requestedFriendUser.profileVisibility !== 'public') {
           return res.status(403).json({ message: 'You do not have permission to view this profile.' });
      }

      // Final check based on determined visibility
      if (!canView) {
          return res.status(403).json({ message: 'Profile is private or you do not have permission.' });
      }

      // Return only the necessary public profile data
      const profileData = {
          _id: requestedFriendUser._id,
          username: requestedFriendUser.username,
          name: requestedFriendUser.name, // Include name
          avatar: requestedFriendUser.avatar,
          bio: requestedFriendUser.bio,
          achievements: requestedFriendUser.achievements,
          // Add any other *safe* fields you want to display
      };

      res.status(200).json(profileData);

  } catch (error) {
      console.error("Error fetching friend profile:", error);
      res.status(500).json({ message: 'Server error fetching profile' });
  }
};
const activeConnections = {};
 
 export const listenForNudges = (req, res) => {
   const userId = req.user._id;
   res.setHeader('Content-Type', 'text/event-stream');
   res.setHeader('Cache-Control', 'no-cache');
   res.setHeader('Connection', 'keep-alive');
 
   activeConnections[userId] = res;
 
   req.on('close', () => {
     delete activeConnections[userId];
   });
 };
 
 export const nudgeFriend = async (req, res) => {
   try {
     const { friendId } = req.body;
     const userId = req.user._id;
 
     const friend = await User.findById(friendId);
     if (!friend) return res.status(404).json({ message: 'User not found' });
 
     const sender = await User.findById(userId);
     if (!sender) return res.status(404).json({ message: 'Sender not found' });

     const newNudge = await Nudge.create({
      to: friendId,
      from: userId,
      fromName: sender.name
    });
 
     if (activeConnections[friendId]) {
       activeConnections[friendId].write(
         `data: ${JSON.stringify({ from: userId, fromName: sender.name, message: 'nudged you!' })}\n\n`
       );
     }
 
     res.status(200).json({ message: 'Nudge sent successfully' });
   } catch (error) {
     res.status(500).json({ message: error.message });
   }
 };

 export const getNudges = async (req, res) => {
  try {
    const userId = req.user._id;

    const nudges = await Nudge.find({ to: userId }).sort({ createdAt: -1 }); 
    if (!nudges.length) {
      return res.status(404).json({ message: 'No nudges found' });
    }

    res.status(200).json({ nudges });
  } catch (error) {
    console.error('Error fetching nudges:', error);
    res.status(500).json({ message: 'Error fetching nudges' });
  }
};

export const deleteNudge = async (req, res) => {
  try {
    const { nudgeId } = req.body;

    // Find and delete the nudge
    const nudge = await Nudge.findByIdAndDelete(nudgeId);

    if (!nudge) {
      return res.status(404).json({ message: 'Nudge not found' });
    }

    res.status(200).json({ message: 'Nudge deleted successfully' });
  } catch (error) {
    console.error('Error deleting nudge:', error);
    res.status(500).json({ message: 'Error deleting nudge' });
  }
};
