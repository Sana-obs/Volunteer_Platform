// Skill chips with a "+X more" overflow toggle.

import { useState } from "react";
import Chip from "../ui/Chip";

export default function SkillChipsPreview({ skills = [], max = 4, color = "blue" }) {
  const [expanded, setExpanded] = useState(false);

  if (!skills.length) return null;

  const visibleSkills = expanded ? skills : skills.slice(0, max);
  const hiddenCount = skills.length - visibleSkills.length;

  return (
    <div className="flex flex-wrap gap-1.5">
      {visibleSkills.map((skill) => (
        <Chip key={skill} color={color} className="text-xs px-2.5 py-0.5">
          {skill}
        </Chip>
      ))}

      {hiddenCount > 0 && (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="inline-block px-2.5 py-0.5 rounded-full text-xs border border-heading/15 text-heading/60 hover:text-primary hover:border-primary/40 transition-colors"
        >
          +{hiddenCount} more
        </button>
      )}
    </div>
  );
}