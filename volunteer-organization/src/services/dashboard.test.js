import { describe, it, expect, vi, beforeEach } from "vitest";
import { PARTICIPATION_STATUS } from "../constants/participationStatus";
import { OPPORTUNITY_STATUS } from "../constants/opportunityStatus";

vi.mock("./opportunities", () => ({ fetchMyOpportunities: vi.fn() }));
vi.mock("./participations", () => ({ fetchApplicantsForOpportunity: vi.fn() }));

import { fetchMyOpportunities } from "./opportunities";
import { fetchApplicantsForOpportunity } from "./participations";
import { fetchOrganizationDashboard } from "./dashboard";

function applicant(id, status, participatedAt) {
  return {
    id,
    status,
    participatedAt,
    committedHours: 3,
    volunteer: { name: `Volunteer ${id}` },
  };
}

describe("fetchOrganizationDashboard — recentActivity", () => {
  beforeEach(() => {
    fetchMyOpportunities.mockReset();
    fetchApplicantsForOpportunity.mockReset();
  });

  it("يقتصر على الطلبات المعلقة، ويرتبها حسب الأحدث، وبحد أقصى 5 عناصر", async () => {
    fetchMyOpportunities.mockResolvedValue([
      {
        id: "o1",
        title: "Beach Cleanup",
        status: OPPORTUNITY_STATUS.REGISTRATION_OPEN,
        currentVolunteers: 2,
        maxVolunteers: 10,
      },
      {
        id: "o2",
        title: "Food Drive",
        status: OPPORTUNITY_STATUS.COMPLETED,
        currentVolunteers: 5,
        maxVolunteers: 5,
      },
    ]);

    fetchApplicantsForOpportunity.mockImplementation((opportunityId) => {
      if (opportunityId === "o1") {
        return Promise.resolve([
          applicant("p1", PARTICIPATION_STATUS.PENDING, "2026-01-05"),
          // طلب مقبول، لذلك لا يدخل ضمن النشاطات الأخيرة.
          applicant("p2", PARTICIPATION_STATUS.ACCEPTED, "2026-01-06"),
          applicant("p3", PARTICIPATION_STATUS.PENDING, "2026-01-10"),
        ]);
      }

      return Promise.resolve([
        applicant("p4", PARTICIPATION_STATUS.PENDING, "2026-01-08"),
        // طلب مرفوض، لذلك لا يدخل ضمن النشاطات الأخيرة.
        applicant("p5", PARTICIPATION_STATUS.REJECTED, "2026-01-09"),
        applicant("p6", PARTICIPATION_STATUS.PENDING, "2026-01-01"),
        applicant("p7", PARTICIPATION_STATUS.PENDING, "2026-01-12"),
        applicant("p8", PARTICIPATION_STATUS.PENDING, "2026-01-11"),
      ]);
    });

    const dashboard = await fetchOrganizationDashboard("org-1");

    expect(dashboard.recentActivity).toHaveLength(5);
    expect(
      dashboard.recentActivity.every(
        (item) => item.status === PARTICIPATION_STATUS.PENDING,
      ),
    ).toBe(true);
    expect(dashboard.recentActivity.map((item) => item.id)).toEqual([
      "p7",
      "p8",
      "p3",
      "p4",
      "p1",
    ]);
  });

  it("يرجع recentActivity فارغة عند عدم وجود طلبات معلقة", async () => {
    fetchMyOpportunities.mockResolvedValue([
      {
        id: "o1",
        title: "Beach Cleanup",
        status: OPPORTUNITY_STATUS.REGISTRATION_OPEN,
        currentVolunteers: 1,
        maxVolunteers: 5,
      },
    ]);

    fetchApplicantsForOpportunity.mockResolvedValue([
      applicant("p1", PARTICIPATION_STATUS.ACCEPTED, "2026-01-01"),
      applicant("p2", PARTICIPATION_STATUS.REJECTED, "2026-01-02"),
    ]);

    const dashboard = await fetchOrganizationDashboard("org-1");

    expect(dashboard.recentActivity).toEqual([]);
  });

  it("يرجع القيم الافتراضية عند عدم وجود فرص للمنظمة", async () => {
    fetchMyOpportunities.mockResolvedValue([]);

    const dashboard = await fetchOrganizationDashboard("org-1");

    expect(dashboard.totalOpportunities).toBe(0);
    expect(dashboard.recentActivity).toEqual([]);
    expect(fetchApplicantsForOpportunity).not.toHaveBeenCalled();
  });
});
