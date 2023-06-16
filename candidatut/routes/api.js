var express = require('express');
var router = express.Router();
const usersModel = require("../model/user.js");

router.get("/users", async (req, res, next) => {
    let users = await usersModel.readAll();
    res.status(200).json(users);
});

router.post("/users/", async (req, res, next) => {
    await usersModel.createUser(req.body.email, req.body.password, req.body.nom, req.body.prenom, req.body.telephone, req.body.type, req.body.address);
    let user = await usersModel.read(req.params.id);
    res.status(201).json(user);
});


router.get("/users/:id", async (req, res, next) => {
    let user = await usersModel.read(req.params.id);
    res.status(200).json(user);
});

router.put("/users/:id", async (req, res, next) => {
    await usersModel.editUser(req.params.id, req.body.password, req.body.nom, req.body.prenom, req.body.telephone, req.body.address);
    let user = await usersModel.read(req.params.id);
    res.status(200).json(user);
});

router.delete("/users/:id", async (req, res, next) => {
    await usersModel.delete(req.params.id);
    res.status(204);
});


module.exports = router;