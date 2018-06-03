var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var bodyParser = require('body-parser');
var mysql = require("mysql");

var accountRouter = require('./routes/account');
var usersRouter = require('./routes/users');

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.set('json spaces', 5);

app.use(function(req, res, next){
	res.locals.connection = mysql.createConnection({
		host     : 'localhost',
		user     : 'root',
		password : '',
		database : 'boukuPay'
	});
	res.locals.connection.connect();
	next();
});

app.use('/account', accountRouter);
app.use('/users', usersRouter);

module.exports = app;
