import express from "express"
import {
    Login,
    Logout,
    getPasswordResetLink,
    getPasswordResetPage,
    getUsers,
} from "../controllers/Auth/Auth"
import { resetPassword, verifyEmail } from "../controllers/Auth/Updates"
import { sendEmailVerificationLink } from "../controllers/EmailVerification"
import { refreshToken } from "../controllers/RefreshToken"
import { getLeaderBoard } from "../controllers/getLeaderBoard"
import {
    getLastNMatchResults,
    getPublicUserInfo,
} from "../controllers/getUserInfo"
import {
    createUser,
    validateRegistrationData,
} from "../middleware/Registration"
import {
    verifySpecialAccessToken,
    verifyToken,
} from "../middleware/VerifyToken"
import { addGames, getGames } from "../modules/Games"
import router_google from "./router-google"
const router = express.Router()

router.get("/users", verifyToken, getUsers)
router.get("/user/:username", verifyToken, getPublicUserInfo)
router.get("/user/:username/recents/:n", verifyToken, getLastNMatchResults)
router.post(
    "/register",
    validateRegistrationData,
    createUser,
    sendEmailVerificationLink
)
router.get("/register/:userID/:token", verifySpecialAccessToken, verifyEmail)
router.get("/token", refreshToken)
router.post("/send_email_verification_link", sendEmailVerificationLink)
router.post("/resetpassword", getPasswordResetLink)
router.get("/resetpassword/:userID/:token", getPasswordResetPage)
router.post(
    "/resetpassword/:userID/:token",
    verifySpecialAccessToken,
    resetPassword
)
router.get("/user/:username/games", verifyToken, getGames)
router.get("/leaderboard", verifyToken, getLeaderBoard)
router.post("/games", verifyToken, addGames)

router.post("/login", Login)
router.delete("/logout", Logout)
router.get("/health", (_, res) => {
    return res.status(200).json({ msg: "Ok" })
})

const finalRouter = express.Router()

finalRouter.use("/api", router)
finalRouter.use(router_google)

export default finalRouter
