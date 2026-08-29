
import { CARD_SURFACE } from "../../utils/surfaceStyles";

const STAT_COLOR_CLASSES = {
  neutral: "text-heading",
  gold: "text-amber-600",
  green: "text-success",
  red: "text-danger",
  primary: "text-primary",
};

export default function ApplicantsSummaryStats({
  total,
  pending,
  accepted,
  rejected,
  totalHoursLogged = 0,
}) {
  const stats = [
    { label: "Total Applicants", value: total, color: "neutral" },
    { label: "Pending", value: pending, color: "gold" },
    { label: "Accepted", value: accepted, color: "green" },
    { label: "Rejected", value: rejected, color: "red" },
    { label: "Hours Completed", value: totalHoursLogged, color: "primary" },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-8">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className={`${CARD_SURFACE} px-4 py-3 text-center sm:text-left`}
        >
          <p className={`text-2xl font-bold leading-none ${STAT_COLOR_CLASSES[stat.color]}`}>
            {stat.value}
          </p>
          <p className="text-xs text-body mt-1.5">{stat.label}</p>
        </div>
      ))}
    </div>
  );
}