
import { Users, Heart, TrendingUp, Clock3 } from "lucide-react";
import StatCard from "../common/StatCard";

export default function DashboardStatsGrid({ data }) {
  const stats = [
    {
      number: data.totalVolunteers,
      label: "Total Volunteers",
      icon: Users,
    },
    {
      number: data.totalOpportunities,
      label: "Published Opportunities",
      icon: Heart,
    },
    {
      number: data.completionRate,
      label: "Completion Rate",
      suffix: "%",
      icon: TrendingUp,
    },
    {
      number: data.totalHours,
      label: "Total Hours",
      icon: Clock3,
      hint: "Total hours the organization has logged for accepted volunteers across all its opportunities.",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mb-8">
      {stats.map((stat) => (
        <StatCard
          key={stat.label}
          number={stat.number}
          label={stat.label}
          suffix={stat.suffix}
          hint={stat.hint}
          icon={stat.icon}
        />
      ))}
    </div>
  );
}