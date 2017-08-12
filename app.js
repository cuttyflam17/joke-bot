var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var db = require("./data/db.js");
var async = require('async')
var sms = require("./models/sms.js");
var newChat = require("./models/newchat.js");
var parse = require("./models/parse.js");
var routes = require('./routes/index');
var users = require('./routes/users');
var TOKEN = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpZCI6NDM0LCJwaG9uZSI6IjEyMzQ1Njc4Njc1NDUzNDI0MyIsInBhc3N3b3JkIjoiJDJhJDEwJHV4TnlHSlBuYkJjMUNDSVFLUi9nNWV4UnFNN1c0QUQyR2hIQzRBdWJwN1V5dVlnbDBRRWRPIiwiaXNCb3QiOnRydWUsImNvdW50cnkiOnRydWUsImlhdCI6MTQ4MzU5NTI5N30.ZLZ9BtUwhJqSMJgWc0Ln7iYT7W944BB4RAIIDMVkzg8";
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});
setInterval(function() {
  db.findAll({where: {state: true }}).then(function(results) {
    async.eachSeries(results, function(result,callback) {
      setTimeout(function() {
        parse.getRandomJoke(function(output) {
          var userId = result.userId;
          var ip = result.ip;
          console.log(result);
          newChat(userId, ip, result.token, function(err, res, body) {
            if(body.data) {
              var chatId = body.data.id;
            } 
            sms(output, chatId, ip, result.token, function() {
              callback();
            });
          })
        })
      }, 3000);
    })
  });

}, 72000000 + Math.floor(Math.random() * 18000000 ))

module.exports = app;
