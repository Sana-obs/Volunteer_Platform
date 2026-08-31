
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, it, expect, vi, beforeEach } from "vitest";

import useRecentUpdates from "./useRecentUpdates";
import { useShowMore } from "./useShowMore";
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

function makeItem(id) {
  return {
    id,
    type: "achievement",
    title: `Notification ${id}`,
    description: "",
    href: "/",
    // every fetch returns a brand-new onDismiss closure, exactly like the
    // real services/notifications builders do
    onDismiss: vi.fn(async () => {}),
  };
}

beforeEach(() => {
  fetchRecentNotifications.mockReset();
  fetchRecentNotifications.mockImplementation(async () => [
    makeItem("a"),
    makeItem("b"),
    makeItem("c"),
  ]);
});

// Mirrors what pages/notifications.jsx does: pipe useRecentUpdates().items
// straight into useShowMore, which compares item identity across renders and
// setStates during render when it changes. If useRecentUpdates hands back a
// fresh array of fresh objects every render, this loops forever
// ("Too many re-renders").
function NotificationsLikeConsumer() {
  const { items } = useRecentUpdates();
  const { visibleItems } = useShowMore(items);

  return <span data-testid="count">{visibleItems.length}</span>;
}

describe("useRecentUpdates — استقرار المرجع (regression: Too many re-renders)", () => {
  it("لا يسبب حلقة إعادة رندر لا نهائية عند تمريره لـ useShowMore", async () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <NotificationsLikeConsumer />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() =>
      expect(screen.getByTestId("count")).toHaveTextContent("3"),
    );

    // give the 5s poll / re-render settling a moment
    await new Promise((resolve) => setTimeout(resolve, 50));

    const tooManyRenders = errorSpy.mock.calls
      .flat()
      .some(
        (arg) =>
          typeof arg === "string" && arg.includes("Too many re-renders"),
      );

    expect(tooManyRenders).toBe(false);
    errorSpy.mockRestore();
  });
});
