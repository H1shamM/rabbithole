import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { Sidebar } from "./Sidebar";

afterEach(cleanup);

describe("Sidebar", () => {
  const baseProps = {
    category: "all" as const,
    onCategoryChange: vi.fn(),
    isInstallable: false,
    onInstall: vi.fn(),
  };

  it("renders the brand and category nav", () => {
    render(<Sidebar {...baseProps} />);
    expect(screen.getByText("StumbleClone")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Discover" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Tech" })).toBeInTheDocument();
  });

  it("marks the active category", () => {
    render(<Sidebar {...baseProps} category="tech" />);
    expect(screen.getByRole("button", { name: "Tech" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(
      screen.getByRole("button", { name: "Discover" }),
    ).not.toHaveAttribute("aria-current");
  });

  it("calls onCategoryChange when a category is clicked", () => {
    const onCategoryChange = vi.fn();
    render(<Sidebar {...baseProps} onCategoryChange={onCategoryChange} />);
    fireEvent.click(screen.getByRole("button", { name: "Science" }));
    expect(onCategoryChange).toHaveBeenCalledWith("science");
  });

  it("shows the install button only when installable", () => {
    const { rerender } = render(
      <Sidebar {...baseProps} isInstallable={false} />,
    );
    expect(
      screen.queryByRole("button", { name: /install app/i }),
    ).not.toBeInTheDocument();

    rerender(<Sidebar {...baseProps} isInstallable={true} />);
    expect(
      screen.getByRole("button", { name: /install app/i }),
    ).toBeInTheDocument();
  });

  it("invokes onInstall when the install button is clicked", () => {
    const onInstall = vi.fn();
    render(<Sidebar {...baseProps} isInstallable onInstall={onInstall} />);
    fireEvent.click(screen.getByRole("button", { name: /install app/i }));
    expect(onInstall).toHaveBeenCalledOnce();
  });
});
