import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

export const protectRoute = async (req, res, next) => {
	try {
		const accessToken = req.cookies.accessToken;

		if (!accessToken)
		{
			console.log("NO access token provided")
			return res.status(401).json({ message: "Unauthorized - No access token provided" });
		}

		try
		{
			console.log("Receieved access token", accessToken);

			const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
			console.log("Decoded Token:", decoded)
			const user = await User.findById(decoded.userId).select("-password");

			if (!user)
			{
				console.log("User not found for ID: decoded.userId");
				return res.status(401).json({ message: "User not found" });
			}

			req.user = user;
			console.log("Authenticated User:", req.user);

			next();
		} catch (error)
		{
			console.error("Token Verification Error:", error.message);
			if (error.name === "TokenExpiredError") {
				return res.status(401).json({ message: "Unauthorized - Access token expired" });
			}
			throw error;
		}
	} catch (error) {
		console.log("Error in protectRoute middleware", error.message);
		return res.status(401).json({ message: "Unauthorized - Invalid access token" });
	}
};