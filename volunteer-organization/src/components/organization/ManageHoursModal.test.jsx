
import { render, screen } from "@testing-library/react";
import { describe, it, expect, beforeAll, vi } from "vitest";
import ManageHoursModal from "./ManageHoursModal";

beforeAll(() => {
  window.matchMedia = vi.fn().mockReturnValue({
    matches: false,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  });
});

function renderModal(props) {
  return render(
    <ManageHoursModal
      open
      onClose={() => {}}
      onConfirm={() => {}}
      volunteerName="Sara"
      isSubmitting={false}
      {...props}
    />,
  );
}

const hoursInput = () => screen.getByLabelText(/actual hours completed/i);

describe("ManageHoursModal", () => {
  it("يفتح معبّى برقم الالتزام لما ما في ساعات مؤكدة سابقًا", () => {
    renderModal({ committedHours: 4, currentHoursLogged: null });
    expect(hoursInput().value).toBe("4");
  });

  it("يفتح معبّى بالساعات المؤكدة سابقًا لما تكون موجودة", () => {
    renderModal({ committedHours: 4, currentHoursLogged: 7 });
    expect(hoursInput().value).toBe("7");
  });

  it("يعيد ضبط القيمة عند إعادة الفتح لمتقدّم آخر", () => {
    const { rerender } = renderModal({ committedHours: 4, currentHoursLogged: 7 });
    expect(hoursInput().value).toBe("7");

    // close then reopen on a different applicant (as the applicants page does)
    rerender(
      <ManageHoursModal
        open={false}
        onClose={() => {}}
        onConfirm={() => {}}
        volunteerName="Omar"
        committedHours={3}
        currentHoursLogged={null}
        isSubmitting={false}
      />,
    );
    rerender(
      <ManageHoursModal
        open
        onClose={() => {}}
        onConfirm={() => {}}
        volunteerName="Omar"
        committedHours={3}
        currentHoursLogged={null}
        isSubmitting={false}
      />,
    );

    expect(hoursInput().value).toBe("3");
  });
});
