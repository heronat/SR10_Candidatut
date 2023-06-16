var express = require('express');
var userModel = require('../model/user.js');
var proposalsModel = require('../model/proposal.js');
var offersModel = require('../model/offer.js');
var postFilesModel = require('../model/postFile.js');
var organisationsModel = require('../model/organisation.js');
var filesModel = require('../model/file.js');
var router = express.Router();
var auth = require("./auth.js");

const isInValidOrganisation = (user, organisation=null) => {
    return (
        user.organisation &&
        user.orga_etat === "actif" &&
        (!organisation || user.organisation === organisation)
    );
}


router.use(auth(["recruteur"]));

router.get("/", (req, res, next) => { res.redirect("recruiter/offers"); });

/* GET home page. */
router.get('/create_org', (req, res, next) => {
    res.render('recruiter/create_org', {title: "Création d'organisation"});
});

router.post('/create_org', async (req, res, next) => {
    let orgData = await organisationsModel.createOrganisation(req.body.name, req.body.date, req.body.type, req.body.adress);
    await userModel.joinOrganisation(req.session.user.mail, orgData.insertId);
    req.flash("notification", {style: "success", message: "Organisation créée et rejointe"});
    res.redirect("/recruiter");
});

router.get('/join_org', (req, res, next) => {
    res.render('recruiter/join_org', {
        title: "Rejoindre organisation", 
        options: [],
        notification: req.flash("notification")
    });
});

router.post('/join_org_search', async (req, res, next) => {
    let name = req.body.name;

    if (name) {
        let data = await organisationsModel.readAllWithSearch("nom", "nom", name)
        res.render('recruiter/join_org', {
            title: "Rejoindre organisation",
            options: data,
            notification: req.flash("notification")
        });
    } else {
        res.flash('notification', {style: "danger", message: 'Please supply a name!'});
        res.status(403).redirect("/recruiter/join_org_search");
    }
});

router.post('/join_org/:id', async (req, res, next) => {
    await organisationsModel.createJoinRequest(req.session.user.mail, req.params.id);
    res.redirect("/recruiter");
});

router.get('/orga_request', async (req, res, next) => {
    let params = {
        title: "Demandes d'ajout",
		notification: req.flash("notification")
    };

    let organisation = req.session.user.organisation;
    if (organisation === null) {
        res.render('recruiter/orga_request', params);
        return;
    }
    
    let data = await organisationsModel.readRequestsForOrganisation(organisation)
    params.requests = data;
    res.render('recruiter/orga_request', params);
});

router.post('/orga_request/accept/:user', async (req, res, next) => {
    if (!isInValidOrganisation(req.session.user)) {
        req.flash("notification", {style: "danger", message: "Vous n'êtes pas dans une organisation active"});
        res.redirect("/recruiter");
    }

    await organisationsModel.confirmJoinRequest(req.session.user.organisation, req.params.user, true);
    req.flash("notification", {style: "success", message: "Demande acceptée"});
    res.redirect("/recruiter/orga_request");
});

router.post('/orga_request/refuse/:user', async (req, res, next) => {
    if (!isInValidOrganisation(req.session.user)) {
        req.flash("notification", {style: "danger", message: "Vous n'êtes pas dans une organisation active"});
        res.redirect("/recruiter");
    }

    await organisationsModel.confirmJoinRequest(req.session.user.organisation, req.params.user, false);
    req.flash("notification", {style: "warning", message: "Demande refusée"});
    res.redirect("/recruiter/orga_request");
});

router.get('/offers', async (req, res, next) => {
    let params = {
        title: 'Liste des offres',
        type: req.session.user.type,
        offers: [],
        pageNumber: 0,
        maxPages: 0,
        params: {},
        notification: req.flash("notification")
    }

    if (!isInValidOrganisation(req.session.user)) {
        res.render('recruiter/offer/list', params);
        return;
    }

    let page = req.query.page || 0;
    let size = req.query.size || 10;
    let tri = req.query.tri || 'date_creation';
    let optionsearch = req.query.optionsearch || 'nom';
    let search = '%'+(req.query.search || '')+'%';

    let data = await offersModel.readAllFromOrganisationWithSearch(req.session.user.organisation, tri, optionsearch, search);

    let maxPages = Math.floor(data.length / size);
    page = Math.max(0, Math.min(page, maxPages));
    let offers = data.slice(page * size, (page + 1) * size);
    
    params.offers = offers
    params.pageNumber = page
    params.maxPages = maxPages
    params.params = {
        size: req.query.size,
        tri: req.query.tri,
        optionsearch: req.query.optionsearch,
        search: req.query.search
    }
    res.render('recruiter/offer/list', params);
});

