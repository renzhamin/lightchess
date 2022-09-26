import {Sequelize} from "sequelize-typescript";
import express from "express";
import passport, {use} from "passport";
import GoogleStrategy from 'passport-google-oauth20'
import db from '../config/Database'
import FUsers from '../models/FederatedUserModel'
import Users from '../models/UserModel'
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
import {getAccessTokenFromUserDetails, getRefreshToken} from "../modules/Tokens";

dotenv.config()
// Configure the Google strategy for use by Passport.
//
// OAuth 2.0-based strategies require a `verify` function which receives the
// credential (`accessToken`) for accessing the Facebook API on the user's
// behalf, along with the user's profile.  The function must invoke `cb`
// with a user object, which will be set at `req.user` in route handlers after
// authentication.
passport.use(new GoogleStrategy({
    clientID: process.env['GOOGLE_CLIENT_ID'],
    clientSecret: process.env['GOOGLE_CLIENT_SECRET'],
    callbackURL: '/oauth2/redirect/google',
    scope: [ 'profile', 'email' ]
}, 

// verify function 
async (accessToken, refreshToken, profile, cb) => {
    const issuer = 'google'
    let fuser = await FUsers.findOne({
        where : {
            provider : issuer,
            subject : profile.id
        }
    })

    if(fuser){
        let existing_user = await Users.findOne({
            where : {
                id : fuser.id
            }
        })

        if(!existing_user) 
            return cb(null, false, {msg:"Database config mismatch"})

        return cb(null, existing_user)
    }

    let user = await Users.create({
        name : profile.displayName,
        email : profile.emails[0].value
    }).catch(err=>{ return cb(err,false) })


    await FUsers.create({
        id : user.id,
        provider : issuer,
        subject : profile.id
    }).catch(err=>{ return cb(err,false) })

    return cb(null, user)
}));

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


let router_google = express.Router();

/*
   This route completes the authentication sequence when Google redirects the
   user back to the application.  When a new user signs in, a user account is
   automatically created and their Google account is linked.  When an existing
   user returns, they are signed in to their linked account.
   */
router_google.get('/oauth2/redirect/google', passport.authenticate('google', {
    failureRedirect: 'http://localhost:3000',
    session : false
}), async function (req,res) {

        const { id,name,email } = req.user

        const refreshToken = getRefreshToken({id,name,email})

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 30 * 1000
        });

        return res.redirect("http://localhost:3000/dashboard")
});



export default router_google
