var db = require('./db.js');

function read(id) {
    return new Promise((res, rej) => {
        db.query("SELECT * FROM Candidature WHERE id=?", [id], (err, data) => {
            if (err) return rej(err);
            if (data.length === 0) rej(new Error("No result found"));
            res(data[0]);
        });
    });
}

function readAllWithSearch(tri, optionsearch, search) {
    var sql =`
        SELECT Candidature.id, Candidature.offre, Utilisateur.mail mail
        FROM Candidature 
        JOIN Utilisateur ON Utilisateur.mail = Candidature.candidat
        JOIN Offre ON Offre.id = Candidature.offre
        WHERE Offre.` + db.escapeId(optionsearch) + `LIKE ?
        ORDER BY Offre.` + db.escapeId(tri) + `;
    `;

    return new Promise((res, rej) => {
        db.query(sql, [search], (err, data) => {
            if (err) return rej(err);
            res(data);
        });
    });
}

function readAllWithSearchWithId(tri, optionsearch, search, mail) {
    var sql =`
        SELECT Candidature.id, Candidature.offre, Utilisateur.mail mail
        FROM Candidature 
        JOIN Utilisateur ON Utilisateur.mail = Candidature.candidat
        JOIN Offre ON Offre.id = Candidature.offre
        WHERE Candidature.candidat = ? AND Offre.` + db.escapeId(optionsearch) + `LIKE ?
        ORDER BY Offre.` + db.escapeId(tri) + `;
    `;

    return new Promise((res, rej) => {
        db.query(sql, [mail, search], (err, data) => {
            if (err) return rej(err);
            res(data);
        });
    });
}

function readAllFromOffer(offer) {
    let sql = `
        SELECT Candidature.id, Candidature.offre, Utilisateur.mail mail 
        FROM Candidature JOIN Utilisateur ON Utilisateur.mail = Candidature.candidat 
        WHERE Candidature.offre=?
    `;

    return new Promise((res, rej) => {
        db.query(sql, [offer], (err, data) => {
            if (err) return rej(err);
            res(data);
        });
    });
}

function createProposal(mail, offer) {
    let sql = "INSERT INTO Candidature (candidat, offre) VALUES (?,?)";

    return new Promise((res, rej) => {
        db.query(sql, [mail, offer], (err, data) => {
            if (err) return rej(err);
            res(data);
        });
    });
}

function deleteProposal(id) {
    return new Promise((res, rej) => {
        db.query("DELETE FROM Candidature WHERE id=?", [id], (err, data) => {
            if (err) return rej(err);
            res(data);
        })
    });
}

module.exports = { read, readAllWithSearch, readAllWithSearchWithId, readAllFromOffer, createProposal, deleteProposal }
