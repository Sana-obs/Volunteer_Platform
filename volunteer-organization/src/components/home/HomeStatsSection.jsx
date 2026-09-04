// Adds the governorates count alongside the backend stats.

import { motion } from "framer-motion";
import { Users, Building2, Heart, MapPin } from "lucide-react";
import { useCountUp } from "../../hooks/useCountUp";
import Skeleton from "../ui/Skeleton";
import { SYRIAN_GOVERNORATES_COUNT } from "../../services/syrianGovernorates";

const STATS_BACKGROUND_IMAGE_URL =
  "https://images.unsplash.com/photo-1559027615-cd4628902d4a?auto=format&fit=crop&w=2000&q=80";

function StatItem({ number, label, icon: Icon, suffix = "+" }) {
  const { displayValue, elementRef } = useCountUp(number);

  return (
    <div
      ref={elementRef}
      className="flex flex-col items-center gap-3 text-center"
    >
      {Icon && (
        <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/20 bg-white/15">
          <Icon size={20} className="text-primary" aria-hidden="true" />
        </div>
      )}

      <div className="text-3xl font-bold text-primary sm:text-4xl">
        {displayValue}
        {suffix}
      </div>

      <p className="text-sm font-medium leading-relaxed text-white/80">
        {label}
      </p>
    </div>
  );
}

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

  return (
    <section className="relative left-1/2 right-1/2 mx-[-50vw] w-screen">
      <div
        className="absolute inset-0 bg-black bg-cover bg-center lg:bg-fixed"
        style={{ backgroundImage: `url(${STATS_BACKGROUND_IMAGE_URL})` }}
        aria-hidden="true"
      />
      <div className="absolute inset-0 bg-black/65" aria-hidden="true" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="relative mx-auto grid max-w-7xl grid-cols-2 gap-x-6 gap-y-10 px-4 py-16 sm:px-6 sm:py-20 md:grid-cols-4 lg:px-8"
      >
        {loading
          ? Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="flex flex-col items-center gap-3"
              >
                <Skeleton dark className="h-11 w-11 rounded-xl" />
                <Skeleton dark className="h-9 w-16" />
                <Skeleton dark className="h-4 w-24" />
              </div>
            ))
          : statsArray.map((stat) => (
              <StatItem
                key={stat.label}
                number={stat.number}
                label={stat.label}
                icon={stat.icon}
                suffix={stat.suffix}
              />
            ))}
      </motion.div>
    </section>
  );
}
