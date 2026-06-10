import { describe, it, expect, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { ExplainerReel } from "./ExplainerReel";
import type { ExplainerScene } from "../hooks/useEnrichment";

afterEach(cleanup);

const scenes: ExplainerScene[] = [
  { heading: "The big idea", body: "Here is the gist.", emoji: "💡" },
  { heading: "Why it matters", body: "Because reasons.", emoji: "⭐" },
  { heading: "The takeaway", body: "Go forth.", emoji: "🚀" },
];

const baseProps = {
  scenes,
  heroImage: null,
  provenance: "AI summary of example.com",
  sourceUrl: "https://example.com/article",
};

describe("ExplainerReel", () => {
  it("renders the first scene, counter, provenance and original link", () => {
    render(<ExplainerReel {...baseProps} />);
    expect(screen.getByText("The big idea")).toBeInTheDocument();
    expect(screen.getByText("Here is the gist.")).toBeInTheDocument();
    expect(screen.getByText("1 / 3")).toBeInTheDocument();
    expect(screen.getByText("AI summary of example.com")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /read the original/i }),
    ).toHaveAttribute("href", "https://example.com/article");
  });

  it("advances to the next scene with the Next button", () => {
    render(<ExplainerReel {...baseProps} />);
    fireEvent.click(screen.getByRole("button", { name: /next slide/i }));
    expect(screen.getByText("Why it matters")).toBeInTheDocument();
    expect(screen.getByText("2 / 3")).toBeInTheDocument();
  });

  it("disables Previous on the first slide and Next on the last", () => {
    render(<ExplainerReel {...baseProps} />);
    expect(screen.getByRole("button", { name: /previous slide/i })).toBeDisabled();
    // Jump to the last slide via its dot.
    fireEvent.click(screen.getByRole("tab", { name: "Slide 3" }));
    expect(screen.getByText("The takeaway")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /next slide/i })).toBeDisabled();
  });

  it("jumps to a scene when its dot is clicked", () => {
    render(<ExplainerReel {...baseProps} />);
    fireEvent.click(screen.getByRole("tab", { name: "Slide 2" }));
    expect(screen.getByText("Why it matters")).toBeInTheDocument();
  });

  it("shows the hero image on the first slide when provided", () => {
    render(
      <ExplainerReel {...baseProps} heroImage="https://cdn.test/hero.png" />,
    );
    expect(screen.getByRole("img")).toHaveAttribute(
      "src",
      "https://cdn.test/hero.png",
    );
  });

  it("renders nothing when there are no scenes", () => {
    const { container } = render(<ExplainerReel {...baseProps} scenes={[]} />);
    expect(container).toBeEmptyDOMElement();
  });
});
