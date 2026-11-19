require('dotenv').config()
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var userRouter = require('./routes/user');
var adminRouter = require('./routes/admin');
const { engine } = require('express-handlebars')
const fileUpload = require('express-fileupload')
const db = require('./config/connection')
const session = require('express-session')
const jwtHelper = require('./helpers/jwt-helper')

var app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// view engine setup
app.set('views', path.join(__dirname, 'views'));

app.engine('hbs', engine({
  extname: '.hbs',
  defaultLayout: 'layout',
  layoutsDir: __dirname + '/views/layout/',
  partialsDir: __dirname + '/views/layout/partials/',
  helpers: {
    inc: function (value) {
      return parseInt(value) + 1;
    },
    eq: function (a, b) {
      return a === b;
    },
    formatDate: function (date) {
      if (!date) return '';
      return new Date(date).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    }
  }
}));
app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(fileUpload({
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  abortOnLimit: true
}));

app.use(session({
  secret: process.env.SESSION_SECRET || 'Key_Secure_Default_Secret',
  cookie: {
    maxAge: 86400000, // 24 hours
    httpOnly: true
  },
  resave: false,
  saveUninitialized: false
}));

// JWT Token extraction & verification middleware (Stateless & Scalable)
app.use((req, res, next) => {
  // Check User Token
  const userToken = req.cookies?.userToken || (req.headers.authorization?.startsWith('Bearer ') ? req.headers.authorization.split(' ')[1] : null);
  if (userToken) {
    const decodedUser = jwtHelper.verifyToken(userToken);
    if (decodedUser) {
      req.user = decodedUser;
      res.locals.user = decodedUser;
      if (req.session) {
        req.session.user = decodedUser;
        req.session.loggedIn = true;
      }
    } else {
      res.clearCookie('userToken');
    }
  }

  // Check Admin Token
  const adminToken = req.cookies?.adminToken;
  if (adminToken) {
    const decodedAdmin = jwtHelper.verifyToken(adminToken);
    if (decodedAdmin) {
      req.admin = decodedAdmin;
      res.locals.admin = decodedAdmin;
      if (req.session) {
        req.session.admin = decodedAdmin;
      }
    } else {
      res.clearCookie('adminToken');
    }
  }

  next();
});

db.connect()
  .then(() => {
    console.log("Database connected successfully with connection pool.");
  }).catch((err) => {
    console.error("Oops database isn't connected", err);
  });

app.use('/', userRouter);
app.use('/admin', adminRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
