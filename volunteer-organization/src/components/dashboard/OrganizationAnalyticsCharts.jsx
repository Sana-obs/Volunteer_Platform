import { motion } from "framer-motion"
import { BarChart3, CalendarDays } from "lucide-react"

import Typography from "../ui/Typography"
import { PANEL_SURFACE } from "../../utils/surfaceStyles"

const METRIC_STYLES = {
  opportunitiesCreated: {
    label: "Opportunities created",
    dotClassName: "bg-primary",
    barClassName: "bg-primary",
  },
  applicationsReceived: {
    label: "Applications received",
    dotClassName: "bg-secondary",
    barClassName: "bg-secondary",
  },

  acceptedVolunteers: {
    label: "Accepted volunteers",
    dotClassName: "bg-success",
    barClassName: "bg-success",
  },
  totalVolunteerHours: {
    label: "Total volunteer hours",
    dotClassName: "bg-amber-500",
    barClassName: "bg-amber-500",
  },
}

function formatCompactNumber(value) {
  if (value >= 1000) return `${Math.round(value / 100) / 10}k`
  return String(value)
}

function AnalyticsLegend({ metrics }) {
  return (
    <div className="flex flex-wrap gap-2">
      {metrics.map((metric) => (
        <span
          key={metric.key}
          className="inline-flex items-center gap-2 rounded-full border border-heading/10 bg-bg px-3 py-1 text-xs font-medium text-body"
        >
          <span className={`h-2.5 w-2.5 rounded-full ${METRIC_STYLES[metric.key].dotClassName}`} />
          {METRIC_STYLES[metric.key].label}
        </span>
      ))}
    </div>
  )
}

function TrendChartCard({ title, description, icon: Icon, periodLabel, metrics, data }) {
  const maxValue = Math.max(
    1,
    ...data.flatMap((point) => metrics.map((metric) => Number(point[metric.key]) || 0)),
  )

  return (
    <div className="rounded-2xl border border-heading/10 bg-bg/70 p-4 md:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Icon size={18} aria-hidden="true" />
            </span>
            <Typography variant="h5">{title}</Typography>
          </div>
          <Typography variant="bodySm" className="mt-2 text-body">
            {description}
          </Typography>
        </div>

        <span className="rounded-full border border-heading/10 bg-bg px-3 py-1 text-xs font-medium text-body">
          {periodLabel}
        </span>
      </div>

      <div className="mt-4">
        <AnalyticsLegend metrics={metrics} />
      </div>

      {data.length === 0 ? (
        <div className="mt-6 flex min-h-64 items-center justify-center rounded-2xl border border-dashed border-heading/10 bg-bg/50 px-6 text-center">
          <Typography variant="bodySm" className="text-body">
            No analytics data is available yet for this range.
          </Typography>
        </div>
      ) : (
        <div className="mt-6 overflow-x-auto pb-1">
          <div
            className="grid min-w-[640px] gap-3"
            style={{ gridTemplateColumns: `repeat(${data.length}, minmax(88px, 1fr))` }}
          >
            {data.map((point) => (
              <div key={point.label} className="flex flex-col gap-2">
                <div className="grid h-64 grid-cols-4 items-end gap-2 rounded-2xl border border-heading/10 bg-bg/80 px-3 py-3">
                  {metrics.map((metric) => {
                    const value = Number(point[metric.key]) || 0
                    const heightPercent = value === 0 ? 7 : Math.max(7, (value / maxValue) * 100)

                    return (
                      <div key={metric.key} className="flex h-full flex-col items-center justify-end gap-2">
                        <Typography variant="caption" color="muted" className="min-h-4 text-center leading-none">
                          {formatCompactNumber(value)}
                        </Typography>

                        <div className="flex h-full w-full items-end">
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: `${heightPercent}%` }}
                            transition={{ duration: 0.7, ease: "easeOut" }}
                            className={`w-full rounded-full ${METRIC_STYLES[metric.key].barClassName}`}
                            title={`${METRIC_STYLES[metric.key].label}: ${value}`}
                            aria-label={`${METRIC_STYLES[metric.key].label} ${value}`}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>

                <Typography variant="caption" color="muted" className="text-center">
                  {point.label}
                </Typography>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default function OrganizationAnalyticsCharts({ analyticsTrends }) {
  const metrics = analyticsTrends?.metrics || []
  const weekly = analyticsTrends?.weekly || []
  const monthly = analyticsTrends?.monthly || []

  return (
    <section className={`${PANEL_SURFACE} p-6 md:p-8`}>
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <BarChart3 size={20} aria-hidden="true" />
          </span>
          <Typography variant="h4">Activity trends</Typography>
        </div>
        <Typography variant="bodySm" className="max-w-3xl text-body">
          Weekly and monthly analytics based on your organization&apos;s existing opportunities and applicant records.
        </Typography>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-2">
        <TrendChartCard
          title="Weekly activity"
          description="Track short-term changes in publishing, applications, approvals, and hours across the latest 7 days."
          icon={CalendarDays}
          periodLabel="Last 7 days"
          metrics={metrics}
          data={weekly}
        />

        <TrendChartCard
          title="Monthly activity"
          description="Compare the same four signals across the latest 6 months to spot longer trends."
          icon={CalendarDays}
          periodLabel="Last 6 months"
          metrics={metrics}
          data={monthly}
        />
      </div>
    </section>
  )
}
