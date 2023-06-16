var db = require('./db.js');

function read(id) {
    return new Promise((res, rej) => {
        db.query("SELECT * FROM Offre WHERE id=?", id, (err, data) => {
            if (err) rej(err);
            if (data.length === 0) rej(new Error("No result found"));
            res(data[0]);
        });
    });
}

function readAll() {
    return new Promise((res, rej) => {
        db.query("SELECT * FROM Offre", id, (err, data) => {
            if (err) rej(err);
            res(data);
        });
    });
}

function readAllWithSearch(tri, optionsearch, search) {
    var sql=`
        SELECT Offre.id, Offre.nom, Offre.description, Organisation.nom organisation
        FROM Offre 
        JOIN Organisation ON Organisation.id = Offre.organisation 
        WHERE Offre.` + db.escapeId(optionsearch) + `LIKE ? 
        ORDER BY Offre.` + db.escapeId(tri) + `;
    `;

    return new Promise((res, rej) => {
        db.query(sql, [search], (err, data) => {
            if (err) rej(err);
            res(data);
        });
    });
}

function readAllWithSearchByPosition(candidate, optionsearch, search) {
    var sql=`
        SELECT Offre.id, Offre.nom, Offre.description, Organisation.nom organisation
        FROM Offre, Utilisateur , Organisation
        WHERE  Organisation.id = Offre.organisation AND Offre.` + db.escapeId(optionsearch) + `LIKE ? AND Utilisateur.mail ="` + candidate + `"
        ORDER BY SQRT(POW(Organisation.latitude - Utilisateur.latitude, 2) + POW(Organisation.longitude - Utilisateur.longitude, 2));
    `;

    return new Promise((res, rej) => {
        db.query(sql, [search], (err, data) => {
            if (err) rej(err);
            res(data);
        });
    });
}

function readAllFromOrganisationWithSearch(organisation, tri, optionsearch, search) {
    var sql= `
        SELECT Offre.id, Offre.nom, Offre.description, Organisation.nom organisation 
        FROM Offre 
        JOIN Organisation ON Organisation.id = Offre.organisation 
        WHERE organisation=? 
        AND Offre.` + db.escapeId(optionsearch) + `LIKE ? 
        ORDER BY Offre.` + db.escapeId(tri) + `;
    `;
    
    return new Promise((res, rej) => {
        db.query(sql, [organisation, search], (err, data) => {
            if (err) rej(err);
            res(data);
        });
    });
}

function createOffer(nom, description, organisationId, validityDate, nbPieces, piecesDemandees, postFile) {
    let sql = `
        INSERT INTO Offre (
            nom,
            date_de_validite,
            description,
            organisation,
            nombre_pieces_demandees,
            pieces_demandees,
            fiche_de_poste
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    return new Promise((res, rej) => {
        db.query(sql, [nom, validityDate, description, organisationId, nbPieces, piecesDemandees, postFile], (err, data) => {
            if (err) rej(err);
            res(data);
        });
    });
}

function setOfferState(id, state) {
    return new Promise((res, rej) => {
        db.query("UPDATE Offre SET etat=? WHERE id=?", [state, id], (err, data) => {
            if (err) rej(err);
            res(data);
        });
    });
}

function editOffer(id, nom, description, organisationId, validityDate, nbPieces, piecesDemandees, postFile) {
    let sql = `
        UPDATE Offre SET
            nom=?,
            date_de_validite=?,
            description=?,
            organisation=?,
            nombre_pieces_demandees=?,
            pieces_demandees=?,
            fiche_de_poste=?
        WHERE id=?
    `;

    return new Promise((res, rej) => {
        db.query(sql, [nom, validityDate, description, organisationId, nbPieces, piecesDemandees, postFile, id], (err, data) => {
            if (err) rej(err);
            res(data);
        });
    });
}

function deleteOffer(id) {
    return new Promise((res, rej) => {
        db.query("DELETE FROM Offre WHERE id=?", [id], (err, data) => {
            if (err) rej(err);
            res(data);
        });
    });
}

module.exports = { 
    read, readAll, readAllWithSearch, readAllWithSearchByPosition, readAllFromOrganisationWithSearch,
    createOffer, setOfferState, editOffer, deleteOffer
}
