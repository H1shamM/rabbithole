import { describe, it, expect, vi } from "vitest";
import { Request, Response } from "express";
import { ExplainerController } from "../../../app/src/controllers/explainerController.js";
import { NotArticleError } from "../../../app/src/services/explainerService.js";

describe("ExplainerController", () => {
  it("returns 200 with result on success", async () => {
    const mockService = {
      explain: vi.fn().mockResolvedValue({ summary: "Test summary" }),
    };
    const controller = new ExplainerController(mockService as any);
    const req = { query: { url: "http://test.com" } } as unknown as Request;
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as unknown as Response;
    const next = vi.fn();

    await controller.explain(req, res, next);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ summary: "Test summary" });
  });

  it("returns 422 for NotArticleError", async () => {
    const mockService = {
      explain: vi.fn().mockRejectedValue(new NotArticleError("http://test.com")),
    };
    const controller = new ExplainerController(mockService as any);
    const req = { query: { url: "http://test.com" } } as unknown as Request;
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as unknown as Response;
    const next = vi.fn();

    await controller.explain(req, res, next);

    expect(res.status).toHaveBeenCalledWith(422);
    expect(res.json).toHaveBeenCalledWith({ error: expect.any(String), statusCode: 422 });
  });

  it("calls next(error) for other errors", async () => {
    const mockService = {
      explain: vi.fn().mockRejectedValue(new Error("Unknown")),
    };
    const controller = new ExplainerController(mockService as any);
    const req = { query: { url: "http://test.com" } } as unknown as Request;
    const res = {} as Response;
    const next = vi.fn();

    await controller.explain(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(Error));
  });
});
