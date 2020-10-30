var express = require("express"),
    passport = require("passport"),
    mongoose = require("mongoose"),
    bodyParser = require("body-parser"),
    User = require("./models/user"),
    localStrategy = require("passport-local"),
    passportLocalMongoose = require("passport-local-mongoose");

var app = express();

app.use(require("express-session")({
    secret: "secrets are meant to be kept secret",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
app.use(bodyParser.urlencoded({extended: true}));

passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

mongoose.connect("mongodb://localhost:27017/auth_demo_app", { useNewUrlParser: true, useUnifiedTopology: true });

app.set('view engine', 'ejs');
//========================
// ROUTES
// =======================

app.get("/register",function(req, res){
    res.render("register");
});

app.post("/register", function(req, res){
      User.register(new User({username: req.body.username}), req.body.password, function(err, user){
          if (err){
              console.log(err);
              return res.render("register");
          }else{
            passport.authenticate("local")(req, res, function(){
                res.redirect("/secret");
            });
          }
      });
});

//login routes

app.get("/login",function(req, res){
    res.render("login");
});

app.get("/loginFail", function(req,res){
    res.render("loginFail");
});

app.post("/login", passport.authenticate("local",{
    successRedirect: "/secret",
    failureRedirect: "/loginFail"
}), function(req, res){

});

app.get("/logout",function(req,res){
    req.logout();
    res.redirect("/");
});

app.get("/", function (req, res) {
    res.render("home");
});

app.get("/secret",isLoggedIn, function (req, res) {
    res.render("secret");
});

function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect("/login");
}

app.listen(3000, function () {
    console.log("Server started");
});