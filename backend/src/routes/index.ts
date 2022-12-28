import express from "express"
import {
    getUsers,
    Login,
    Logout,
    getPasswordResetLink,
    getPasswordResetPage,
} from "../controllers/Auth/Auth"
import { resetPassword, verifyEmail } from "../controllers/Auth/Updates"
import { sendEmailVerificationLink } from "../controllers/EmailVerification"
import {
    createUser,
    validateRegistrationData,
} from "../middleware/Registration"
import {
    verifySpecialAccessToken,
    verifyToken,
} from "../middleware/VerifyToken"
import { refreshToken } from "../controllers/RefreshToken"
import { getGames, addGames } from "../modules/Games"
import passport from "passport"
import router_google from "./router-google"
import {
    getLastNMatchResults,
    getPublicUserInfo,
} from "../controllers/getUserInfo"
import { getLeaderBoard } from "../controllers/getLeaderBoard"
const router = express.Router()

router.get("/users", verifyToken, getUsers)
router.get("/user/:username", getPublicUserInfo)
router.get("/user/:username/recents/:n", getLastNMatchResults)
router.post(
    "/register",
    validateRegistrationData,
    createUser,
    sendEmailVerificationLink
)
router.get("/register/:userID/:token", verifySpecialAccessToken, verifyEmail)
router.get("/token", refreshToken)
router.post("/send_email_verification_link", sendEmailVerificationLink)
router.get("/resetpassword", getPasswordResetLink)
router.get("/resetpassword/:userID/:token", getPasswordResetPage)
router.post(
    "/resetpassword/:userID/:token",
    verifySpecialAccessToken,
    resetPassword
)
router.get("/user/:username/games", getGames)
router.get("/leaderboard", getLeaderBoard)
router.post("/games", addGames)

router.post("/login", Login)
router.delete("/logout", Logout)
router.get("/login/federated/google", passport.authenticate("google"))
router.get("/health", (_, res) => {
    return res.status(200).json({ msg: "Ok" })
})

const finalRouter = express.Router()

finalRouter.use("/api", router)
finalRouter.use(router_google)

export default finalRouter
