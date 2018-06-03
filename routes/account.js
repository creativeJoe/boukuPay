var express = require('express');
var bcrypt = require('bcrypt');
var router = express.Router();

//validator
function validate(key, value) {
	// body...
	var name = /([A-z]+)/;
	var email = /([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+/;
	var password = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
	var bizname = /^(?!\s)(?!.*\s$)(?=.*[a-zA-Z0-9])[a-zA-Z0-9 '~?!]{2,}$/;
	var address = /(\S+)/;

	if (key == "name") {

		if (name.test(value))
			return true;

		return false;

	}
	else if (key == "email") {

		if (email.test(value))
			return true;
		
		return false;

	}
	else if (key == "business") {

		if (bizname.test(value))
			return true;
		
		return false;

	}
	else if (key == "address") {

		if (address.test(value))
			return true;
		
		return false;

	}
	else if (key == "category") {

		var categories = ["H","t","y"]
		return categories.indexOf(value) > -1;

	}
	else if (key == "password") {

		if (password.test(value))
			return true;

		return false;

	}
}

function gen_password_hash(pwd) {
	// body...
	bcrypt.hash(pwd, 15, function(err, hash) {
		console.log(hash)
		return hash;
	});
}

/* Post for BoukuPay. */
router.post('/join/b', function(req, res, next) {
  	
  	try {

		/*------------list of all form data needed on for this api to work------------*/

		var firstname = req.body.firstname || null;
		var lastname = req.body.lastname || null;
		var email = req.body.email || null;
		var password = req.body.password || null;

		/*--------------------END--------------------*/

		if (validate("name", firstname) == false || firstname == null) 
		{
			res.json({ res: false, message: "invalid_firstname", reason: "First name is invalid" });
		}

		else if (validate("name", lastname) == false || lastname == null)
		{
			res.json({ res: false, message: "invalid_lastname", reason: "Last name is invalid" });
		}

		else if (validate("email", email) == false || email == null)
		{
			res.json({ res: false, message: "invalid_email", reason: "Email is invalid" });
		}

		else if (validate("password", password) == false || password == null) 
		{
			res.json({ res: false, message: "invalid_password", reason: "Password is invalid" });
		}

		else {

			/*
			* What we do here is check if the email already exist for another user, 
			* if yes then we return email already in use, else we add to db
			*/

			  res.locals.connection.query(("SELECT * FROM user WHERE email = ?"), [email], function (err, result, fields) {

			    if (err) res.json({ res: false, message: "error", reason: "SQL error" });

			    /*If: email exist*/
			    else if(result.length > 0) res.json({ res: false, message: "already_exist", reason: "Email belongs to another user" });

				/*Else add to db*/
				else
				{

					bcrypt.hash(password, 5, function(err, hash) {//hash the password

						//prepare sql statement
						var sql = "INSERT INTO user (fullname, email, password, account_type, business_name, address, product_category) VALUES (?)"
						var values = [(firstname+" "+lastname), email, hash, "buyer", null, null, null ]

						//insert into db
						res.locals.connection.query(sql, [values] , function (err, result) {

						    if (err) res.json({ res: false, message: "error", reason: err });
						    res.json({ res: true, message: "good", reason: "Successfully added" });

						});

					});

				}

			  });

		}

	}
	catch(err) {
		console.log(err)
		res.json({ res: false, message: "error", reason: "Sorry an error occured" });
		return;
	}

});


/* Post for BoukuPay. */
router.post('/join/s', function(req, res, next) {
  	
  	try {

		/*------------list of all form data needed on for this api to work------------*/

		var firstname = req.body.firstname || null;
		var lastname = req.body.lastname || null;
		var email = req.body.email || null;
		var password = req.body.password || null;
		var business = req.body.business || null;
		var address = req.body.address || null;
		var business_category = req.body.business_category || null;


		/*--------------------END--------------------*/

		if (validate("name", firstname) == false || firstname == null) 
		{
			res.json({ res: false, message: "invalid_firstname", reason: "First name is invalid" });
		}

		else if (validate("name", lastname) == false || lastname == null)
		{
			res.json({ res: false, message: "invalid_lastname", reason: "Last name is invalid" });
		}

		else if (validate("email", email) == false || email == null)
		{
			res.json({ res: false, message: "invalid_email", reason: "Email is invalid" });
		}

		else if (validate("business", business) == false || business == null)
		{
			res.json({ res: false, message: "invalid_business", reason: "Business is invalid" });
		}

		else if (validate("address", address) == false || address == null)
		{
			res.json({ res: false, message: "invalid_address", reason: "Address is invalid" });
		}

		else if (validate("category", business_category) == false || business_category == null)
		{
			res.json({ res: false, message: "invalid_business_category", reason: "Business Category is invalid" });
		}

		else if (validate("password", password) == false || password == null) 
		{
			res.json({ res: false, message: "invalid_password", reason: "Password is invalid" });
		}

		else {

			/*
			* What we do here is check if the email already exist for another user, 
			* if yes then we return email already in use, else we add to db
			*/

			  res.locals.connection.query(("SELECT * FROM user WHERE email = ? OR business_name = ?"), [email, business], function (err, result, fields) {

			    if (err) res.json({ res: false, message: "error", reason: "SQL error" });

			    /*If: email exist*/
			    else if(result.length > 0) {
			    	
			    	if (result[0].email == email) res.json({ res: false, message: "email_already_exist", reason: "Email belongs to another user" });
			    	else res.json({ res: false, message: "business_already_exist", reason: "Business name is already registered" });
			    }

				/*Else add to db*/
				else
				{

					

					bcrypt.hash(password, 5, function(err, hash) {//hash the password

						var today = new Date();//generate date of registeration
						//prepare sql statement
						var sql = "INSERT INTO user (fullname, email, password, account_type, business_name, address, product_category) VALUES (?)"
						var values = [(firstname+" "+lastname), email, hash, "seller", business, address, business_category ]

						//insert into db
						res.locals.connection.query(sql, [values] , function (err, result) {

						    if (err) res.json({ res: false, message: "error", reason: err });
						    res.json({ res: true, message: "good", reason: "Successfully added" });

						});

					});

				}

			  });

		}

	}
	catch(err) {
		console.log(err)
		res.json({ res: false, message: "error", reason: "Sorry an error occured" });
		return;
	}

});

/*login handler*/
router.post('/login', function(req, res, next) {
  	
  	try {

		/*------------list of all form data needed on for this api to work------------*/

		var email = req.body.email || null;
		var password = req.body.password || null;

		/*--------------------END--------------------*/

		if (validate("email", email) == false || email == null)
		{
			res.json({ res: false, message: "invalid_email", reason: "Email is invalid" });
		}

		else if (validate("password", password) == false || password == null) 
		{
			res.json({ res: false, message: "invalid_password", reason: "Password is invalid" });
		}

		else {

			/*
			* What we do here is check if the email already exist for another user, 
			* if yes then we return email already in use, else we add to db
			*/

			  res.locals.connection.query(("SELECT * FROM user WHERE email = ?"), [email], function (err, result, fields) {

			    if (err) res.json({ res: false, message: "error", reason: "SQL error" });

			    /*If: email exist*/
			    else if(result.length > 0) {

			    	bcrypt.compare(password, result[0].password, function(err, is_valid){

			    		if (err) res.json({ res: false, message: "error", reason: "SQL error" });

			    		else{

			    			if (is_valid == true) {

			    				if (result[0].account_type == "seller") res.json({ res: false, message: "verified", account_data: {name: result[0].fullname, email: result[0].email, business_name: result[0].business_name, address: result[0].address, product_category: result[0].product_category, account_type: result[0].account_type}, reason: "Successful" });

			    				else res.json({ res: false, message: "verified", account_data: {name: result[0].fullname, email: result[0].email, account_type: result[0].account_type}, reason: "Successful" });

			    			}

			    			else{
				    			//if email or password is incorrect
				    			res.json({ res: false, message: "invalid", reason: "Email/Password is incorrect" });
			    			}

			    		}

			    	});

			    }

			    else{
			    	res.json({ res: false, message: "invalid", reason: "Email/Password is incorrect" });
			    }

			  });
		}

	}
	catch(err) {
		console.log(err)
		res.json({ res: false, message: "error", reason: "Sorry an error occured" });
		return;
	}

});

module.exports = router;
