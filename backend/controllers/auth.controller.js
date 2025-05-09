import { redis } from "../lib/redis.js";
import User from "../models/user.model.js";
import jwt from "jsonwebtoken";
import MealPlan from "../models/mealPlan.model.js";
import Workout from "../models/workout.model.js";
import sendEmail from '../lib/sendEmail.js';
import crypto from 'crypto';

// CONTROLLER FILE FOR HANDLING ALL USER AUTHENTICATION AND ROUTING LOGIC

// function for generating access tokens using json web tokens (jwt)
const generateTokens = (userId) => {
	// 15 minute access token to keep users signed in (15 minute life span)
	const accessToken = jwt.sign({ userId }, process.env.ACCESS_TOKEN_SECRET, {
		expiresIn: "15m",
	});
	
	// refresh token with a 7 day lifespan
	const refreshToken = jwt.sign({ userId }, process.env.REFRESH_TOKEN_SECRET, {
		expiresIn: "7d",
	});

	return { accessToken, refreshToken };
};

// function for storing the refresh token for 7 days in the redis (quick store/cache)
const storeRefreshToken = async (userId, refreshToken) => {
	// storing refresh token with the associated user id
	await redis.set(`refresh_token:${userId}`, refreshToken, "EX", 7 * 24 * 60 * 60); // 7days
};

// function for setting user cookies
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

// function for handling signup
export const signup = async (req, res) => {
	const { email, password, name, username, termsAccepted, age, height, weight, gender, experienceLevel, healthConditions, fitnessGoal } = req.body;
	try {
		if (password.length < 6) {
			return res.status(400).json({ message: "Passwords needs to be at least 6 characters long"})
		}
		const userExists = await User.findOne({ email });

		if (userExists) {
			return res.status(400).json({ message: "User already exists" });
		}
		const user = await User.create({ name, email, password, username, termsAccepted, age, height, weight, gender, experienceLevel, healthConditions, fitnessGoal });

		// authenticate
		const { accessToken, refreshToken } = generateTokens(user._id);
		await storeRefreshToken(user._id, refreshToken);

		setCookies(res, accessToken, refreshToken);

		res.status(201).json({
			_id: user._id,
			name: user.name,
			email: user.email,
			age: user.age
		});
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

// function for handling login
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
				accessToken,
				refreshToken
			});
		} else {
			res.status(400).json({ message: "Invalid email or password" });
		}
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

// function for handling logout functionality
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
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

// function for getting a users profile details
export const getProfile = async (req, res) =>
{
	try
	{
		const user = await User.findById(req.user._id);

		if (!user)
		{
			return res.status(404).json({ message: "User not found" });
		}
		// return user parameters
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
			height: user.height,
			weight: user.weight,
			gender: user.gender,
			experienceLevel: user.experienceLevel,
			healthConditions: user.healthConditions,
			fitnessGoal: user.fitnessGoal
		});
	} catch (error)
	{
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

// Function for handling profile updates
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
	  user.height = req.body.height || user.height;
	  user.weight = req.body.weight || user.weight;
	  user.gender = req.body.gender || user.gender;
  
	  await user.save(); // Save the updated user data
  
	  res.status(200).json(user); // Return the updated user object
	} catch (error) {
	  res.status(500).json({ message: "Error updating profile" });
	}
  };

// function for handling achievement unlocking capabilities
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
		res.status(500).json({ message: "Server error" });
	}
};

// function for udating a user max lift
export const updateMaxLift = async (req, res) => {
  try {
	  const { maxLift } = req.body;

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
    res.status(500).json({ message: "Server error" });
  }
};

// functionality for handling user search capabilities on the friends page
export const searchUsers = async (req, res) => {
	try {
	  const { q } = req.query;
	  const userId = req.user._id;
	  
	  
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
	  res.status(500).json({ message: error.message });
	}
  };

  // functionality for handling account deletion requesets
  export const deleteAccount = async (req, res) => {
	try {
		const userId = req.user.id;

	
		await MealPlan.deleteMany({ user: userId });

		await Workout.deleteMany({ user: userId });

		
		await User.findByIdAndDelete(userId);

		res.status(200).json({ message: "Account and related data deleted successfully" });
	} catch (err) {
		res.status(500).json({ message: "Error deleting account" });
	}
};

// function for updating email and password on the users profile
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
	  
	  res.status(500).json({ message: "An error occurred while updating credentials" });
	}
};

// functionality for forgot password capabilities (sends users emails)
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
  
		Please log in and change it immediately in the edit profile section of the profile page.
	  `;
  
	  await sendEmail(email, "Temporary Password", message);
  
	  res.status(200).json({ message: "Temporary password sent to your email." });
	} catch (err) {
	  res.status(500).json({ message: "Server error during password reset." });
	}
  };
  
  