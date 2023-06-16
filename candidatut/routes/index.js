var express = require('express');
var userModel = require("../model/user");
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    res.redirect("/home");
});

router.get('/disconnect', function(req, res, next) {
    req.session.user = null;
    res.redirect("/home");
});

module.exports = router;
