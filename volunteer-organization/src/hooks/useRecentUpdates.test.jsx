
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, it, expect, vi, beforeEach } from "vitest";

import useRecentUpdates from "./useRecentUpdates";
import { ACCOUNT_TYPES } from "../constants/auth/accountTypes";


vi.mock("./useAuth", () => ({
  useAuth: () => ({
    user: {},
    isAuthenticated: true,
    accountType: ACCOUNT_TYPES.VOLUNTEER,
  }),
}));

const { fetchRecentNotifications } = vi.hoisted(() => ({
  fetchRecentNotifications: vi.fn(),
}));

vi.mock("../services/notifications", () => ({ fetchRecentNotifications }));

let serverItems;

function makeItem(id) {
  return {
    id,
    type: "achievement",
    title: `Notification ${id}`,
    description: "",
    href: "/",
    // mirror a server-side dismiss so later refetches match the optimistic removal
    onDismiss: vi.fn(async () => {
      serverItems = serverItems.filter((item) => item.id !== id);
    }),
  };
}

beforeEach(() => {
  serverItems = [makeItem("a"), makeItem("b")];
  fetchRecentNotifications.mockReset();
  fetchRecentNotifications.mockImplementation(async () => serverItems);
});

// Minimal hook consumer standing in for the navbar / admin bar / notifications page.
function Consumer({ label }) {
  const { items, hasUnseen, hasError } = useRecentUpdates();

  return (
    <div>
      <span data-testid={`${label}-count`}>{items.length}</span>
      <span data-testid={`${label}-unseen`}>{String(hasUnseen)}</span>
      <span data-testid={`${label}-error`}>{String(hasError)}</span>
      {items[0] && (
        <button
          type="button"
          onClick={() => items[0].onDismiss()}
          data-testid={`${label}-dismiss-first`}
        >
          dismiss
        </button>
      )}
    </div>
  );
}

function renderTwoViews() {
  // one QueryClient for both consumers, as in the real app
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <Consumer label="navbar" />
        <Consumer label="page" />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe("useRecentUpdates — تزامن فوري بين الاستخدامات", () => {
  it("تعليم إشعار كمقروء بمستهلِك واحد يُحدّث العدّاد عند المستهلِك الآخر فورًا", async () => {
    renderTwoViews();

    await waitFor(() => {
      expect(screen.getByTestId("navbar-count")).toHaveTextContent("2");
      expect(screen.getByTestId("page-count")).toHaveTextContent("2");
    });

    await userEvent.setup().click(screen.getByTestId("page-dismiss-first"));

    // navbar drops immediately via shared cache, not after the poll
    await waitFor(
      () => expect(screen.getByTestId("navbar-count")).toHaveTextContent("1"),
      { timeout: 1000 },
    );
    expect(screen.getByTestId("page-count")).toHaveTextContent("1");
    expect(screen.getByTestId("navbar-unseen")).toHaveTextContent("true");
  });

  it("جلب واحد فقط مشترك بين المستهلِكين لنفس الـ queryKey", async () => {
    renderTwoViews();

    await waitFor(() =>
      expect(screen.getByTestId("navbar-count")).toHaveTextContent("2"),
    );

    // two consumers, one source call (deduped by queryKey)
    expect(fetchRecentNotifications).toHaveBeenCalledTimes(1);
  });

  it("hasError يُعلَّم عند فشل الجلب", async () => {
    fetchRecentNotifications.mockRejectedValue(new Error("network"));
    renderTwoViews();

    await waitFor(() => {
      expect(screen.getByTestId("navbar-error")).toHaveTextContent("true");
      expect(screen.getByTestId("page-error")).toHaveTextContent("true");
    });
  });
});
