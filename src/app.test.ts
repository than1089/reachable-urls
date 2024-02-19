import request from "supertest";

import app from "./app";

describe("Test app.ts", () => {
  test("Should return all reachable URLs", async () => {
    const res = await request(app).get("/reachable-url");
    expect(res.body).toEqual([{"url":"http://app.scnt.me","priority":3},{"url":"https://gitlab.com","priority":4},{"url":"https://github.com","priority":4}]);
  });

  test("Should filter by priority=1", async () => {
    const res = await request(app).get("/reachable-url?priority=1");
    expect(res.body).toEqual([]);
  });

  test("Should filter by priority=3", async () => {
    const res = await request(app).get("/reachable-url?priority=3");
    expect(res.body).toEqual([{"url":"http://app.scnt.me","priority":3}]);
  });
});