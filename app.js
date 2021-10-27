var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var neo4j = require('neo4j-driver');


var indexRouter = require('./routes/index');

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
// app.use(express.static(path.join(__dirname, 'public')));


// const driver = neo4j.driver('bolt://localhost', neo4j.auth.basic('neo4j', '1234'))
const driver = neo4j.driver('bolt://3.239.220.21:7687',
                  neo4j.auth.basic('neo4j', 'molecule-dwell-alcohols'), 
                  {/* encrypted: 'ENCRYPTION_OFF' */});
const session = driver.session()

app.use('/', indexRouter(session));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  res.status(404).send({status: 'not_found'});
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
