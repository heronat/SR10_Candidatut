var db = require('./db.js');

function read(id) {
    return new Promise((res, rej) => {
        db.query("SELECT * FROM Fichier WHERE urn=?", id, (err, data) => {
            if (err) return rej(err);
            if (data.length === 0) rej(new Error("No result found"));
            res(data[0]);
        });
    });
}

function readAllFromProposal(id) {
    let sql = `
        SELECT Fichier.urn, Fichier.auteur, AttacheCandidature.candidature 
        FROM Fichier JOIN AttacheCandidature ON AttacheCandidature.fichier = Fichier.urn 
        WHERE AttacheCandidature.candidature=?
    `;
    
    return new Promise((res, rej) => {
        db.query(sql, [id], (err, data) => {
            if (err) return rej(err);
            res(data);
        });
    });
}

function createFile(urn, email) {
    let sql = "INSERT INTO Fichier (urn, auteur) VALUES (?, ?)";

    return new Promise((res, rej) => {
        db.query(sql, [urn, email], (err, data) => {
            if (err) return rej(err);
            res(data);
        });
    });
}

function attachFileToProposal(fileId, proposalId) {
    return new Promise((res, rej) => {
        db.query("INSERT INTO AttacheCandidature (candidature, fichier) VALUES (?, ?)", [proposalId, fileId], (err, data) => {
            if (err) return rej(err);
            res(data); 
        });
    });
}

function deleteFile(id) {
    return new Promise((res, rej) => {
        db.query("DELETE FROM Fichier WHERE id=?", id, (err, data) => {
            if (err) return rej(err);
            res(data);
        });
    });
}

module.exports = { read, readAllFromProposal, createFile, attachFileToProposal, deleteFile }
