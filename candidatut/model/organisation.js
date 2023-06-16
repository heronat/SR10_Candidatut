var db = require('./db.js');
const usersModel = require('./user.js');
const geocoding = require('./geocoder.js');

function read(id) {
    return new Promise((res, rej) => {
        db.query("SELECT * FROM Organisation WHERE id=?", id, (err, data) => {
            if (err) return rej(err);
            if (data.length === 0) rej(new Error("No result found"));
            res(data[0]);
        });
    });
}

function readAllWithSearch(tri, optionsearch, search) {
    var sql=`
        SELECT *
        FROM Organisation 
        WHERE Organisation.` + db.escapeId(optionsearch) + `LIKE ? 
        ORDER BY Organisation.` + db.escapeId(tri) + `;
    `;

    return new Promise((res, rej) => {
        db.query(sql, [search], (err, data) => {
            if (err) return rej(err);
            res(data);
        });
    });
}

function readAll() {
    return new Promise((res, rej) => {
        db.query("SELECT * FROM Organisation", id, (err, data) => {
            if (err) return rej(err);
            res(data);
        });
    });
}

function getUserOrganisation(mail) {
    return new Promise((res, rej) => {
        db.query("SELECT * FROM Utilisateur JOIN Organisation ON Organisation.id = Utilisateur.organisation WHERE Utilisateur.mail = ?", [mail], (err, data) => {
            if (err) return rej(err);
            res(data[0]);
        })
    });
}

function createJoinRequest(mail, organisation) {
    return new Promise((res, rej) => {
        db.query("INSERT INTO Rejoindre_Organisation (mail, organisation) VALUES (?, ?)", [mail, organisation], (err, data) => {
            if (err) return rej(err);
            res(data);
        })
    });
}

function readJoinRequest(mail) {
    return new Promise((res, rej) => {
        db.query("SELECT * FROM Rejoindre_Organisation WHERE mail = ?", [mail], (err, data) => {
            if (err) return rej(err);
            res(data[0]);
        });
    });
}

function readRequestsForOrganisation(organisation) {
    return new Promise((res, rej) => {
        db.query("SELECT * FROM Rejoindre_Organisation WHERE organisation = ?", [organisation], (err, data) => {
            if (err) return rej(err);
            res(data);
        });
    });
}

function readAllJoinRequests() {
    return new Promise((res, rej) => {
        db.query("SELECT * FROM Rejoindre_Organisation", (err, data) => {
            if (err) return rej(err);
            res(data);
        });
    });
}

function confirmJoinRequest(organisation, mail, accepted) {
    return new Promise((res, rej) => {
        db.query("DELETE FROM Rejoindre_Organisation WHERE organisation=? AND mail=?", [organisation, mail], async (err, data) => {
            if (err) return rej(err);
            if (!accepted) return res(data);
    
            res(await usersModel.joinOrganisation(mail, organisation));
        });
    });
}

function createOrganisation(nom, date_creation, typeOrg, address) {
    return geocoding(address).then((coords) => {   
        let sql = "INSERT INTO Organisation (nom, date_creation, type, longitude, latitude) VALUES (?, ?, ?, ?, ?)";

        return new Promise((res, rej) => {
            db.query(sql, [nom, date_creation, typeOrg, coords.longitude, coords.latitude], (err, data) => {
                if (err) return rej(err);
                res(data);
            });
        });
    })
    .catch((err) => {
        throw err;
    });
}

function editOrganisation(id, nom, date_creation, typeOrg, address) {

    return new Promise((res, rej) => {
        db.query("UPDATE Organisation SET nom=?, date_creation=?, type=?, adresse=? WHERE id=?", [nom, date_creation, typeOrg, address, id], (err, data) => {
            if (err) return rej(err);
            res(data);
        });
    });
}

function setType(id, type) {
    return new Promise((res, rej) => {
        db.query("UPDATE Organisation SET etat=? WHERE id=?", [type, id], (err, data) => {
            if (err) return rej(err);
            res(data);
        });
    });
}

function deleteOrganisation(id) {
    return new Promise((res, rej) => {
        // PAS DE CASCADE, enlever les recruteurs de l'organisaton avant
        db.query("DELETE FROM Organisation WHERE id=?", [id, id], (err, data) => {
            if (err) return rej(err);
            res(data);
        })
    });
}

module.exports = { 
    read, readAll, readAllWithSearch, getUserOrganisation,
    createJoinRequest, createOrganisation,
    readAllJoinRequests, readJoinRequest, readRequestsForOrganisation, confirmJoinRequest,
    editOrganisation, setType, deleteOrganisation 
}
