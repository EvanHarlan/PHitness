import express from "express";
import { login, logout, signup, refreshToken, getProfile, updateProfile, searchUsers, unlockAchievement, updateMaxLift, deleteAccount, updateUserProfile, forgotPassword,} from "../controllers/auth.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

// PROTECTROUTE IS THE AUTHENTICATION MIDDLEWARE TO ENSURE THESE ROUTES CAN ONLY BE ACCESSED IF A USER IS AUTHENTICATED

// THIS PAGE IS USED TO DEFINE ALL API ROUTES FOR AUTHENTICATING USERS AND HANDLING ACCOUNT FUNCTIONALITY
router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);
router.post("/refresh-token", refreshToken);
router.get("/profile", protectRoute, getProfile);
router.put("/profile", protectRoute, updateProfile);
router.get('/search', protectRoute, searchUsers);
router.post('/unlock-achievement', protectRoute, unlockAchievement);
router.post("/max-lift", protectRoute, updateMaxLift);
router.delete("/delete", protectRoute, deleteAccount);
router.put("/account-credentials", protectRoute, updateUserProfile);
router.post("/forgot-password", forgotPassword)



export default router;