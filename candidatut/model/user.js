var db = require('./db.js');
const geocoding = require('./geocoder.js');
const reverseGeocoding = require('./geocoder.js');
const {generateHash, comparePassword} = require('./pass.js');


const VALID_TYPES = ["candidat", "recruteur", "administrateur"];


function read(email) {
    return new Promise((res, rej) => {
        let sql = `
            SELECT Utilisateur.*, Organisation.nom orga_nom, Organisation.etat orga_etat
            FROM Utilisateur 
            LEFT JOIN Organisation ON Organisation.id = Utilisateur.organisation 
            WHERE mail=?
        `
        db.query(sql, email, (err, data) => {
            if (err) return rej(err);
            if (data.length === 0) return rej(new Error("No result found"));
            res(data[0]);
        });
    });
}

function readAll() {
    return new Promise((res, rej) => {
        db.query("SELECT * FROM Utilisateur", [], (err, data) => {
            if (err) return rej(err);
            res(data);
        });
    });
}

function readAllWithSearch(tri, optionsearch, search) {
    var sql=`
        SELECT *
        FROM Utilisateur 
        WHERE Utilisateur.` + db.escapeId(optionsearch) + `LIKE ? 
        ORDER BY Utilisateur.` + db.escapeId(tri) + `;
    `;

    return new Promise((res, rej) => {
        db.query(sql, [search], (err, data) => {
            if (err) return rej(err);
            res(data);
        });
    });
}

function areValid(email, password) {
    let sql = "SELECT mdp FROM Utilisateur WHERE mail = ?";
    return new Promise((res, rej) => {
        db.query(sql, [email], (err, data) => {
            if (err) return rej(err);
            res(data.length === 1 && comparePassword(password, data[0].mdp) );
        });
    });
}

function isType(email, type) {
    if (!VALID_TYPES.includes(type)) throw new TypeError(`Type ${type} is not a valid user type`);

    return new Promise((res, rej) => {
        db.query("SELECT type FROM Utilisateur WHERE mail=?", email, (err, data) => {
            if (err) return rej(err);
            res(data.type === type);
        })
    });
}

async function createUser(email, pwd, nom, prenom, telephone, type, address) {
    if (!VALID_TYPES.includes(type)) throw new TypeError(`Type ${type} is not a valid user type`);
    pwd = await generateHash(pwd);
    console.log(pwd);
    // Géocodage de l'adresse
    return new Promise((res, rej) => {
        geocoding(address).then((coords) => {
            let sql = "INSERT INTO Utilisateur (mail, mdp, nom, prenom, telephone, type, longitude, latitude) VALUES (?,?,?,?,?,?,?,?)";
            db.query(sql, [email, pwd, nom, prenom, telephone, type, coords.longitude, coords.latitude], (err, data) => {
                if (err) return rej(err);
                res(data.type === type);
            });
        }).catch((err) => {
            throw err;
        });
    });
}

function editUser(email, pwd, nom, prenom, telephone, address) {
    return new Promise((res, rej) => {
        geocoding(address).then((coords) => {
            db.query("UPDATE Utilisateur SET mdp=?, nom=?, prenom=?, telephone=?, longitude=?, latitude=? WHERE mail=?", [pwd, nom, prenom, telephone, coords.longitude, coords.latitude, email], (err, data) => {
                if (err) return rej(err);
                res(data);
            });
        }).catch((err) => {
            throw err;
        });
    });
}

function createRecruiterDemand(mail) {
    return new Promise((res, rej) => {
        db.query("INSERT INTO Demande_Recruteur (mail) VALUES (?)", [mail], (err, data) => {
            if (err) return rej(err);
            res(data);
        });
    });
}

function deleteRecruiterDemand(mail) {
    return new Promise((res, rej) => {
        db.query("DELETE FROM Demande_Recruteur WHERE mail=?", [mail], (err, data) => {
            if (err) return rej(err);
            res(data);
        });
    });
}

function readRequestsForRecruiter() {
    return new Promise((res, rej) => {
        db.query("SELECT * FROM Demande_Recruteur", (err, data) => {
            if (err) return rej(err);
            res(data);
        });
    });
}

function setType(email, type) {
    if (!VALID_TYPES.includes(type)) throw new TypeError(`Type ${type} is not a valid user type`);

    return new Promise((res, rej) => {
        db.query("UPDATE Utilisateur SET type=? WHERE mail=?", [type, email], (err, data) => {
            if (err) return rej(err);
            res(data);
        });
    });
}

function setActive(email, active) {
    return new Promise((res, rej) => {
        db.query("UPDATE Utilisateur SET actif=? WHERE mail=?", [active, email], (err, data) => {
            if (err) return rej(err);
            res(data);
        });
    });
}

function joinOrganisation(mail, organisation) {
    return new Promise((res, rej) => {
        db.query("UPDATE Utilisateur SET organisation=? WHERE mail=?", [organisation, mail], (err, data) => {
            if (err) return rej(err);
            res(data);
        })
    });
}

function deleteUser(email) {
    return new Promise((res, rej) => {
        db.query("DELETE FROM Utilisateur WHERE mail=?", email, (err, data) => {
            if (err) return rej(err);
            res(data);
        })
    });
}

function confirmJoinRequest(mail, accepted) {
    return new Promise((res, rej) => {
        db.query("DELETE FROM Demande_Recruteur WHERE mail=?", [ mail], async (err, data) => {
            if (err) return rej(err);
            if (!accepted) return res(data);
    
            res(await setType(mail, "recruteur"));
        });
    });
}

module.exports = { 
    read, readAll, readAllWithSearch, 
    areValid, isType, 
    createUser, editUser, createRecruiterDemand, deleteRecruiterDemand,readRequestsForRecruiter, setType, setActive, deleteUser, 
    joinOrganisation, confirmJoinRequest 
}
