/**
 * @fileoverview Coverage tests for App component.
 */

import { render, screen, fireEvent, waitFor, cleanup } from "../test-utils";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import App from "../App";

/**
 * Mock localStorage for testing.
 */
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    clear: () => {
      store = {};
    },
  };
})();
Object.defineProperty(window, "localStorage", { value: localStorageMock });

/**
 * Helper to setup default fetch mocks.
 */
const setupFetchMocks = () => {
  window.fetch = vi.fn().mockImplementation((url) => {
    const defaultResponse = {
      ok: true,
      status: 200,
      json: async () => ({}),
      text: async () => "{}",
    };
    if (url.includes("/auth/register") || url.includes("/auth/login")) {
      return Promise.resolve({
        ...defaultResponse,
        json: async () => ({
          token: "test-token",
          user: {
            id: "dev-user",
            email: "dev@stumble.local",
            display_name: "Dev User",
          },
        }),
      });
    }
    if (
      url.includes("/favorites") ||
      url.includes("/history") ||
      url.includes("/recommendations") ||
      url.includes("/stumble")
    ) {
      return Promise.resolve({
        ...defaultResponse,
        json: async () => [],
        text: async () => "[]",
      });
    }
    return Promise.resolve(defaultResponse);
  });
};

describe("App Component Coverage", () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem("token", "test-token");
    vi.clearAllMocks();
    setupFetchMocks();
  });

  afterEach(() => {
    cleanup();
  });

  // TODO: Add test for network failure during initial mount fetches

  it("handles API errors", async () => {
    window.fetch = vi.fn().mockImplementation((url) => {
      if (
        url.includes("/favorites") ||
        url.includes("/history") ||
        url.includes("/recommendations")
      ) {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: async () => [],
          text: async () => "[]",
        });
      }
      return Promise.resolve({
        ok: false,
        status: 404,
        statusText: "Not Found",
        text: async () => "Not Found",
      });
    });

    render(<App />);
    fireEvent.click(screen.getByRole("button", { name: /🎲 Stumble/i }));

    await waitFor(() =>
      expect(screen.getByText(/Failed to fetch/i)).toBeInTheDocument(),
    );
    fireEvent.click(screen.getByRole("button", { name: /Try Again/i }));
    expect(window.fetch).toHaveBeenCalled();
  });

  it("removes favorites", async () => {
    let favoritesList = [{ id: "1", url: "https://test.com", title: "Test" }];
    window.fetch = vi.fn().mockImplementation((url, options) => {
      const defaultRes = {
        ok: true,
        status: 200,
        text: async () => "[]",
        json: async () => [],
      };
      if (url.includes("/favorites")) {
        if (options?.method === "DELETE") {
          favoritesList = [];
          return Promise.resolve({ ...defaultRes, text: async () => "" });
        }
        return Promise.resolve({
          ...defaultRes,
          json: async () => favoritesList,
          text: async () => JSON.stringify(favoritesList),
        });
      }
      if (
        url.includes("/auth/register") ||
        url.includes("/auth/login") ||
        url.includes("/auth/me")
      ) {
        const data = {
          token: "test-token",
          user: {
            id: "dev-user",
            email: "dev@stumble.local",
            display_name: "Dev User",
          },
        };
        return Promise.resolve({
          ...defaultRes,
          json: async () => data,
          text: async () => JSON.stringify(data),
        });
      }
      return Promise.resolve(defaultRes);
    });

    render(<App />);

    // Toggle to open favorites
    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: /Favorites/i }),
      ).toBeInTheDocument(),
    );
    fireEvent.click(screen.getByRole("button", { name: /Favorites/i }));

    // Find and click remove button
    const removeBtn = await screen.findByLabelText("Remove from favorites");
    fireEvent.click(removeBtn);

    await waitFor(() =>
      expect(screen.getByText(/No favorites yet/i)).toBeInTheDocument(),
    );
  });

  it("stumbles with random category", async () => {
    window.fetch = vi.fn().mockImplementation((url) => {
      if (url.includes("/stumble")) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            id: "456",
            url: "https://wikipedia.org/wiki/Random",
            title: "Random",
            category: "random",
          }),
          text: async () =>
            JSON.stringify({
              id: "456",
              url: "https://wikipedia.org/wiki/Random",
              title: "Random",
              category: "random",
            }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: async () => [],
        text: async () => "[]",
        text: async () => "[]",
      });
    });

    render(<App />);
    const select = screen.getByLabelText(/Filter by:/i);
    fireEvent.change(select, { target: { value: "random" } });
    fireEvent.click(screen.getByRole("button", { name: /Stumble/i }));

    await waitFor(() =>
      expect(screen.getByTitle(/Stumbled page/i)).toBeInTheDocument(),
    );
  });

  it("shows empty state message in history", () => {
    render(<App />);
    fireEvent.click(screen.getByRole("button", { name: /View History/i }));
    expect(screen.getByText(/No history yet/i)).toBeInTheDocument();
  });

  it("filters by category tech", async () => {
    window.fetch = vi.fn().mockImplementation((url) => {
      if (url.includes("/stumble")) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            id: "789",
            url: "https://dev.to/post",
            title: "Tech",
            category: "tech",
          }),
          text: async () =>
            JSON.stringify({
              id: "789",
              url: "https://dev.to/post",
              title: "Tech",
              category: "tech",
            }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: async () => [],
        text: async () => "[]",
      });
    });

    render(<App />);
    const select = screen.getByLabelText(/Filter by:/i);
    fireEvent.change(select, { target: { value: "tech" } });
    fireEvent.click(screen.getByRole("button", { name: /🎲 Stumble/i }));
    await waitFor(() =>
      expect(screen.getByTitle(/Stumbled page/i)).toBeInTheDocument(),
    );
  });
});
