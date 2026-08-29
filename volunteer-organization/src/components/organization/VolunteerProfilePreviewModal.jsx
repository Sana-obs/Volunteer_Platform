import Modal from "../ui/Modal";
import SkillChipsPreview from "../common/SkillChipsPreview";
import Avatar from "../common/Avatar";
import ClickableAvatar from "../common/ClickableAvatar";
import Typography from "../ui/Typography";
import { MapPin, Phone, Mail, GraduationCap, Cake, Clock3, Trophy, CheckCircle2 } from "lucide-react";
import { calculateAge } from "../../utils/validators";
import { CARD_SURFACE } from "../../utils/surfaceStyles";

function StatBlock({ icon: Icon, value, label }) {
  return (
    <div className={`flex flex-col items-center text-center px-3 py-2.5 ${CARD_SURFACE}`}>
      <Icon size={16} className="text-primary mb-1" aria-hidden="true" />
      <p className="text-sm font-bold text-heading leading-none">{value}</p>
      <p className="text-[11px] text-heading/50 mt-1">{label}</p>
    </div>
  );
}

function buildDefaultStats(volunteer, unlockedAchievementsCount) {
  return [
    { icon: Clock3, value: volunteer.totalHoursVolunteered ?? 0, label: "Hours here" },
    { icon: Trophy, value: unlockedAchievementsCount, label: "Achievements" },
    { icon: CheckCircle2, value: volunteer.completedOpportunitiesCount ?? 0, label: "Completed here" },
  ];
}

const DEFAULT_STATS_NOTE =
  "Hours and completed opportunities are with your organization specifically. Achievements are earned across the whole platform.";

export default function VolunteerProfilePreviewModal({ open, onClose, volunteer, stats, statsNote }) {
  if (!volunteer) return null;

  const age = calculateAge(volunteer.dateOfBirth);
  const achievements = volunteer.achievements || [];
  const unlockedAchievements = achievements.filter((achievement) => achievement.unlocked);

  const resolvedStats = stats || buildDefaultStats(volunteer, unlockedAchievements.length);
  const resolvedStatsNote = statsNote !== undefined ? statsNote : DEFAULT_STATS_NOTE;

  return (
    <Modal open={open} onClose={onClose} title={volunteer.name || "Volunteer profile"} scrollBody>
      <div className="flex items-center gap-3 mb-5">
        <ClickableAvatar src={volunteer.photo} alt={volunteer.name}>
          <Avatar src={volunteer.photo} name={volunteer.name} size="lg" />
        </ClickableAvatar>
        {volunteer.city && (
          <span className="flex items-center gap-1 text-sm text-body">
            <MapPin size={13} className="text-primary shrink-0" aria-hidden="true" />
            {volunteer.city}
          </span>
        )}
      </div>

      <div className={`grid gap-2 mb-1 ${resolvedStats.length === 2 ? "grid-cols-2" : "grid-cols-3"}`}>
        {resolvedStats.map((stat) => (
          <StatBlock key={stat.label} icon={stat.icon} value={stat.value} label={stat.label} />
        ))}
      </div>
      {resolvedStatsNote && <p className="text-[11px] text-heading/40 mb-5">{resolvedStatsNote}</p>}

      {unlockedAchievements.length > 0 && (
        <div className="mb-5">
          <Typography as="p" variant="overline" weight="semibold" color="muted" className="mb-2">
            Achievements
          </Typography>
          <div className="flex flex-col gap-1.5">
            {unlockedAchievements.map((achievement) => (
              <span key={achievement.id} className="flex items-center gap-1.5 text-sm text-heading">
                <Trophy size={13} className="text-amber-500 shrink-0" aria-hidden="true" />
                {achievement.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {(volunteer.educationLevel || age || volunteer.gender) && (
        <div className="flex flex-wrap gap-x-5 gap-y-2 mb-5 text-sm text-body">
          {volunteer.educationLevel && (
            <span className="flex items-center gap-1.5">
              <GraduationCap size={14} className="text-primary shrink-0" aria-hidden="true" />
              {volunteer.educationLevel}
            </span>
          )}
          {age != null && (
            <span className="flex items-center gap-1.5">
              <Cake size={14} className="text-primary shrink-0" aria-hidden="true" />
              {age} years old
            </span>
          )}
          {volunteer.gender && (
            <span className="capitalize">{volunteer.gender}</span>
          )}
        </div>
      )}

      {(volunteer.phone || volunteer.email) && (
        <div className="flex flex-col gap-2 mb-5">
          {volunteer.phone && (
            <a
              href={`tel:${volunteer.phone}`}
              className="flex items-center gap-2 text-sm text-body hover:text-primary w-fit rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            >
              <Phone size={14} className="text-primary shrink-0" aria-hidden="true" />
              {volunteer.phone}
            </a>
          )}
          {volunteer.email && (
            <a
              href={`mailto:${volunteer.email}`}
              className="flex items-center gap-2 text-sm text-body hover:text-primary w-fit rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            >
              <Mail size={14} className="text-primary shrink-0" aria-hidden="true" />
              {volunteer.email}
            </a>
          )}
        </div>
      )}

      {volunteer.skills?.length > 0 ? (
        <div>
          <Typography as="p" variant="overline" weight="semibold" color="muted" className="mb-2">
            Skills
          </Typography>
          <SkillChipsPreview skills={volunteer.skills} max={10} />
        </div>
      ) : null}
    </Modal>
  );
}