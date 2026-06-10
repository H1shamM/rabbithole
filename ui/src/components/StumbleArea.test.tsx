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

const enrichmentResult = {
  summary: "AI explainer summary.",
  keyPoints: ["First point", "Second point"],
  image: null,
  provenance: "AI summary of example.com",
  sourceUrl: "https://example.com/article",
};

const previewResult = {
  title: "Preview Title",
  description: "A preview.",
  image: "https://cdn.test/card.png",
  siteName: "Test",
  favicon: null,
};

/**
 * Routes by endpoint so /reader, /reader/enrich and /preview can return their
 * own shapes. `enrichOk: false` simulates an unavailable explainer (422).
 */
function makeFetch({ enrichOk = true } = {}) {
  return vi.fn((url: string): Promise<Response> => {
    if (url.startsWith("/reader/enrich")) {
      return Promise.resolve(
        enrichOk
          ? ({ ok: true, json: async () => enrichmentResult } as Response)
          : ({ ok: false, status: 422 } as unknown as Response),
      );
    }
    if (url.startsWith("/reader")) {
      return Promise.resolve({
        ok: true,
        json: async () => readerResult,
      } as Response);
    }
    if (url.startsWith("/preview")) {
      return Promise.resolve({
        ok: true,
        json: async () => previewResult,
      } as Response);
    }
    return Promise.resolve({ ok: false, status: 404 } as unknown as Response);
  });
}

/** All endpoints fail — reader extraction can't produce a view. */
function makeFailingFetch() {
  return vi.fn().mockResolvedValue({ ok: false, status: 422 });
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
  it("shows the AI explainer by default for an article", async () => {
    render(<StumbleArea {...baseProps} authenticatedFetch={makeFetch()} />);
    await waitFor(() =>
      expect(screen.getByText("AI explainer summary.")).toBeInTheDocument(),
    );
    expect(screen.getByText("First point")).toBeInTheDocument();
  });

  it("toggles from the explainer to the original reader view", async () => {
    render(<StumbleArea {...baseProps} authenticatedFetch={makeFetch()} />);
    await waitFor(() =>
      expect(screen.getByText("AI explainer summary.")).toBeInTheDocument(),
    );
    fireEvent.click(screen.getByRole("button", { name: /original/i }));
    expect(screen.getByText("Reader body")).toBeInTheDocument();
    expect(screen.getByText("Reader Title")).toBeInTheDocument();
  });

  it("falls back to the plain reader (no toggle) when the explainer is unavailable", async () => {
    render(
      <StumbleArea
        {...baseProps}
        authenticatedFetch={makeFetch({ enrichOk: false })}
      />,
    );
    await waitFor(() =>
      expect(screen.getByText("Reader body")).toBeInTheDocument(),
    );
    // No explainer, and no enriched/original toggle when enrichment 422s.
    expect(screen.queryByText("AI explainer summary.")).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /explainer/i }),
    ).not.toBeInTheDocument();
  });

  it("switches to the live iframe when Live is clicked", async () => {
    render(<StumbleArea {...baseProps} authenticatedFetch={makeFetch()} />);
    await waitFor(() =>
      expect(screen.getByText("AI explainer summary.")).toBeInTheDocument(),
    );
    fireEvent.click(screen.getByRole("button", { name: /live/i }));
    expect(screen.getByTitle("Stumbled page")).toBeInTheDocument();
  });

  it("shows a fallback card (not a blank iframe) when reader extraction fails", async () => {
    render(
      <StumbleArea {...baseProps} authenticatedFetch={makeFailingFetch()} />,
    );
    await waitFor(() =>
      expect(screen.getByText(/generate a reader view/i)).toBeInTheDocument(),
    );
    // No blank iframe is shown automatically.
    expect(screen.queryByTitle("Stumbled page")).not.toBeInTheDocument();
    // Explicitly choosing the live page loads the iframe.
    fireEvent.click(screen.getByRole("button", { name: /show live page/i }));
    expect(screen.getByTitle("Stumbled page")).toBeInTheDocument();
  });

  it("defaults video stumbles to a thumbnail preview", async () => {
    const fetch = vi.fn();
    render(
      <StumbleArea
        {...baseProps}
        current={{
          ...current,
          type: "video",
          proxyUrl: "https://www.youtube.com/embed/abc123",
        }}
        authenticatedFetch={fetch}
      />,
    );
    // Should show thumbnail, not iframe
    expect(screen.getByAltText("Video thumbnail")).toBeInTheDocument();
    expect(screen.queryByTitle("Stumbled page")).not.toBeInTheDocument();

    // Clicking play should show iframe
    fireEvent.click(screen.getByRole("button", { name: /play video/i }));
    expect(screen.getByTitle("Stumbled page")).toBeInTheDocument();
  });

  it("renders a preview card (not an iframe or reader) for image stumbles", async () => {
    const fetch = makeFetch();
    render(
      <StumbleArea
        {...baseProps}
        current={{ ...current, type: "image" }}
        authenticatedFetch={fetch}
      />,
    );
    await waitFor(() =>
      expect(screen.getByText(/open the site/i)).toBeInTheDocument(),
    );
    // No embedded iframe for un-iframable content.
    expect(screen.queryByTitle("Stumbled page")).not.toBeInTheDocument();
    // It hit /preview, never /reader (or /reader/enrich).
    const calledUrls = fetch.mock.calls.map((c) => c[0] as string);
    expect(calledUrls.some((u) => u.startsWith("/preview"))).toBe(true);
    expect(calledUrls.some((u) => u.startsWith("/reader"))).toBe(false);
  });

  it("renders a preview card for interactive stumbles", async () => {
    const fetch = makeFetch();
    render(
      <StumbleArea
        {...baseProps}
        current={{ ...current, type: "interactive" }}
        authenticatedFetch={fetch}
      />,
    );
    await waitFor(() =>
      expect(screen.getByText(/open the site/i)).toBeInTheDocument(),
    );
    expect(screen.queryByTitle("Stumbled page")).not.toBeInTheDocument();
  });

  it("still defaults article stumbles to reader mode (explainer)", async () => {
    render(
      <StumbleArea
        {...baseProps}
        current={{ ...current, type: "article" }}
        authenticatedFetch={makeFetch()}
      />,
    );
    await waitFor(() =>
      expect(screen.getByText("AI explainer summary.")).toBeInTheDocument(),
    );
  });
});