router.get('/post_files', async (req, res, next) => {
    let params = {
        title: 'Liste des fiches de poste',
        type: req.session.user.type,
        postFiles: [],
        pageNumber: 0,
        maxPages: 0,
        params: {},
        notification: req.flash("notification")
    }

    if (!isInValidOrganisation(req.session.user)) {
        res.render('recruiter/post_file/list', params);
        return;
    }

    let page = req.query.page || 0;
    let size = req.query.size || 10;
    let tri = req.query.tri || 'intitule';
    let optionsearch = req.query.optionsearch || 'intitule';
    let search = '%'+(req.query.search || '')+'%';

    let data = await postFilesModel.readPostFilesFromOrganisationWithSearch(req.session.user.organisation, tri, optionsearch, search);
    
    let maxPages = Math.floor(data.length / size);
    page = Math.max(0, Math.min(page, maxPages));
    let postFiles = data.slice(page * size, (page + 1) * size);

    params.offers = postFiles
    params.pageNumber = page
    params.maxPages = maxPages
    params.params = {
        size: req.query.size,
        tri: req.query.tri,
        optionsearch: req.query.optionsearch,
        search: req.query.search
    }
    res.render('recruiter/post_file/list', params);
});

router.get('/offer_detail/:id', async (req, res, next) => {
    let offerData = await offersModel.read(req.params.id)
    if (!isInValidOrganisation(req.session.user, offerData.organisation)) {
        req.flash("notification", {style: "danger", message: "Vous n'êtes pas dans la bonne organisation"});
        res.redirect("/recruiter");
    }

    let postFileData = await postFilesModel.read(offerData.fiche_de_poste)
    res.render('recruiter/offer/detail', { 
        title: 'Détail d\'offre',
        offre: offerData,
        ficheDePoste: postFileData,
        notification: req.flash("notification")
    });
});

router.get('/post_file_detail/:id', async (req, res, next) => {
    let data = await postFilesModel.read(req.params.id);
    if (!isInValidOrganisation(req.session.user, data.organisation)) {
        req.flash("notification", {style: "danger", message: "Vous n'êtes pas dans la bonne organisation"});
        res.redirect("/recruiter");
    }

    res.render('recruiter/post_file/detail', { 
        title: 'Détail de fiche de poste',
        ficheDePoste: data,
        notification: req.flash("notification")
    });
});

router.get('/edit_offer/:id', async (req, res, next) => {
    let data = await offersModel.read(req.params.id);
    if (!isInValidOrganisation(req.session.user, data.organisation)) {
        req.flash("notification", {style: "danger", message: "Vous n'êtes pas dans la bonne organisation"});
        res.redirect("/recruiter");
    }

    let postFileData = await postFilesModel.readPostFilesFromOrganisation(req.session.user.organisation);
    res.render('recruiter/offer/edit', { 
        title: 'Edition d\'offre',
        offer: data,
        postFiles: postFileData,
        notification: req.flash("notification")
    });
});

router.post('/edit_offer/:id', async (req, res, next) => {
    let data = await offersModel.read(req.params.id);
    if (!isInValidOrganisation(req.session.user, data.organisation)) {
        req.flash("notification", {style: "danger", message: "Vous n'êtes pas dans la bonne organisation"});
        res.redirect("/recruiter");
    }

    let nom = req.body.intitule;
    let description = req.body.description;
    let validityDate = req.body.validityDate;
    let nbPieces = req.body.nbFiles;
    let piecesDemandees = req.body.fileTypes;
    let ficheDePoste = req.body.postFile;

    if (description && nom && validityDate && nbPieces && piecesDemandees && ficheDePoste) {
        let data = await offersModel.read(req.params.id);
        if (req.session.user.organisation !== data.organisation) {
            req.flash("notification", {style: "danger", message: "Vous n'êtes pas dans la bonne organisation"});
            res.redirect("/recruiter");
        }

        await offersModel.editOffer(req.params.id, nom, description, req.session.user.organisation, validityDate, nbPieces, piecesDemandees, ficheDePoste);
        req.flash("notification", {style: "success", message: "Offre éditée"});
    } else {
        res.flash('notification', {style: "danger", message: 'Missing information'});
    }

    res.redirect(`/recruiter/offer_detail/${req.params.id}`);
});

