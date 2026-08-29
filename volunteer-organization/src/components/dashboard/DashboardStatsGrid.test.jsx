// "Total Hours" card must read data.totalHours (the key services/dashboard.js actually returns).
import { render, screen } from "@testing-library/react";
import { describe, it, expect, beforeAll, vi } from "vitest";
import DashboardStatsGrid from "./DashboardStatsGrid";

// useCountUp queries matchMedia, which jsdom doesn't define.
beforeAll(() => {
  window.matchMedia = vi.fn().mockReturnValue({
    matches: true,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  });
});

const baseData = {
  totalVolunteers: 12,
  totalOpportunities: 3,
  completionRate: 40,
  totalHours: 17,
};

describe("DashboardStatsGrid", () => {
  it("يعرض إجمالي الساعات من data.totalHours", () => {
    render(<DashboardStatsGrid data={baseData} />);

    const card = screen.getByText("Total Hours").closest("div");
    expect(card).toHaveTextContent("17");
  });

  it("يعرض 0 فقط عندما تكون القيمة الفعلية 0", () => {
    render(<DashboardStatsGrid data={{ ...baseData, totalHours: 0 }} />);

    const card = screen.getByText("Total Hours").closest("div");
    expect(card).toHaveTextContent("0");
  });
});
