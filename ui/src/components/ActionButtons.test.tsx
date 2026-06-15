import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { ActionButtons } from "./ActionButtons";
import { ToastProvider } from "../contexts/ToastContext";

const current = {
  id: "1",
  url: "https://example.com",
  category: "tech",
  source: "Test",
};

const authenticatedFetch = vi.fn().mockResolvedValue({ ok: true } as Response);

const baseProps = {
  showIframe: true,
  current,
  loading: false,
  rating: null,
  rateLoading: false,
  isFavorite: false,
  authenticatedFetch,
  onRate: vi.fn(),
  onToggleFavorite: vi.fn(),
  onShare: vi.fn(),
  onNext: vi.fn(),
};

const renderWithToast = (ui: React.ReactElement) =>
  render(<ToastProvider>{ui}</ToastProvider>);

describe("ActionButtons", () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("calls report endpoint on report button click", async () => {
    renderWithToast(<ActionButtons {...baseProps} />);
    const reportButton = screen.getByRole("button", { name: /report/i });
    fireEvent.click(reportButton);

    expect(authenticatedFetch).toHaveBeenCalledWith(
      "/report",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ assetId: current.id }),
      }),
    );
  });
});
