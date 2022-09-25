import express from "express";
import { getUsers, Login, Logout, getPasswordResetLink, getPasswordResetPage } from "../controllers/Auth/Auth";
import {resetPassword, verifyEmail} from "../controllers/Auth/Updates";
import {sendEmailVerificationLink} from "../controllers/EmailVerification";
import {createUser, validateRegistrationData} from "../middleware/Registration";
import { verifySpecialAccessToken, verifyToken } from "../middleware/VerifyToken";
import { refreshToken } from "../controllers/RefreshToken";
import bodyParser from "body-parser";

const router = express.Router();

router.get('/users', verifyToken, getUsers);
router.post('/register', validateRegistrationData, createUser, sendEmailVerificationLink);
router.get('/register/:userID/:token', bodyParser.urlencoded({extended:false}),verifySpecialAccessToken, verifyEmail)
router.post('/login', Login);
router.get('/token', refreshToken);
router.get('/resetpassword', getPasswordResetLink)
router.get('/resetpassword/:userID/:token', getPasswordResetPage)
router.post('/resetpassword/:userID/:token',bodyParser.urlencoded({extended:false}), verifySpecialAccessToken, resetPassword)
router.delete('/logout', Logout);

export default router;
