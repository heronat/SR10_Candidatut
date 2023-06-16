var express = require('express');
var userModel = require('../model/user.js');
var router = express.Router();
var auth = require("./auth.js")

router.use(auth());

/* GET home page. */
router.get('/', async function(req, res, next) {
    let data = await userModel.read(req.session.user.mail);
    res.render('account/account', { 
        title: 'Compte',
        firstName: data.prenom,
        lastName: data.nom,
        mail: data.mail,
        phone: data.telephone,
        creationDate: data.date_creation,
        notification: req.flash("notification")
    });
});

router.get('/edit', async function(req, res, next) {
    let data = await userModel.read(req.session.user.mail);
    res.render('account/edit' , {
        title: 'Edition de Compte',
        lastName: data.nom,
        firstName: data.prenom,
        phone: data.telephone,
        notification: req.flash("notification")
    });
});

router.post('/edit', async function(req, res, next) {
    let pwd = req.body.password;
    if (pwd.length <= 12 || !pwd.match("(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[,?;.:/!&*%$])")) {
		req.flash("notification", {
			style: "danger",
			message: "Le mot de passe ne correspond pas aux demandes"
		});
		res.status(403).redirect('/account/edit');
	}

    await userModel.editUser(req.session.user.mail, pwd, req.body.lastName, req.body.firstName, req.body.phone, req.body.address);
    req.flash("notification", {style: "success", message: "Compte édité"});
    res.redirect('/account');
});

router.get('/delete', (req, res, next) => {
    res.render('account/delete' , {
        title: 'Suppression de Compte',
        notification: req.flash("notification")
    });
});

router.post('/delete', async function(req, res, next) {
    await userModel.deleteUser(req.session.user.mail);
    req.flash("notification", {style: "success", message: "Compte supprimé"});
    res.redirect('/disconnect');
});
module.exports = router;