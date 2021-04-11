
const router = require("express").Router();
const passport = require('passport');
const dotenv = require('dotenv');
const util = require('util');
const url = require('url');
const querystring = require('querystring');

//** Call dotenv config */
dotenv.config();

//** Auth check */
router.get('/', async (req, res, next) => {
    console.log('[MIDDLE WARE HIT]')

    res.json({ status: 'Success', message: 'Auth Middle ware is up' })
})

//** Login AuthO redirect */
router.get('/login', passport.authenticate('auth0', {
    scope: 'openid email profile'
}), (req, res) => {
    console.log('[ENDPOINT HIT]')
    res.redirect('/')
});

//** Final stage of authentication and redirect  */
router.get('/callback', (req, res, next) => {


    console.log('[ENDPOINT HIT]')

    passport.authenticate('auth0', (err, user, info) => {

        if (err) return next(err);
        if (!user) return res.redirect('/login');

        req.logIn(user, (err) => {

            if (err) return next(err);
            const returnTo = req.session.returnTo;
            delete req.session.returnTo;
            res.redirect(returnTo || '/user');
        });

    })(req, res, next);
});

//** Session logout and redirect */

router.get('/logout', (req, res) => {

    req.logout();

    const returnTo = req.protocol + '://' + req.hostname;
    const port = req.connection.localPort;

    if (port !== undefined && port !== 80 && port !== 443) returnTo += ':' + port;

    let logoutURL = new url.URL(
        util.format('httpsL//%s/v2/logout', process.env.AUTH0_DOMAIN)
    );

    const searchString = querystring.stringify({
        client_id: process.env.AUTH0_CLIENT_ID,
        returnTo: returnTo
    });

    logoutURL.search = searchString;

    res.redirect(logoutURL);
});

module.exports = router