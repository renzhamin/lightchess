import express from "express";
import { getUsers, Register, Login, Logout, resetPassword, getPasswordResetLink, getPasswordResetPage } from "../controllers/Users.js";
import { verifyPasswordResetToken, verifyToken } from "../middleware/VerifyToken.js";
import { refreshToken } from "../controllers/RefreshToken.js";
import bodyParser from "body-parser";

const router = express.Router();

router.get('/users', verifyToken, getUsers);
router.post('/users', Register);
router.post('/login', Login);
router.get('/token', refreshToken);
router.get('/resetpassword', getPasswordResetLink)
router.get('/resetpassword/:userID/:passwordResetToken', getPasswordResetPage)
router.post('/resetpassword/:userID/:passwordResetToken',bodyParser.urlencoded({extended:false}), verifyPasswordResetToken, resetPassword)
router.delete('/logout', Logout);

export default router;
