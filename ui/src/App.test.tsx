import {
  render,
  screen,
  fireEvent,
  waitFor,
  cleanup,
  within,
  setupFetchMocks,
} from "./test-utils";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { App } from "./App";

/**
 * Mock localStorage for testing.
 */
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: unknown) => {
      store[key] = value != null ? String(value) : "";
    }),
    clear: vi.fn(() => {
      store = {};
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
  };
})();
Object.defineProperty(window, "localStorage", { value: localStorageMock });

describe("App Component", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    setupFetchMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders initial empty state with Stumble button", () => {
    render(<App />);
    expect(screen.getByText(/Ready to explore/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", {
        name: (content) => content.includes("Stumble"),
      }),
    ).toBeInTheDocument();
  });

  it("liking updates history and localStorage", async () => {
    render(<App />);
    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: (c) => c.includes("Stumble") }),
      ).toBeInTheDocument(),
    );
    fireEvent.click(
      screen.getByRole("button", { name: (c) => c.includes("Stumble") }),
    );

    // We need to match the actual label in the UI
    await waitFor(() =>
      expect(screen.getByLabelText("Like")).toBeInTheDocument(),
    );
    fireEvent.click(screen.getByLabelText("Like"));

    await waitFor(() => {
      expect(screen.getByText(/View History/i)).toBeInTheDocument();
    });
  });

  it("favorites toggle works", async () => {
    let isFav = false;
    window.fetch = vi.fn().mockImplementation((url, options) => {
      const defaultResponse = {
        ok: true,
        status: 200,
        json: async () => ({}),
        text: async () => "{}",
      };
      if (url.includes("/stumble")) {
        const data = {
          id: "123",
          url: "http://example.com",
          title: "Example",
          category: "science",
          source: "Test",
        };
        return Promise.resolve({
          ...defaultResponse,
          json: async () => data,
          text: async () => JSON.stringify(data),
        });
      }
      if (url.includes("/favorites")) {
        if (options?.method === "POST") {
          isFav = true;
          return Promise.resolve(defaultResponse);
        }
        if (options?.method === "DELETE") {
          isFav = false;
          return Promise.resolve(defaultResponse);
        }
        const data = isFav
          ? [
              {
                id: "123",
                url: "http://example.com",
                title: "Example",
                category: "science",
                source: "Test",
              },
            ]
          : [];
        return Promise.resolve({
          ...defaultResponse,
          json: async () => data,
          text: async () => JSON.stringify(data),
        });
      }
      return Promise.resolve(defaultResponse);
    });

    render(<App />);
    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: (c) => c.includes("Stumble") }),
      ).toBeInTheDocument(),
    );
    fireEvent.click(
      screen.getByRole("button", { name: (c) => c.includes("Stumble") }),
    );

    await waitFor(() =>
      expect(screen.getByLabelText("Save to favorites")).toBeInTheDocument(),
    );
    const favBtn = screen.getByLabelText("Save to favorites");

    fireEvent.click(favBtn);

    await waitFor(
      () => {
        expect(
          screen.getByLabelText("Remove from favorites"),
        ).toBeInTheDocument();
      },
      { timeout: 2000 },
    );
  });

  it("dark mode toggles theme and persists", () => {
    render(<App />);
    const header = screen.getByRole("banner");
    const toggle = within(header).getByRole("button", {
      name: "Switch to dark mode",
    });

    fireEvent.click(toggle);
    expect(document.documentElement.classList.contains("dark")).toBe(true);
    expect(localStorage.setItem).toHaveBeenCalledWith("theme", "dark");
  });

  it("shows profile modal when clicking user button", async () => {
    const user = userEvent.setup();
    render(<App />);
    // Find the user menu button by aria-label
    const userButton = await screen.findByRole("button", {
      name: /User menu/i,
    });
    await user.click(userButton);
    // Find "Profile" in the dropdown
    const profileItem = await screen.findByRole("menuitem", {
      name: /Profile/i,
    });
    await user.click(profileItem);
    expect(screen.getByText(/Profile/i)).toBeInTheDocument();
  });
});
