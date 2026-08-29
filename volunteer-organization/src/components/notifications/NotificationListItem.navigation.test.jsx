// Clicking the notification body must navigate to item.href even though onDismiss/onNavigate
// side effects fire in the same click (dropdown close, mark-read, optimistic removal).
import { useState } from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createMemoryRouter, RouterProvider, Outlet } from "react-router-dom";
import { describe, it, expect, vi } from "vitest";
import NotificationBell from "../ui/NotificationBell";
import NotificationListItem from "./NotificationListItem";

function renderWithRouter(ui, { target = "TARGET PAGE" } = {}) {
  const router = createMemoryRouter(
    [
      {
        path: "/",
        element: (
          <div>
            {ui}
            <Outlet />
          </div>
        ),
        children: [
          { index: true, element: <span data-testid="route">HOME</span> },
          { path: "target", element: <span data-testid="route">{target}</span> },
        ],
      },
    ],
    { initialEntries: ["/"] },
  );
  render(<RouterProvider router={router} />);
  return router;
}

const baseItem = (overrides) => ({
  id: "1",
  type: "achievement",
  title: "New achievement",
  description: "desc",
  href: "/target",
  ...overrides,
});

describe("NotificationListItem navigation", () => {
  it("bell dropdown: clicking an item navigates to its href and still closes the dropdown + marks read", async () => {
    const markRead = vi.fn();
    function BellHost() {
      // mimic Navbar: closing the bell unmounts the dropdown (and the <Link>)
      const [open, setOpen] = useState(true);
      return (
        <>
          <span data-testid="bell-open">{String(open)}</span>
          <NotificationBell
            items={[baseItem({ onDismiss: markRead })]}
            isOpen={open}
            onToggle={() => setOpen((v) => !v)}
            onClose={() => setOpen(false)}
          />
        </>
      );
    }
    const router = renderWithRouter(<BellHost />);

    await userEvent.setup().click(screen.getByText("New achievement"));

    await waitFor(() => expect(router.state.location.pathname).toBe("/target"));
    expect(screen.getByTestId("route")).toHaveTextContent("TARGET PAGE");
    expect(markRead).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId("bell-open")).toHaveTextContent("false");
  });

  it("bell dropdown: navigation wins even if onDismiss synchronously removes the item (optimistic)", async () => {
    function BellHost() {
      const [open, setOpen] = useState(true);
      const [items, setItems] = useState(() => [
        baseItem({ onDismiss: () => setItems([]) }),
      ]);
      return (
        <NotificationBell
          items={items}
          isOpen={open}
          onToggle={() => setOpen((v) => !v)}
          onClose={() => setOpen(false)}
        />
      );
    }
    const router = renderWithRouter(<BellHost />);

    await userEvent.setup().click(screen.getByText("New achievement"));

    await waitFor(() => expect(router.state.location.pathname).toBe("/target"));
    expect(screen.getByTestId("route")).toHaveTextContent("TARGET PAGE");
  });

  it("full /notifications page usage (no onNavigate): still navigates to href", async () => {
    const markRead = vi.fn();
    // same shape as pages/notifications.jsx: onDismiss on the X button, showDismiss, no onNavigate
    const router = renderWithRouter(
      <NotificationListItem
        item={baseItem({ onDismiss: markRead })}
        onDismiss={vi.fn()}
        showDismiss
        truncateDescription={false}
      />,
    );

    await userEvent.setup().click(screen.getByText("New achievement"));

    await waitFor(() => expect(router.state.location.pathname).toBe("/target"));
    expect(screen.getByTestId("route")).toHaveTextContent("TARGET PAGE");
    expect(markRead).toHaveBeenCalledTimes(1);
  });

  it("the standalone X (dismiss) button does not navigate", async () => {
    const onDismiss = vi.fn();
    const router = renderWithRouter(
      <NotificationListItem item={baseItem()} onDismiss={onDismiss} showDismiss />,
    );

    await userEvent.setup().click(screen.getByRole("button", { name: /mark as read/i }));

    expect(onDismiss).toHaveBeenCalledTimes(1);
    expect(router.state.location.pathname).toBe("/");
  });
});
