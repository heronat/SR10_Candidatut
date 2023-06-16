const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const session = require('express-session');
const fileUpload = require('express-fileupload');
const zip = require('express-zip');
const cors = require('cors');
const flash = require('connect-flash');

require('dotenv').config();
require('express-async-errors');

const indexRouter = require('./routes/index');
const homeRouter = require('./routes/home');
const usersRouter = require('./routes/users');
const adminRouter = require('./routes/administrator');
const candidateRouter = require('./routes/candidate');
const recruiterRouter = require('./routes/recruiter');
const accountRouter = require('./routes/account');
const apiRouter = require('./routes/api');


const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
	secret: process.env.SECRET,
	resave: true,
	saveUninitialized: true
}));
app.use(flash());
app.use(fileUpload({
  limits: { fileSize: 20 * 1024 * 1024 },
  abortOnLimit: true
}));

app.use('/', indexRouter);
app.use('/home', homeRouter);
app.use('/users', usersRouter);
app.use('/admin', adminRouter);
app.use('/candidate', candidateRouter);
app.use('/recruiter', recruiterRouter);
app.use('/account', accountRouter);
app.use('/api', apiRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
