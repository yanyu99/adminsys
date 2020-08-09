var express = require('express');
var path = require('path');
var createError = require('http-errors');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

const _ = require('lodash');
require('express-async-errors');
var _routes = require('./router');
const config = require('./config');
const loggers = require('./public/utils/logger');

const redis = require('redis');
const compression = require('compression');
const moment = require('moment');
const session = require('express-session');
const redisStore = require('connect-redis')(session);

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, 'favicon.ico')));
app.use(logger('dev'));//开发模式的日志

// parser
app.use(bodyParser.json({ limit: '100mb' }));
app.use(bodyParser.urlencoded({ limit: '100mb', extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'views')));
// log4js
app.use(require('log4js').connectLogger(loggers, { level: config.debug ? 'DEBUG' : 'ERROR' }));
app.use(compression());


//session support redis store
app.use(session({
  store: new redisStore({ client: redis.createClient(config.redis.port, config.redis.host) }),
  resave: true,
  saveUninitialized: false,
  secret: config.session_secret
}));

// locals
app.use((req, res, next) => {
  res.locals.user = req.session.user;
  res.locals.moment = moment;
  res.locals.site = config.site;
  next();
});
//加载路由
app.use('/', _routes);

// app.get(['/test', '/test1'], (req, res, next) => {
//   res.send("测试测试");
// });


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
