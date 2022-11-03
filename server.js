require('dotenv').config();
const express = require('express'),
      mongoose  = require('mongoose'),
      ejs = require('ejs'),
      passport = require("passport"),
      session = require('express-session'),
      flash = require('connect-flash');
const methodOverride = require("method-override")
require('./config/passport')(passport);

const app = express();
//BELOW WE CONNECT TO MONGO DATABASE

 //DB CONFIG
 const url="mongodb+srv://Adebayo:welldone@cluster0.kjsnn.mongodb.net/FREEKICK";
mongoose.connect(url,{useNewUrlParser:true,useUnifiedTopology:true});

      app.use(express.urlencoded({extended:true}));
      app.use(express.static("public"));
      app.set('view engine', 'ejs');

      //Express Session
app.use(
    session({
        secret: 'secret',
        resave: true,
        saveUninitialized: true

    })
);


      // passport middleware
app.use(passport.initialize());
app.use(passport.session());

//connect flash
app.use(flash());

 // Global Variables Middleware
 app.use((req, res, next) => {
    res.locals.success_msg =  req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    res.locals.name = req.user;
    next();
  });





      //Routes
      app.use('/', require('./routes/index'));

      app.use('/admin', require('./routes/admin'));


      app.listen(process.env.PORT || 3000, function(){
        console.log("Server is running on port 3000")
      })
