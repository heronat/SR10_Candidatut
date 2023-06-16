const DB = require("../model/db.js");
const model = require("../model/user.js");

let userID = null;

describe("Tests for User model", () => {
    beforeAll(() => {

    });

    afterAll((done) => {
        if (userID) model.deleteUser(userID, () => {});

        setTimeout(() => {
            DB.end((err) => {
                if (err) done(err);
                else done();
            });
        }, 1000);
    });

    test("create user", async () => {
        let data = await model.createUser("test@test.fr", "test", "TEST", "Test", "0605040302", "candidat", "Null Island");

        expect(data).toBeDefined();
        userID = data.insertId;
    });

    test("read user", async () => {
        let data = await model.read("test@test.fr");
        expect(data.nom).toBe("TEST");
        expect(data.prenom).toBe("Test");
        expect(data.telephone).toBe("0605040302");
        expect(data.type).toBe("candidat");
    });

    test("read all users", async () => {
        let data = await model.readAll();
        expect(data).toBeInstanceOf(Array);

        for (let row of data) {
            expect(row.telephone).toMatch(/\d{10}/);
            expect(row.type).toMatch(/candidat|recruteur|administrateur/);
        };
    });

    test("update user", async () => {
        let data = await model.editUser("test@test.fr", "test2", "Testeur", "Testé", "0607080910", "Canada");
        expect(data).toBeDefined();
        
        data = await model.setType("test@test.fr", "recruteur");
        expect(data).toBeDefined();
    });

    test("delete user", async () => {
        let data = await model.deleteUser("test@test.fr");
        expect(data).toBeDefined();
        userID = null;
    });
})