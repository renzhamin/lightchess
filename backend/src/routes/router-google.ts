import dotenv from "dotenv"
import express from "express"
import passport from "passport"
import GoogleStrategy from "passport-google-oauth20"
import { Op } from "sequelize"
import FUsers from "../models/FederatedUserModel"
import Users from "../models/UserModel"
import {
    getAccessTokenFromUserDetails,
    getRefreshToken,
} from "../modules/Tokens"
import { get_url_from_req } from "../modules/Utils"

dotenv.config()
// Configure the Google strategy for use by Passport.
//
// OAuth 2.0-based strategies require a `verify` function which receives the
// credential (`accessToken`) for accessing the Facebook API on the user's
// behalf, along with the user's profile.  The function must invoke `cb`
// with a user object, which will be set at `req.user` in route handlers after
// authentication.

const get_available_username = async (username: string) => {
    const users = await Users.findAll({
        attributes: ["username"],
        where: {
            username: {
                [Op.like]: username + "%",
            },
        },
    })
    const userSet: Set<string> = new Set()
    users.forEach((user) => userSet.add(user.username))

    if (!userSet.has(username)) return username

    for (let i = 1; ; i++) {
        if (!userSet.has(username + i)) {
            return username + i
        }
    }
}

const get_username_from_email = (email: string) => {
    return email.substring(0, email.indexOf("@"))
}

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env["GOOGLE_CLIENT_ID"],
            clientSecret: process.env["GOOGLE_CLIENT_SECRET"],
            callbackURL: "/oauth2/redirect/google",
        },

        // verify function
        async (accessToken, refreshToken, profile, cb) => {
            const issuer = "google"
            const fuser = await FUsers.findOne({
                where: {
                    provider: issuer,
                    subject: profile.id,
                },
            })

            if (fuser) {
                const existing_user = await Users.findOne({
                    where: {
                        id: fuser.id,
                    },
                })

                if (!existing_user)
                    return cb(null, false, { msg: "Database config mismatch" })

                return cb(null, existing_user)
            }

            const email = profile.emails[0].value
            const username = await get_available_username(
                get_username_from_email(email)
            )
            const user = await Users.create({
                displayname: profile.displayName,
                username,
                email,
                role: 1,
            }).catch((err) => {
                return cb(err, false)
            })

            await FUsers.create({
                id: user.id,
                provider: issuer,
                subject: profile.id,
            }).catch((err) => {
                return cb(err, false)
            })

            return cb(null, user)
        }
    )
)

// Configure Passport authenticated session persistence.
//
// In order to restore authentication state across HTTP requests, Passport needs
// to serialize users into and deserialize users out of the session.  In a
// production-quality application, this would typically be as simple as
// supplying the user ID when serializing, and querying the user record by ID
// from the database when deserializing.  However, due to the fact that this
// example does not have a database, the complete Facebook profile is serialized
// and deserialized.
// passport.serializeUser(function(user : Users, cb) {
//     process.nextTick(function() {
//         cb(null, { id: user.id, email: user.email, name: user.name });
//     });
// });
//
// passport.deserializeUser(function(user, cb) {
//     process.nextTick(function() {
//         return cb(null, user);
//     });
// });

const router_google = express.Router()

router_google.get(
    "/oauth2/redirect",
    passport.authenticate("google", { scope: ["email", "profile"] })
)

/*
   This route completes the authentication sequence when Google redirects the
   user back to the application.  When a new user signs in, a user account is
   automatically created and their Google account is linked.  When an existing
   user returns, they are signed in to their linked account.
   */
router_google.get(
    "/oauth2/redirect/google",
    passport.authenticate("google", {
        successRedirect: process.env.FRONTEND_URL || "/",
        failureRedirect: process.env.FRONTEND_URL || "/",
        session: false,
    }),
    async function (req, res) {
        if (!req.user) {
            return res.status(400).json({ msg: "user info not found" })
        }

        const { id, username, email } = req.user as any

        const refreshToken = getRefreshToken({ id, username, email })

        res.cookie("refreshToken", refreshToken, {
            maxAge: 24 * 60 * 60 * 30 * 1000,
        })

        return res.redirect(process.env.FRONTEND_URL || "/")
    }
)

export default router_google
