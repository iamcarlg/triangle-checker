// Nodejs dependencies
const express = require('express');
const session = require('express-session');
const passport = require('passport'); // import passport to initialize cookie
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

// modules
const User = require('./config/user-model');
const passport_setup = require('./config/passport-setup');
const keys = require('./config/keys');
const app = express();
const PORT = process.env.PORT || 3000;

const urlencodedParser = bodyParser.urlencoded({ extended: true });

app.use(bodyParser.json());
app.use(urlencodedParser);
app.use(express.static(__dirname + '/public'));

app.use( session({
    name : "parse-session",
    secret :"secret111",
    resave : true,
    saveUninitialized: true,
    cookie: { secure: false, maxAge: 14400000 },
  })
  );

// Initialize passport sessions
app.use(passport.initialize());
app.use(passport.session());

// Middleware that checks whether the user is logged in or not
const authCheck = (req, res, next) => {

    if(!req.user){
        // If the user is not logged in
        res.redirect("/");

    }else{
        // If the user is logged in
        next();
    }
}

// Connect to mongodb
mongoose.connect(keys.mongodb.dbURI, () => {
    console.log("Connected to mongodb !");
    
  });

// Rendering the main page
app.get('/', (req, res) =>{
    res.render('login');

})

app.get('/triangle', authCheck, (req, res) =>{

    res.render('index', {user:req.user});

})

// auth with google
app.get('/auth/google', passport.authenticate('google', {
    scope: ['profile', 'email']
}))

// auth logout
app.get('/auth/logout', (req, res) =>{

    try{
        // Clear the cookie of the connected user
        res.clearCookie('connect.sid');
        
        app.use( session({
            name : "cookie",
            secret :"secret111",
            resave : true,
            saveUninitialized: true,
            cookie: { secure: false, maxAge: 14400000 },
          })
          );

          req.logOut();
        //   Destroy the session
          req.session.destroy;
        
        //   //   Redirect to public home page
          res.redirect('/');

        console.log("The user is logged out from the session !");

    }catch(err){
        res.redirect("/");
        console.log("The user failed to log out !\n Here is the error : ", err);

    }


})

// callback route for google after successful login
app.get('/auth/google/redirect', passport.authenticate('google'), (req, res) => {
    
    res.redirect('/triangle');
    
})

// Set view engine to ejs
app.set('view engine', 'ejs');

// connect our views with our public folder
app.set('views', [__dirname + '/public/views']);

// Server listening to PORT
app.listen(PORT, (req, res) => {
    console.log("The server is listening on port " + PORT);

})



