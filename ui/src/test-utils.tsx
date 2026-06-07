/* eslint-disable react-refresh/only-export-components */
import { render as rtlRender } from "@testing-library/react";
import { ToastProvider } from "./contexts/ToastContext";
import { vi } from "vitest";
import React from "react";

export function render(ui: React.ReactElement, options = {}) {
  return rtlRender(<ToastProvider>{ui}</ToastProvider>, options);
}

export function setupFetchMocks() {
  window.fetch = vi.fn().mockImplementation((url) => {
    const defaultResponse = {
      ok: true,
      status: 200,
      statusText: "OK",
      json: async () => ({}),
      text: async () => "{}",
    };

    if (url.includes("/auth/register") || url.includes("/auth/login")) {
      const data = {
        token: "test-token",
        user: {
          id: "dev-user",
          email: "dev@stumble.local",
          display_name: "Dev User",
        },
      };
      return Promise.resolve({
        ...defaultResponse,
        json: async () => data,
        text: async () => JSON.stringify(data),
      });
    }
    if (url.includes("/auth/me")) {
      const data = {
        id: "dev-user",
        email: "dev@stumble.local",
        display_name: "Dev User",
      };
      return Promise.resolve({
        ...defaultResponse,
        json: async () => data,
        text: async () => JSON.stringify(data),
      });
    }
    if (
      url.includes("/favorites") ||
      url.includes("/history") ||
      url.includes("/recommendations")
    ) {
      return Promise.resolve({
        ...defaultResponse,
        json: async () => [],
        text: async () => "[]",
      });
    }
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
    return Promise.resolve(defaultResponse);
  });
}

export * from "@testing-library/react";
