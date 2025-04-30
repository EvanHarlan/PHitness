import { redis } from "../lib/redis.js";
import User from "../models/user.model.js";
import jwt from "jsonwebtoken";
import MealPlan from "../models/mealPlan.model.js";
import Workout from "../models/workout.model.js";
import sendEmail from '../lib/sendEmail.js';
import crypto from 'crypto';



const generateTokens = (userId) => {
	const accessToken = jwt.sign({ userId }, process.env.ACCESS_TOKEN_SECRET, {
		expiresIn: "15m",
	});

	const refreshToken = jwt.sign({ userId }, process.env.REFRESH_TOKEN_SECRET, {
		expiresIn: "7d",
	});

	return { accessToken, refreshToken };
};

const storeRefreshToken = async (userId, refreshToken) => {
	await redis.set(`refresh_token:${userId}`, refreshToken, "EX", 7 * 24 * 60 * 60); // 7days
};

const setCookies = (res, accessToken, refreshToken) => {
	res.cookie("accessToken", accessToken, {
		httpOnly: true, // prevent XSS attacks, cross site scripting attack
		secure: process.env.NODE_ENV === "production",
		sameSite: "strict", // prevents CSRF attack, cross-site request forgery attack
		maxAge: 15 * 60 * 1000, // 15 minutes
	});
	res.cookie("refreshToken", refreshToken, {
		httpOnly: true, // prevent XSS attacks, cross site scripting attack
		secure: process.env.NODE_ENV === "production",
		sameSite: "strict", // prevents CSRF attack, cross-site request forgery attack
		maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
	});
};

export const signup = async (req, res) => {
	const { email, password, name } = req.body;
	try {
		if (password.length < 6) {
			return res.status(400).json({ message: "Passwords needs to be at least 6 characters long"})
		}
		const userExists = await User.findOne({ email });

		if (userExists) {
			return res.status(400).json({ message: "User already exists" });
		}
		const user = await User.create({ name, email, password });

		// authenticate
		const { accessToken, refreshToken } = generateTokens(user._id);
		await storeRefreshToken(user._id, refreshToken);

		setCookies(res, accessToken, refreshToken);

		res.status(201).json({
			_id: user._id,
			name: user.name,
			email: user.email,
			role: user.role,
		});
	} catch (error) {
		console.log("Error in signup controller", error.message);
		res.status(500).json({ message: error.message });
	}
};

export const login = async (req, res) => {
	try {
		const { email, password } = req.body;
		const user = await User.findOne({ email });

		if (user && (await user.comparePassword(password))) {
			const { accessToken, refreshToken } = generateTokens(user._id);
			await storeRefreshToken(user._id, refreshToken);
			setCookies(res, accessToken, refreshToken);

			res.json({
				_id: user._id,
				name: user.name,
				email: user.email,
				role: user.role,
				accessToken,
				refreshToken
			});
		} else {
			res.status(400).json({ message: "Invalid email or password" });
		}
	} catch (error) {
		console.log("Error in login controller", error.message);
		res.status(500).json({ message: error.message });
	}
};

