import { Lock, CheckCircle2, CalendarCheck2, Target } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import Typography from "../ui/Typography";
import Badge from "../common/Badge";
import { getAchievementStyle } from "../../utils/achievementStyles";
import { CARD_SURFACE, CARD_PADDING } from "../../utils/surfaceStyles";
import AchievementProgressBar from "./AchievementProgressBar";

function formatDate(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return dateString;
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function AchievementCard({ achievement, justUnlocked = false, onClick }) {
  const isUnlocked = Boolean(achievement.unlocked);
  const isClickable = isUnlocked && Boolean(onClick);
  const { icon: Icon, colorClasses } = getAchievementStyle(achievement.name);
  const prefersReducedMotion = useReducedMotion();
  const shouldCelebrate = isUnlocked && justUnlocked && !prefersReducedMotion;
  const showsProgress = !isUnlocked && achievement.progress && achievement.progress.target > 1;

  function handleKeyDown(event) {
    if (!isClickable) return;
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onClick();
    }
  }

  return (
    <motion.div
      initial={shouldCelebrate ? { scale: 0.85, opacity: 0 } : false}
      animate={shouldCelebrate ? { scale: 1, opacity: 1 } : false}
      transition={{ type: "spring", stiffness: 260, damping: 18 }}
      onClick={isClickable ? onClick : undefined}
      onKeyDown={isClickable ? handleKeyDown : undefined}
      role={isClickable ? "button" : undefined}
      tabIndex={isClickable ? 0 : undefined}
      aria-label={isClickable ? `View ${achievement.name} celebration again` : undefined}
      className={[
        "relative flex flex-col gap-4 overflow-hidden",
        CARD_SURFACE,
        CARD_PADDING,
        isUnlocked
          ? "ring-1 ring-primary/15 transition-all duration-300"
          : "border-dashed transition-colors duration-300 hover:border-heading/20",
        isClickable ? "cursor-pointer hover:ring-2 hover:ring-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/50" : "",
        shouldCelebrate ? "animate-unlock-glow" : "",
      ].join(" ")}
    >
      {shouldCelebrate && (
        <motion.span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent"
          initial={{ x: "-120%" }}
          animate={{ x: "220%" }}
          transition={{ duration: 0.9, delay: 0.15, ease: "easeOut" }}
        />
      )}

      <div className="flex items-start justify-between gap-3">
        <div className="relative h-12 w-12 shrink-0">
          <motion.div
            initial={shouldCelebrate ? { scale: 0, rotate: -20 } : false}
            animate={shouldCelebrate ? { scale: 1, rotate: 0 } : false}
            transition={{ type: "spring", stiffness: 300, damping: 14, delay: 0.05 }}
            className={`flex h-12 w-12 items-center justify-center rounded-xl ${colorClasses} ${
              isUnlocked ? "" : "opacity-35 saturate-50"
            }`}
          >
            <Icon size={22} aria-hidden="true" />
          </motion.div>

          {!isUnlocked && (
            <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border border-heading/10 bg-field">
              <Lock size={11} className="text-heading/50" aria-hidden="true" />
            </span>
          )}
        </div>

        {isUnlocked ? (
          <Badge label="Unlocked" tone="success" icon={CheckCircle2} className="shrink-0" />
        ) : (
          <Badge label="Locked" tone="neutral" icon={Lock} className="shrink-0" />
        )}
      </div>

      <div className="flex flex-col gap-1">
        <Typography
          variant="h6"
          as="h3"
          className={isUnlocked ? "text-heading font-semibold" : "text-heading/60 font-semibold"}
        >
          {achievement.name}
        </Typography>

        {achievement.description ? (
          <Typography
            variant="bodySm"
            className={isUnlocked ? "text-heading/70 leading-relaxed" : "text-heading/45 leading-relaxed"}
          >
            {achievement.description}
          </Typography>
        ) : null}
      </div>

      {showsProgress && (
        <AchievementProgressBar current={achievement.progress.current} target={achievement.progress.target} />
      )}

      {isUnlocked ? (
        <div className="mt-auto flex items-center gap-1.5 border-t border-heading/5 pt-3 text-xs text-heading/40">
          <CalendarCheck2 size={13} aria-hidden="true" />
          Earned {formatDate(achievement.earnedDate)}
        </div>
      ) : !showsProgress ? (
        <div className="mt-auto flex items-center gap-1.5 border-t border-heading/5 pt-3 text-xs text-heading/40">
          <Target size={13} aria-hidden="true" />
          Complete this to unlock
        </div>
      ) : null}
    </motion.div>
  );
}
