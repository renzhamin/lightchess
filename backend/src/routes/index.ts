import express from "express";
import { getUsers, Login, Logout, getPasswordResetLink, getPasswordResetPage } from "../controllers/Auth/Auth";
import {resetPassword, verifyEmail} from "../controllers/Auth/Updates";
import {sendEmailVerificationLink} from "../controllers/EmailVerification";
import {createUser, validateRegistrationData} from "../middleware/Registration";
import { verifySpecialAccessToken, verifyToken } from "../middleware/VerifyToken";
import { refreshToken } from "../controllers/RefreshToken";
import passport from "passport";
import router_google from "./router-google";
const router = express.Router();

router.get('/users', verifyToken, getUsers);
router.post('/register', validateRegistrationData, createUser, sendEmailVerificationLink);
router.get('/register/:userID/:token', verifySpecialAccessToken, verifyEmail)
router.get('/token', refreshToken);
router.get('/resetpassword', getPasswordResetLink)
router.get('/resetpassword/:userID/:token', getPasswordResetPage)
router.post('/resetpassword/:userID/:token', verifySpecialAccessToken, resetPassword)

router.post('/login', Login);
router.delete('/logout', Logout);
router.get('/login/federated/google', passport.authenticate('google'))

const finalRouter = express.Router()

finalRouter.use('/api', router)
finalRouter.use(router_google)

export default finalRouter;
