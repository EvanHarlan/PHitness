import express from "express";
import { login, logout, signup, refreshToken, getProfile, updateProfile, searchUsers, unlockAchievement, updateMaxLift, deleteAccount, updateUserProfile} from "../controllers/auth.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

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


export default router;