export const logout = async (req, res) => {
	try {
		const refreshToken = req.cookies.refreshToken;
		if (refreshToken) {
			const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
			await redis.del(`refresh_token:${decoded.userId}`);
		}

		res.clearCookie("accessToken");
		res.clearCookie("refreshToken");
		res.json({ message: "Logged out successfully" });
	} catch (error) {
		console.log("Error in logout controller", error.message);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

// this will refresh the access token
export const refreshToken = async (req, res) => {
	try {
		const refreshToken = req.cookies.refreshToken;

		if (!refreshToken) {
			return res.status(401).json({ message: "No refresh token provided" });
		}

		const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
		const storedToken = await redis.get(`refresh_token:${decoded.userId}`);

		if (storedToken !== refreshToken) {
			return res.status(401).json({ message: "Invalid refresh token" });
		}

		const accessToken = jwt.sign({ userId: decoded.userId }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "15m" });

		res.cookie("accessToken", accessToken, {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			sameSite: "strict",
			maxAge: 15 * 60 * 1000,
		});

		res.json({ message: "Token refreshed successfully" });
	} catch (error) {
		console.log("Error in refreshToken controller", error.message);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

export const getProfile = async (req, res) =>
{
	try
	{
		const user = await User.findById(req.user._id);

		if (!user)
		{
			return res.status(404).json({ message: "User not found" });
		}

		res.status(200).json({
			_id: user._id,
			name: user.name,
			email: user.email,
			username: user.username,
			age: user.age,
			bio: user.bio,
			avatar: user.avatar,
			achievements: user.achievements || [],
			friends: user.friends || [],
			friendRequests: user.friendRequests || [],
			sentRequests: user.sentRequests || [],
			profileVisibility: user.profileVisibility,
			maxLift: user.maxLift,
		});
	} catch (error)
	{
		res.status(500).json({ message: "Server error", error: error.message });
	}
};



export const updateProfile = async (req, res) => {
	try {
	  const user = await User.findById(req.user._id); 
	  
	  if (!user) {
		return res.status(404).json({ message: "User not found" });
	  }
  
	  // Update user fields
	  user.username = req.body.username || user.username;
	  user.age = req.body.age || user.age;
	  user.bio = req.body.bio || user.bio;
	  user.avatar = req.body.avatar || user.avatar;
  
	  await user.save(); // Save the updated user data
  
	  res.status(200).json(user); // Return the updated user object
	} catch (error) {
	  res.status(500).json({ message: "Error updating profile" });
	}
  };

export const unlockAchievement = async (req, res) =>
{
	try
	{
		const { title } = req.body;
		const user = await User.findById(req.user._id);

		if (!user)
		{
			return res.status(404).json({ message: "User not found" });
		}

		const alreadyUnlocked = user.achievements?.some(
			(a) => a.title === title
		);

		if (alreadyUnlocked)
		{
			return res.status(200).json({ message: "Already unlocked" });
		}

		user.achievements.push({ title, dateUnlocked: new Date() });
		await user.save();

		res.status(200).json({ message: "Achievement unlocked" });
	} catch (error)
	{
		console.error("Unlock achievement error:", error);
		res.status(500).json({ message: "Server error" });
	}
};

export const updateMaxLift = async (req, res) => {
  try {
	  const { maxLift } = req.body;

	  console.log("Incoming maxLift value:", maxLift);
	  console.log("Type of maxLift:", typeof maxLift);

    if (typeof maxLift !== 'number' || isNaN(maxLift)) {
      return res.status(400).json({ message: "Invalid lift value" });
    }

    // Ensure the user document has a maxLift field (initialize to 0 if undefined)
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Only update if the new lift is greater
    if (typeof user.maxLift !== 'number' || maxLift > user.maxLift) {
      user.maxLift = maxLift;
      await user.save();
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("Error updating max lift:", error);
    res.status(500).json({ message: "Server error" });
  }
};




export const searchUsers = async (req, res) => {
	try {
	  const { q } = req.query;
	  const userId = req.user._id;
	  
	  console.log(`Searching for users matching: "${q}"`);
	  
	  // Find users whose name or email matches the query
	  const users = await User.find({
		$and: [
		  { _id: { $ne: userId } }, // Don't include current user
		  {
			$or: [
			  { name: new RegExp(q, 'i') },
			  { email: new RegExp(q, 'i') }
			]
		  }
		]
	  }).select('name email');
	  
	  console.log(`Found ${users.length} users matching search criteria`);
	  
	  // Get user's friends and sent requests to check status
	  const currentUser = await User.findById(userId);
	  
	  // Add status flags to each user
	  const usersWithStatus = users.map(user => {
		const userData = user.toObject();
		userData.isFriend = currentUser.friends.some(id => id.toString() === user._id.toString());
		userData.requestSent = currentUser.sentRequests.some(id => id.toString() === user._id.toString());
		return userData;
	  });
	  
	  res.status(200).json({ users: usersWithStatus });
	} catch (error) {
	  console.error('Error searching users:', error);
	  res.status(500).json({ message: error.message });
	}
  };
  export const deleteAccount = async (req, res) => {
	try {
		const userId = req.user.id;
		console.log(`Deleting account for user with ID: ${userId}`);

	
		await MealPlan.deleteMany({ user: userId });

		await Workout.deleteMany({ user: userId });

		
		await User.findByIdAndDelete(userId);

		console.log(`User with ID ${userId} and all related data deleted successfully`);

		res.status(200).json({ message: "Account and related data deleted successfully" });
	} catch (err) {
		console.error("Error deleting account:", err);
		res.status(500).json({ message: "Error deleting account" });
	}
};

export const updateUserProfile = async (req, res) => {
	const { newEmail, newPassword } = req.body; 
  
	try {
	  const user = await User.findById(req.user._id);
  
	  if (!user) {
		return res.status(404).json({ message: "User not found" });
	  }
  
	  // Update email and/or password if provided
	  if (newEmail) user.email = newEmail;
	  if (newPassword) user.password = newPassword;
  
	  await user.save();
  
	  res.status(200).json({ message: "Credentials updated successfully", user });
	} catch (error) {
	  console.error("Error updating credentials:", error);
	  res.status(500).json({ message: "An error occurred while updating credentials" });
	}
};



export const forgotPassword = async (req, res) => {
	const { email } = req.body;
  
	try {
	  const user = await User.findOne({ email });
	  if (!user) {
		return res.status(400).json({ message: "No user found with that email." });
	  }
  
	  
	  const tempPassword = crypto.randomBytes(6).toString("hex"); 
  
	  user.password = tempPassword;
	  await user.save();
  
	  
	  const message = `
		Hey its PHitness! This email is being sent to you because you requested for your email to be reset. Here is your new temporary password:
  
		${tempPassword}
  
		Please log in and change it immediately in the edit profile scetion of the profile page.
	  `;
  
	  await sendEmail(email, "Temporary Password", message);
  
	  res.status(200).json({ message: "Temporary password sent to your email." });
	} catch (err) {
	  console.error("Error in forgotPassword:", err);
	  res.status(500).json({ message: "Server error during password reset." });
	}
  };
  