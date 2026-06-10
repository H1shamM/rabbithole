import { render, screen, fireEvent } from "../test-utils";
import { describe, it, expect } from "vitest";
import App from "../App";

describe("Skip Link", () => {
  it("should be the first focusable element in the document", () => {
    // Use custom render to include ToastProvider etc.
    render(<App />);

    const skipLink = screen.getByText("Skip to main content");
    
    // Check if it's the first focusable element in the document
    document.body.focus();
    fireEvent.keyDown(document.body, { key: "Tab", code: "Tab" });

    expect(document.activeElement).toBe(skipLink);
  });
});
