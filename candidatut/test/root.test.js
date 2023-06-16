const request = require("supertest");
const app = require("../app");

describe("Test the root path", () => {
    it("should response the GET method", async () => {
        let response = await request(app).get("/");

        expect(response.status).toBe(302);
        expect(response.headers.location).toBe("/home");
    });

    it("should login", async () => {
        let response = await request(app)
            .post("/home/login")
            .send({
                mail: "dark.vador@gmail.com",
                password: "JeSuisTonPère"
            });
            
        expect(response.status).toBe(302);
    });

    it("should fail login", async () => {
        let response = await request(app)
            .post("/home/login")
            .send({
                mail: "dark.vador@gmail.com",
                password: "JeSuistaMere"
            });

        expect(response.status).toBe(403);
    });
});
