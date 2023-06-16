const DB = require("../model/db.js");
const offerModel = require("../model/offer.js");
const userModel = require("../model/user.js");

let userID = null;
let offerID = null;
let organisationID = null;
let postFileID = null;

describe.skip("Tests for Offer model", () => {
    beforeAll(() => {

    });

    afterAll((done) => {
        if (offerID) offerModel.deleteUser(offerID, () => {});
        if (userID) userModel.deleteUser(userID, () => {});

        setTimeout(() => {
            DB.end((err) => {
                if (err) done(err);
                else done();
            });
        }, 1000);
    });

    test("create user", async () => {
        let data = await userModel.createUser("test@test.fr", "test", "TEST", "Test", "0605040302", "candidat");

        expect(data).toBeDefined();
        userID = data.insertId;
    });

    test("create offer", async () => {
        let data = await offerModel.createOffer("Offre test", "Ceci est un test", organisationID, "2025-10-01", 1, "CV", postFileID);

        expect(data).toBeDefined();
        offerID = data.insertId;
    });

    test("read user", async () => {
        let data = await offerModel.read("test@test.fr");
        expect(data.mdp).toBe("test")
        expect(data.nom).toBe("TEST");
        expect(data.prenom).toBe("Test");
        expect(data.telephone).toBe("0605040302");
        expect(data.type).toBe("candidat");
    });

    test("update user", async () => {
        let data = await offerModel.editUser("test@test.fr", "test2", "Testeur", "Testé", "0607080910");
        expect(data).toBeDefined();
        
        data = await offerModel.setType("test@test.fr", "recruteur");
        expect(data).toBeDefined();
    });

    test("delete user", async () => {
        let data = await offerModel.deleteUser("test@test.fr");
        expect(data).toBeDefined();
        userID = null;
    });

    test("delete offer", async () => {
        let data = await offerModel.deleteUser(offerID);
        expect(data).toBeDefined();
        offerID = null;
    });
});