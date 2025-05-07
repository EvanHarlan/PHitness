import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
// FUNCTION FOR AUTHENTICATING USERS AND MAKING SURE API ROUTES ARE PROTECTED (USER IS AUTHENTICATED)

// --- NEED TO REMOVE SENSITIVE CONSOLE LOGS ---
export const protectRoute = async (req, res, next) => {
	try {
		const accessToken = req.cookies.accessToken;
		// IF NO ACCESS TOKEN IS PRESENT, PREVENT USER FROM ACCESSING THE SITE
		if (!accessToken)
		{
			return res.status(401).json({ message: "Unauthorized - No access token provided" });
		}

		try
		{
			// VERIFY THE ACCESS TOKEN
			const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
			// DECODE THE ACCESS TOKEN AND FIND THE USER IT IS ASSOCIATED WITH FOR AUTHENTICATION
			const user = await User.findById(decoded.userId).select("-password");
			
			// IF THE USER CANNOT BE FOUND
			if (!user)
			{
				return res.status(401).json({ message: "User not found" });
			}

			// OTHERWISE, RETURN THE AUTHENTICATED USER
			req.user = user;

			next();
		} catch (error)
		{
			// TOKEN VERIFICATION ERROR HANDLING
			// IF THE TOKEN IS EXPIRED, RETURN THE ERROR
			if (error.name === "TokenExpiredError") {
				return res.status(401).json({ message: "Unauthorized - Access token expired" });
			}
			throw error;
		}
		// HANDLE MIDDLEWARE ERRORS
	} catch (error) {
		return res.status(401).json({ message: "Unauthorized - Invalid access token" });
	}
};