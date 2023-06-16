var express = require('express');
var userModel = require('../model/user.js');
var router = express.Router();

router.get('/', async function (req, res, next) {
    let page = req.query.page || 0;
    let pageSize = req.query.pagesize || 10;

    result = await userModel.readPage(pageSize, page)
    console.log(JSON.stringify(result));
    res.render('usersList', { title: 'Liste des utilisateurs', users: result });
});

module.exports = router;
