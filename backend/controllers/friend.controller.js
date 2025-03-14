// friend.controller.js
import User from '../models/user.model.js';

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