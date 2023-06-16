var express = require('express');
var path = require("path");
var userModel = require('../model/user.js');
var router = express.Router();

router.use((req, res, next) => {
    if (req.session.user) {
        switch(req.session.user.type) {
            case "candidat": res.redirect('/candidate'); break;
            case "recruteur": res.redirect('/recruiter'); break;
            case "administrateur": res.redirect('/admin'); break;
            default: throw new RuntimeError("Couldn't redirect after authentification");
        }
        return;
    }

    next();
});

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('home/home', {
        title: ""
    });
});

router.get('/login', function(req, res, next) {
    res.render('home/login', {
        title: "Connexion",
		notification: req.flash("notification")
    });
});

router.post('/login', async (req, res) => {
	// Capture the input fields
	let username = req.body.mail;
	let password = req.body.password;
	
	// Ensure the input fields exists and are not empty
	if (username && password) {
		// Execute SQL query that'll select the account from the database based on the specified username and password
		let isValid = await userModel.areValid(username, password);
		if (isValid) {
			let user = await userModel.read(username);
			req.session.user = user;
			res.redirect("/home");
		} else {
			req.flash("notification", {
				style: "danger",
				message: "Incorrect Username and/or Password!"
			});
			res.status(403).redirect('/home/login');
		}
	} else {
		req.flash("notification", {
			style: "danger",
			message: "Please enter a Username and Password!"
		});
		res.status(403).redirect('/home/login');
	}
});

router.get('/signup', function(req, res, next) {
    res.render('home/signup', {
        title: "Inscription",
		notification: req.flash("notification")
    });
});

router.post('/signup', async (req, res, next) => {
	pwd = req.body.password || "";
	if (pwd.length <= 12 || !pwd.match("(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[,?;.:/!&*%$])")) {
		req.flash("notification", {
			style: "danger",
			message: "Le mot de passe ne correspond pas aux demandes"
		});
		res.status(403).redirect('/home/login');
	}

    await userModel.createUser(req.body.mail, pwd, req.body.lastName, req.body.firstName, req.body.phone, "candidat", req.body.address);
	res.redirect('/home/login');
});

module.exports = router;
