import {Sequelize} from "sequelize-typescript";
import express from "express";
import passport, {use} from "passport";
import GoogleStrategy from 'passport-google-oidc'
import db from '../config/Database'
import FUsers from '../models/FederatedUserModel'
import Users from '../models/UserModel'
import {type} from "os";

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
async (issuer, profile, cb) => {

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
passport.serializeUser(function(user : Users, cb) {
    process.nextTick(function() {
        cb(null, { id: user.id, email: user.email, name: user.name });
    });
});

passport.deserializeUser(function(user, cb) {
    process.nextTick(function() {
        return cb(null, user);
    });
});


let grouter = express.Router();

/* GET /login
 *
 * This route prompts the user to log in.
 *
 * The 'login' view renders an HTML page, which contain a button prompting the
 * user to sign in with Google.  When the user clicks this button, a request
 * will be sent to the `GET /login/federated/accounts.google.com` route.
 */
// grouter.get('/login', function(req, res, next) {
//     res.render('login');
// });

/* GET /login/federated/accounts.google.com
 *
 * This route redirects the user to Google, where they will authenticate.
 *
 * Signing in with Google is implemented using OAuth 2.0.  This route initiates
 * an OAuth 2.0 flow by redirecting the user to Google's identity server at
 * 'https://accounts.google.com'.  Once there, Google will authenticate the user
 * and obtain their consent to release identity information to this app.
 *
 * Once Google has completed their interaction with the user, the user will be
 * redirected back to the app at `GET /oauth2/redirect/accounts.google.com`.
 */
grouter.get('/login/federated/google', passport.authenticate('google'));

/*
   This route completes the authentication sequence when Google redirects the
   user back to the application.  When a new user signs in, a user account is
   automatically created and their Google account is linked.  When an existing
   user returns, they are signed in to their linked account.
   */
grouter.get('/oauth2/redirect/google', passport.authenticate('google', {
    successReturnToOrRedirect: '/',
    failureRedirect: '/login'
}));

/* POST /logout
 *
 * This route logs the user out.
 */
// grouter.post('/logout', function(req, res, next) {
//     req.logout(function(err) {
//         if (err) { return next(err); }
//         res.redirect('/');
//     });
// });

// module.exports = grouter;
export default grouter
