const request = require("supertest");
const app = require("../app");

describe("Test the api path", () => {
    it("should get the users", async () => {
        let response = await request(app).get("/api/users/");

        expect(response.status).toBe(200);
        expect(response.body).toBeInstanceOf(Array);
    });
});
