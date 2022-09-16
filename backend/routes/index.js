import express from "express";
import { getUsers, Register, Login, Logout, resetPassword, getPasswordResetLink, getPasswordResetPage, getEmailVerificationLink, verifyEmail, validateRegistrationData } from "../controllers/Users.js";
import { verifySpecialAccessToken, verifyToken } from "../middleware/VerifyToken.js";
import { refreshToken } from "../controllers/RefreshToken.js";
import bodyParser from "body-parser";

const router = express.Router();

router.get('/users', verifyToken, getUsers);
router.post('/register', validateRegistrationData, Register, getEmailVerificationLink);
router.get('/register/:userID/:token', bodyParser.urlencoded({extended:false}),verifySpecialAccessToken, verifyEmail)
router.post('/login', Login);
router.get('/token', refreshToken);
router.get('/resetpassword', getPasswordResetLink)
router.get('/resetpassword/:userID/:token', getPasswordResetPage)
router.post('/resetpassword/:userID/:token',bodyParser.urlencoded({extended:false}), verifySpecialAccessToken, resetPassword)
router.delete('/logout', Logout);

export default router;
