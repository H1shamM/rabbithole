import { describe, it, expect, vi, afterEach } from "vitest";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  cleanup,
} from "@testing-library/react";
import { StumbleArea } from "./StumbleArea";

afterEach(cleanup);

const current = {
  id: "1",
  url: "https://example.com/article",
  title: "Example",
  category: "tech",
  source: "Test",
};

const readerResult = {
  title: "Reader Title",
  byline: null,
  siteName: "Test Site",
  excerpt: null,
  content: "<p>Reader body</p>",
  textContent: "Reader body",
  length: 11,
};

function makeFetch(ok = true) {
  return vi
    .fn()
    .mockResolvedValue(
      ok
        ? { ok: true, json: async () => readerResult }
        : { ok: false, status: 422 },
    );
}

const baseProps = {
  showIframe: true,
  loading: false,
  error: null,
  current,
  iframeError: false,
  onRetry: vi.fn(),
  onClose: vi.fn(),
  onIframeLoad: vi.fn(),
};

describe("StumbleArea reader-first hybrid", () => {
  it("shows the reader view by default", async () => {
    render(<StumbleArea {...baseProps} authenticatedFetch={makeFetch()} />);
    await waitFor(() =>
      expect(screen.getByText("Reader body")).toBeInTheDocument(),
    );
    expect(screen.getByText("Reader Title")).toBeInTheDocument();
  });

  it("switches to the live iframe when Live is clicked", async () => {
    render(<StumbleArea {...baseProps} authenticatedFetch={makeFetch()} />);
    await waitFor(() =>
      expect(screen.getByText("Reader body")).toBeInTheDocument(),
    );
    fireEvent.click(screen.getByRole("button", { name: /live/i }));
    expect(screen.getByTitle("Stumbled page")).toBeInTheDocument();
  });

  it("falls back to the live view when reader extraction fails", async () => {
    render(
      <StumbleArea {...baseProps} authenticatedFetch={makeFetch(false)} />,
    );
    await waitFor(() =>
      expect(screen.getByTitle("Stumbled page")).toBeInTheDocument(),
    );
  });
});
