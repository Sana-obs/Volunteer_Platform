
import { Users, Building2, Heart, MapPin } from "lucide-react";
import { usePlatformStatsQuery } from "../hooks/queries/usePlatformStatsQuery";
import { SYRIAN_GOVERNORATES_COUNT } from "../services/syrianGovernorates";
import MissionSection from "../components/about/MissionSection";
import SectionHeader from "../components/about/SectionHeader";
import StatsGrid from "../components/about/StatsGrid";
import ValuesGrid from "../components/about/ValuesGrid";
import VisionGoals from "../components/about/VisionGoals";
import GeometricDivider from "../components/common/GeometricDivider";
import Button from "../components/ui/Button";
import AuthAlert from "../components/auth/AuthAlert";

export default function About() {
  const statsQuery = usePlatformStatsQuery();
  const isLoading = statsQuery.isPending;
  const stats = statsQuery.data?.success ? statsQuery.data.data : null;
  const statsError = statsQuery.isError;
  const statsArray = stats
    ? [
        { number: stats.volunteersCount, label: "Active Volunteers", icon: Users },
        { number: stats.organizationsCount, label: "Organizations", icon: Building2 },
        { number: stats.opportunitiesCount, label: "Opportunities", icon: Heart },
        { number: SYRIAN_GOVERNORATES_COUNT, label: "Governorates Covered", icon: MapPin },
      ]
    : [];

  return (
    <div className="min-h-screen bg-canvas text-heading py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader />

        <GeometricDivider />

        <MissionSection />

        <GeometricDivider />

        {statsError ? (
          <div className="flex flex-col items-start gap-3">
            <div className="w-full max-w-xl">
              <AuthAlert variant="error">Failed to load platform statistics.</AuthAlert>
            </div>
            <Button variant="primary" size="small" onClick={() => statsQuery.refetch()}>
              Retry
            </Button>
          </div>
        ) : (
          <StatsGrid stats={statsArray} loading={isLoading} />
        )}

        <GeometricDivider />

        <ValuesGrid />

        <GeometricDivider />

        <VisionGoals />
      </div>
    </div>
  );
}