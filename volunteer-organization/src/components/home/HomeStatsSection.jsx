// Adds the governorates count alongside the backend stats.

import { Users, Building2, Heart, MapPin } from "lucide-react";
import StatsGrid from "../about/StatsGrid";
import { SYRIAN_GOVERNORATES_COUNT } from "../../services/syrianGovernorates";

export default function HomeStatsSection({ stats, loading }) {
  if (!loading && !stats) return null;

  const statsArray = stats
    ? [
        { number: stats.volunteersCount, label: "Active Volunteers", icon: Users },
        { number: stats.organizationsCount, label: "Organizations", icon: Building2 },
        { number: stats.opportunitiesCount, label: "Opportunities", icon: Heart },
        {
          number: SYRIAN_GOVERNORATES_COUNT,
          label: "Governorates Covered",
          icon: MapPin,
          suffix: "",
        }
      ]
    : [];

  return <StatsGrid stats={statsArray} loading={loading} className="mb-0" />;
}