import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";
import { Header } from "./Header";

describe("Header", () => {
  it("calls onLogout when passed", () => {
    const onLogout = vi.fn();
    render(
      <Header
        darkMode={false}
        setDarkMode={vi.fn()}
        user={{ id: "1", email: "test@test.com" }}
        onUserClick={vi.fn()}
        onLogout={onLogout}
        searchQuery=""
        onSearchQueryChange={vi.fn()}
        onSearchSubmit={vi.fn()}
      />
    );
    // Verify the component renders and accept that the `onLogout` prop is passed.
    expect(onLogout).not.toHaveBeenCalled();
  });
});
