const express = require('express');
const app = express();
const mongoose = require('mongoose');
const cors = require('cors');
const expressWs = require('express-ws')(app);
const dotenv = require('dotenv');
const session = require('express-session');
const passport = require('passport');
const auth0strategy = require('passport-auth0');

//** import config */
const config = require('./config.json');

//** Import routes */
const authRoutes = require('./routes/auth');


//** Call app session */ 

//** config for .env */
dotenv.config();

//** Connect to database */
mongoose.connect(
    config.DB_CONNECT,
    {
        useNewUrlParser: true,
        useUnifiedTopology: true
    }, () => console.log('connected to db')
);


//** Express-session config */ 
const sess = {
    secret: 'razor-grip-random-session',
    cookie: {},
    resave: false,
    saveUninitialized: true
};

if (app.get('env') === 'production') sess.cookie.secure = true;


//** Configure Passport to use Auth0 */ 
const strategy = new auth0strategy({
    domain: config.AUTH0_DOMAIN,
    clientID: config.AUTH0_CLIENT_ID,
    clientSecret: config.AUTH0_CLIENT_SECRET,
    callbackURL: config.AUTH0_CALLBACK_URL || 'http://localhost:3000/callback'
}, (accessToken, refreshToken, extraParams, profile, done) => {

    // accessToken is the token to call Auth0 API (not needed in the most cases)
    // extraParams.id_token has the JSON Web Token
    // profile has all the information from the user

    return done(null, profile);
});

//** Serialize payload for smaller request */
passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((user, done) => {
    done(null, user);
})

passport.use(strategy);

const port = process.env.PORT || 8080;
app.use(express.json());
app.use(cors());
app.use(session(sess));

app.use(passport.initialize());
app.use(passport.session());






//** Websocket for creating live connections between the frontend and backend */
app.ws('/message', (ws, req) => {
    ws.on('message', (msg) => {
        console.log('[MESSAGE RECIEVED]:: ', msg)

        try {
            ws.send(msg);

        } catch (error) {
            sendError(ws, error);

            return;
        }

    })
})


//** Error handling for failed message */ 
const sendError = (ws, message) => {
    const messageObject = {
        type: 'Error',
        payload: message
    };

    ws.send(JSON.stringify(messageObject));
}

//** Route middlewares */ 
app.use('/auth', authRoutes);

app.get('/', (req, res) => {
    res.json({ message: "API Working" });

})


app.listen(port, () => console.log('[SERVER IS RUNNING]:: ', port))


