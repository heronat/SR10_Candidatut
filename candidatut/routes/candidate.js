var express = require('express');
var proposalsModel = require('../model/proposal.js');
var offersModel = require('../model/offer.js');
var filesModel = require('../model/file.js');
var orgasModel = require('../model/organisation.js');
var userModel = require('../model/user.js');
var router = express.Router();
var auth = require("./auth.js")

router.use(auth());

router.get("/", (req, res, next) => { res.redirect("candidate/offers"); });

/* GET home page. */
router.get('/offers', async (req, res, next) => {
    let page = req.query.page || 0;
    let size = req.query.size || 10;
    let tri = req.query.tri || 'date_creation';
    let optionsearch = req.query.optionsearch || 'nom';
    let search = '%'+(req.query.search || '')+'%';
    let candidate = req.session.user.mail;

    let data;
    if (tri=='position') {
        data = await offersModel.readAllWithSearchByPosition(candidate, optionsearch, search);
    } else {
        data = await offersModel.readAllWithSearch(tri, optionsearch, search);
    }

    let maxPages = Math.floor(data.length / size);
    page = Math.max(0, Math.min(page, maxPages));

    let offers = data.slice(page * size, (page + 1) * size);

    res.render('candidate/offer/list', {
        title: 'Liste des offres',
        type: req.session.user.type,
        offers: offers,
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

router.get('/offer_detail/:id', async (req, res, next) => {
    let data = await offersModel.read(req.params.id);
    res.render('candidate/offer/detail', { 
        title: 'Compte',
        id: data.id,
        name: data.nom,
        description: data.description,
        dateCreation: data.date_creation,
		notification: req.flash("notification")
    });
});

router.post('/offer_detail/:id/proposal', async (req, res, next) => {
	// Capture the input fields
	let files = req.files.proposal;
	let description = req.body.description;
    let offerId = req.params.id;

	// Ensure the input fields exists and are not empty
    if (description && files) {
        let data = await proposalsModel.createProposal(req.session.user.mail, offerId);
        let proposalId = data.insertId;
        if (!files[0]) files = [files];
        
        const validTypes = ["application/pdf", "image/jpeg", "image/png"];
        if (files.some((e) => !validTypes.includes(e.mimetype))) return next(new TypeError("Invalid file type"));
        
        let now = new Date(Date.now());
        files.forEach((file, index) => {
            let splitUp = file.name.split(".");
            let extension = splitUp[splitUp.length - 1];
            let path = `upload/${now.getFullYear()}-${now.getMonth()}-${now.getDay()}-o${offerId}-p${proposalId}-f${index}.${extension}`
            file.mv(path, async (err) => {
                if (err) return next(err);
                
                await filesModel.createFile(path, req.session.user.mail);
                await filesModel.attachFileToProposal(path, proposalId);

                req.flash("notification", {style: "success", message: "Candidature postée"});
                res.redirect(`/candidate/offer_detail/${offerId}`);
            });
        });
    } else {
        req.flash("notification", {style: "danger", message: "Missing information"});
        res.status(403).redirect(`/candidate/offer_detail/${offerId}`);
    }
});

router.get('/proposals', async (req, res, next) => {
    let page = req.query.page || 0;
    let size = req.query.size || 10;
    let tri = req.query.tri || 'date_creation';
    let optionsearch = req.query.optionsearch || 'date_creation';
    let search = '%'+(req.query.search || '')+'%';
    let mail = req.session.user.mail;

    let data = await proposalsModel.readAllWithSearchWithId(tri, optionsearch, search, mail);
    let maxPages = Math.floor(data.length / size);
    page = Math.max(0, Math.min(page, maxPages));

    let proposals = data.slice(page * size, (page + 1) * size);

    res.render('candidate/proposal/list', {
        title: 'Candidatures',
        type: req.session.user.type,
        proposals: proposals,
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

router.get('/proposal_detail/:id', async (req, res, next) => {
    let data = await proposalsModel.read(req.params.id);
    let offerData = await offersModel.read(data.offre);
    let filesData = await filesModel.readAllFromProposal(data.id);

    res.render('candidate/proposal/detail', { 
        title: 'Candidature',
        candidature: data,
        offre: offerData,
        pieces: filesData,
		notification: req.flash("notification")
    });
});

router.get('/delete_proposal/:id', async (req, res, next) => {
    let data = await proposalsModel.read(req.params.id);
    res.render('candidate/proposal/delete', { 
        title: "Suppression de candidature",
        id: data.id,
		notification: req.flash("notification")
    });
});

router.post('/delete_proposal/:id', async (req, res, next) => {
    await proposalsModel.deleteProposal(Number(req.params.id));
    req.flash("notification", {style: "success", message: "Candidature supprimée"});
    res.redirect(`/candidate/proposals`);
});

// router.get('/proposal_form', function(req, res, next) {
//     res.sendFile(path.join(__dirname+'/../views/candidate/proposal_form.html'));
// });

router.get('/recruiter_demand', async (req, res, next) => {
    res.render('candidate/recruiter_demand', {
        title: 'Demande de recruteur',
        notification: req.flash("notification")
    });
})

router.post('/recruiter_demand', async (req, res, next) => {
    await userModel.createRecruiterDemand(req.session.user.mail);
    req.flash("notification", {style: "success", message: "Demande envoyée"});
    res.redirect(`/candidate`);
});

module.exports = router;