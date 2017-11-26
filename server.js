const session = require('express-session');
const express = require('express');
const app = express();
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const db = require('./db/orm.js'); 
const authConfig = require('./auth-config.js');

app.use(session({ 
  secret: authConfig.SESSION_SECRET,
  saveUninitialized: true,
  resave: false
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static('public'));
const stat = __dirname + '/public';



/////////////////* sessions */////////////////

passport.serializeUser(function(user, done) {
  done(null, user.google_id); 
});

passport.deserializeUser(function(googleId, done) {
  db.Users.find({google_id: googleId})
    .then(user => done(null, user))
    .catch(err => done(err, null));
});



////////////* set up Google auth strategy *////////////

passport.use(new GoogleStrategy({
    clientID: authConfig.GOOGLE_CLIENT_ID,
    clientSecret: authConfig.GOOGLE_CLIENT_SECRET,
    callbackURL: '/auth/google/callback'
  },
  function(accessToken, refreshToken, profile, done) {
    return db.Users.findOne({where: {google_id: profile.id} })
      .then(user => {
        if (user) { 
          return done(null, user); 
        } else { 
          db.saveGoogleUser(profile)
            .then(user => done(null, user))
        }
      })
      .catch(err => done(err, null));
  })
);



////////////* use Google auth on routes *////////////

app.get('/auth/google',
  passport.authenticate('google', { 
    scope: ['https://www.googleapis.com/auth/plus.login'] 
  })
);

app.get('/auth/google/callback', 
  passport.authenticate('google', { 
    successRedirect: '/restricted',
    failureRedirect: '/login' 
  })
);

app.get('/restricted', 
  isLoggedIn, // see definition below
  (req, res) => res.sendFile(stat + '/restricted.html'));

app.get('/login', (req, res) => res.sendFile(stat + '/login.html'));

app.get('/logout', function (req, res){
  req.session.destroy(function (err) {
    res.clearCookie('connect.sid');
    res.redirect('/'); 
  });
});

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  else { res.redirect('/login'); }
}

app.listen(5000, () => {console.log('Server running on port 5000...')});