// router.get('/edit_post_file/:id', function(req, res, next) {
//     postFilesModel.read(req.params.id, (data) => {
//         if (data.organisation !== req.session.user.organisation) return next(new Error("Vous n'êtes pas dans la bonne organisation"));

//         res.render('recruiter/offer/edit', { 
//             title: 'Edition de fiche de poste',
//             ficheDePoste: data
//         });
//     });
// });


// router.post('/edit_post_file/:id', function(req, res, next) {
//     let name = req.body.name;
//     let status = req.body.status;
//     let manager = req.body.responsable;
//     let jobType = req.body.type;
//     let place = req.body.place;
//     let rythm = req.body.rythm;
//     let minPay = req.body.minPay;
//     let maxPay = req.body.maxPay;
//     let workFromHome = req.body.workFromHome === "on";
//     let description = req.body.description;

//     if (description && nom && validityDate && nbPieces && piecesDemandees && ficheDePoste) {
//         offersModel.read(req.params.id, (data) => {
//             if (req.session.user.organisation !== data.organisation) return next(new Error("Vous n'êtes pas dans la bonne organisation"));
//             offersModel.editOffer(req.params.id, nom, description, req.session.user.organisation, validityDate, nbPieces, piecesDemandees, ficheDePoste, (data) => {
//                 res.redirect(`/recruiter/offer_detail/${req.params.id}`)
//             });
//         });
//     } else {
//         res.send('Missing information');
//         res.end();
//     }
// });

router.get('/delete_offer/:id', async (req, res, next) => {
    let data = await offersModel.read(req.params.id);
    if (!isInValidOrganisation(req.session.user, data.organisation)) {
        req.flash("notification", {style: "danger", message: "Vous n'êtes pas dans la bonne organisation"});
        res.redirect("/recruiter");
    }

    res.render('recruiter/offer/delete', { 
        title: 'Suppression d\'offre',
        id: data.id,
        name: data.nom,
        notification: req.flash("notification")
    });
});

router.post('/delete_offer/:id', async (req, res, next) => {
    let data = await offersModel.read(req.params.id);
    if (!isInValidOrganisation(req.session.user, data.organisation)) {
        req.flash("notification", {style: "danger", message: "Vous n'êtes pas dans la bonne organisation"});
        res.redirect("/recruiter");
    }

    await offersModel.deleteOffer(req.params.id);
    req.flash("notification", {style: "success", message: "Offre supprimée"});
    res.redirect(`/recruiter/offers`);
});

router.get('/delete_post_file/:id', async (req, res, next) => {
    let data = await postFilesModel.read(req.params.id);
    if (!isInValidOrganisation(req.session.user, data.organisation)) {
        req.flash("notification", {style: "danger", message: "Vous n'êtes pas dans la bonne organisation"});
        res.redirect("/recruiter");
    }

    res.render('recruiter/post_file/delete', { 
        title: 'Suppression d\'offre',
        id: data.id,
        name: data.intitule,
        notification: req.flash("notification")
    });
});

router.post('/delete_post_file/:id', async (req, res, next) => {
    let data = await postFilesModel.read(req.params.id);
    if (!isInValidOrganisation(req.session.user, data.organisation)) {
        req.flash("notification", {style: "danger", message: "Vous n'êtes pas dans la bonne organisation"});
        res.redirect("/recruiter");
    }

    await postFilesModel.deletePostFile(req.params.id);
    req.flash("notification", {style: "success", message: "Fiche de poste supprimée"});
    res.redirect(`/recruiter/post_files`);
});

router.get('/proposals/:id', async (req, res, next) => {
    let offerData = await offersModel.read(req.params.id);
    if (!isInValidOrganisation(req.session.user, offerData.organisation)) {
        req.flash("notification", {style: "danger", message: "Vous n'êtes pas dans la bonne organisation"});
        res.redirect("/recruiter");
    }

    let proposalData = await proposalsModel.readAllFromOffer(req.params.id);

    res.render('recruiter/proposals', { 
        title: 'Candidatures pour l\'offre',
        id: offerData.id,
        name: offerData.nom,
        description: offerData.description,
        dateCreation: offerData.date_creation,
        proposals: proposalData,
        notification: req.flash("notification")
    });
});

