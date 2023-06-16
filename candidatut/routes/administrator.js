var express = require('express');
var usersModel = require('../model/user.js');
var orgasModel = require('../model/organisation.js');
var router = express.Router();
var auth = require("./auth.js")

router.use(auth(["administrateur"]));

router.get("/", (req, res, next) => { res.redirect("admin/accounts"); });

router.get('/accounts', async (req, res, next) => {
    let page = req.query.page || 0;
    let size = req.query.size || 10;
    let tri = req.query.tri || 'date_creation';
    let optionsearch = req.query.optionsearch || 'nom';
    let search = '%'+(req.query.search || '')+'%';

    let data = await usersModel.readAllWithSearch(tri, optionsearch, search);

    let maxPages = Math.floor(data.length / size);
    page = Math.max(0, Math.min(page, maxPages));

    let accounts = data.slice(page * size, (page + 1) * size);

    res.render('administrator/account/list', {
        title: 'Liste des comptes',
        type: req.session.user.type,
        users: accounts,
        pageNumber: page,
        maxPages: maxPages,
        params: {
            size: req.query.size,
            tri: req.query.tri,
            optionsearch: req.query.optionsearch,
            search: req.query.search
        },
        notification: req.flash("notification")
    });
});

router.get('/account_detail/:id', async (req, res, next) => {
    let data = await usersModel.read(req.params.id);
    res.render('administrator/account/detail', { 
        title: 'Détail de compte',
        account: data,
        notification: req.flash("notification")
    });
});

router.get('/delete_account/:id', async (req, res, next) => {
    let data = await usersModel.read(req.params.id);
    res.render('administrator/account/delete', { 
        title: 'Suppression de compte',
        id: data.mail,
        nom: data.nom,
        prenom: data.nom,
        notification: req.flash("notification")
    });
});

router.post('/delete_account/:id', async (req, res, next) => {
    await usersModel.deleteUser(req.params.id);
    req.flash("notification", {style: "success", message: "Utilisateur supprimé"});
    res.redirect(`/admin/accounts`);
});

router.get('/edit_account/:id', async (req, res, next) => {
    let data = await usersModel.read(req.params.id);
    res.render('administrator/account/edit', { 
        title: 'Edition de compte',
        account: data,
        types: {
            "candidat": "Candidat",
            "recruteur": "Recruteur",
            "administrateur": "Administrateur"
        },
        notification: req.flash("notification")
    });
});

router.post('/edit_account/:id', async (req, res, next) => {
    let active = req.body.active === "on";
    let type = req.body.type;

    await usersModel.setActive(req.params.id, active);
    await usersModel.setType(req.params.id, type);
    req.flash("notification", {style: "success", message: "Utilisateur édité"});
    res.redirect(`/admin/account_detail/${req.params.id}`);
});

router.get('/orgas', async (req, res, next) => {
    let page = req.query.page || 0;
    let size = req.query.size || 10;
    let tri = req.query.tri || 'date_creation';
    let optionsearch = req.query.optionsearch || 'nom';
    let search = '%'+(req.query.search || '')+'%';

    let data = await orgasModel.readAllWithSearch(tri, optionsearch, search);
    let maxPages = Math.floor(data.length / size);
    page = Math.max(0, Math.min(page, maxPages));

    let orgas = data.slice(page * size, (page + 1) * size);
    console.log(orgas)

    res.render('administrator/orga/list', {
        title: 'Liste des organisations',
        type: req.session.user.type,
        orgas: orgas,
        pageNumber: page,
        maxPages: maxPages,
        params: {
            size: req.query.size,
            tri: req.query.tri,
            optionsearch: req.query.optionsearch,
            search: req.query.search
        },
        notification: req.flash("notification")
    });
});

router.get('/orga_detail/:id', async (req, res, next) => {
    let data = await orgasModel.read(req.params.id);
    res.render('administrator/orga/detail', { 
        title: "Détail d'organisation",
        orga: data,
        notification: req.flash("notification")
    });
});

router.get('/edit_orga/:id', async (req, res, next) => {
    let data = await orgasModel.read(req.params.id);
    res.render('administrator/orga/edit', { 
        title: 'Edition d organisation',
        orga: data,
        types: {
            "en_attente": "En Attente",
            "actif": "Actif",
            "refuse": "Refusé"
        },
        notification: req.flash("notification")
    });
});

router.post('/edit_orga/:id', async (req, res, next) => {
    let type = req.body.type;
    await orgasModel.setType(req.params.id, type);
    req.flash("notification", {style: "success", message: "Organisation éditée"});
    res.redirect(`/admin/orga_detail/${req.params.id}`);
});

router.get('/delete_orga/:id', async (req, res, next) => {
    let data = await orgasModel.read(req.params.id);
    res.render('administrator/orga/delete', { 
        title: "Suppression d'organisation",
        id: data.id,
        nom: data.nom,
        notification: req.flash("notification")
    });
});

router.post('/delete_orga/:id', async (req, res, next) => {
    await orgasModel.deleteOrganisation(req.params.id);
    req.flash("notification", {style: "success", message: "Organisation supprimée"});
    res.redirect(`/admin/orgas`);
});

router.get('/recruiter_demand', async (req, res, next) => {
    let params = {title: "Demandes de compte recruteur"};
    let data = await usersModel.readRequestsForRecruiter()
    params.requests = data;
    res.render('administrator/recruiter_demand', params);
});

router.post('/recruiter_demand/accept/:user', async (req, res, next) => {
    await usersModel.confirmJoinRequest(req.params.user, true);
    req.flash("notification", {style: "success", message: "Demande acceptée"});
    res.redirect("/admin/recruiter_demand");
});

router.post('/recruiter_demand/refuse/:user', async (req, res, next) => {
    await usersModel.confirmJoinRequest(req.params.user, false);
    req.flash("notification", {style: "warning", message: "Demande refusée"});
    res.redirect("/admin/recruiter_demand");
});



module.exports = router;