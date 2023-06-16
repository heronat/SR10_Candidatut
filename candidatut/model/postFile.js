var db = require('./db.js');

function read(id) {
    return new Promise((res, rej) => {
        db.query("SELECT * FROM Fiche_de_Poste WHERE id=?", [id], (err, data) => {
            if (err) return rej(err);
            if (data.length === 0) rej(new Error("No result found"));
            res(data[0]);
        });
    });
}

function readPostFilesFromOrganisation(organisation) {
    return new Promise((res, rej) => {
        db.query("SELECT * FROM Fiche_de_Poste WHERE organisation=?", [organisation], (err, data) => {
            if (err) return rej(err);
            res(data);
        });
    });
}

function readPostFilesFromOrganisationWithSearch(organisation, tri, optionsearch, search) {
    var sql= `
        SELECT *
        FROM Fiche_de_Poste 
        WHERE organisation=? 
        AND Fiche_de_Poste.` + db.escapeId(optionsearch) + `LIKE ? 
        ORDER BY Fiche_de_Poste.` + db.escapeId(tri) + `;
    `;
    
    return new Promise((res, rej) => {
        db.query(sql, [organisation, search], (err, data) => {
            if (err) return rej(err);
            res(data);
        });
    });
}

function createPostFile(name, status, manager, jobType, place, rythm, minPay, maxPay, description, workFromHome, organisationId) {
    let sql = `
        INSERT INTO Fiche_de_Poste (
            intitule,
            statut,
            responsable,
            type_metier,
            lieu,
            heures_semaine,
            teletravail,
            salaire_min,
            salaire_max,
            description,
            organisation
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    return new Promise((res, rej) => {
        db.query(sql, [name, status, manager, jobType, place, rythm, workFromHome, minPay, maxPay, description, organisationId], (err, data) => {
            if (err) return rej(err);
            res(data);
        });
    });
}

// function editPostFile(callback) {
//     let sql = "INSERT INTO Fiche_de_Poste (nom, description, organisation) VALUES (?, ?, ?)";
//     db.query(sql, [nom, description, organisationId], (err, res) => {
//         if (err) throw err;
//         callback(res);
//     });
// }

function deletePostFile(id) {
    return new Promise((res, rej) => {
        db.query("DELETE FROM Fiche_de_Poste WHERE id=?", [id], (err, data) => {
            if (err) return rej(err);
            res(data);
        });
    });
}

module.exports = {
    read, readPostFilesFromOrganisation, readPostFilesFromOrganisationWithSearch, createPostFile, deletePostFile
}