router.get('/proposals/download/:id', async (req, res, next) => {
    let data = await proposalsModel.read(req.params.id);
    let offerData = await offersModel.read(data.offre);
    if (!isInValidOrganisation(req.session.user, offerData.organisation)) {
        req.flash("notification", {style: "danger", message: "Vous n'êtes pas dans la bonne organisation"});
        res.redirect("/recruiter");
    }

    let filesData = await filesModel.readAllFromProposal(data.id);

    let archiveName = "candidature-c" + data.id + "-o" + data.offre + ".zip";
    res.set('Content-Type', 'application/zip');
    res.set('Content-Disposition', `attachment; filename=${archiveName}`);
    
    let files = filesData.map((e) => "upload/" + e.urn);
    console.log(files);
    res.zip(files, archiveName, (err) => {
        if (err) {
            console.log('Error sending files:', err);
        } else {
            console.log('Files sent successfully');
        }
    });
});

router.get('/proposals/delete/:id', async (req, res, next) => {
    let data = await proposalsModel.read(req.params.id);
    let offerData = await offersModel.read(data.offre);
    if (!isInValidOrganisation(req.session.user, offerData.organisation)) {
        req.flash("notification", {style: "danger", message: "Vous n'êtes pas dans la bonne organisation"});
        res.redirect("/recruiter");
    }

    await proposalsModel.deleteProposal(req.params.id);
    req.flash("notification", {style: "success", message: "Candidature supprimée"});
    res.redirect(`/recruiter/offers`);
});

router.get('/create_post_file', (req, res, next) => {
    if (!isInValidOrganisation(req.session.user)) {
        req.flash("notification", {style: "danger", message: "Vous n'êtes pas dans une organisation active"});
        res.redirect("/recruiter");
    }

    res.render('recruiter/post_file/create', {title: "Création de fiche de poste"});
});

router.post('/create_post_file', async (req, res, next) => {
    if (!isInValidOrganisation(req.session.user)) {
        req.flash("notification", {style: "danger", message: "Vous n'êtes pas dans une organisation active"});
        res.redirect("/recruiter");
    }

    let name = req.body.name;
    let status = req.body.status;
    let manager = req.body.responsable;
    let jobType = req.body.type;
    let place = req.body.place;
    let rythm = req.body.rythm;
    let minPay = req.body.minPay;
    let maxPay = req.body.maxPay;
    let workFromHome = req.body.workFromHome === "on";
    let description = req.body.description;

    if (description && name) {
        let data = await postFilesModel.createPostFile(name, status, manager, jobType, place, rythm, minPay, maxPay, description, workFromHome, req.session.user.organisation);
        req.flash("notification", {style: "success", message: "Fiche de poste créée"});
        res.redirect(`/recruiter/post_file_detail/${data.insertId}`);
    } else {
        res.flash('notification', {style: "danger", message: 'Missing information'});
        res.status(403).redirect("/recruiter/create_post_file");
    }
});

router.get('/create_offer', async (req, res, next) => {
    if (!isInValidOrganisation(req.session.user)) {
        req.flash("notification", {style: "danger", message: "Vous n'êtes pas dans une organisation active"});
        res.redirect("/recruiter");
    }

    let data = await postFilesModel.readPostFilesFromOrganisation(req.session.user.organisation);
    res.render('recruiter/offer/create', {
        title: "Création d'offre",
        postFiles: data,
        notification: req.flash("notification")
    });
});

router.post('/create_offer', async (req, res, next) => {
    if (!isInValidOrganisation(req.session.user)) {
        req.flash("notification", {style: "danger", message: "Vous n'êtes pas dans une organisation active"});
        res.redirect("/recruiter");
    }

    let nom = req.body.name;
    let description = req.body.description;
    let validityDate = req.body.validityDate;
    let nbPieces = req.body.nbFiles;
    let piecesDemandees = req.body.fileTypes;
    let ficheDePoste = req.body.postFile;

    if (description && nom && validityDate && nbPieces && piecesDemandees && ficheDePoste) {
        let data = await offersModel.createOffer(nom, description, req.session.user.organisation, validityDate, nbPieces, piecesDemandees, ficheDePoste);
        req.flash("notification", {style: "success", message: "Offre créée"});
        res.redirect(`/recruiter/offer_detail/${data.insertId}`);
    } else {
        res.flash('notification', {style: "danger", message: 'Missing information'});
        res.status(403).redirect("/recruiter/create_offer");
    }
});

module.exports = router;