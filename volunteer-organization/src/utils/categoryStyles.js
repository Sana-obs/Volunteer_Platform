
import {
  HeartPulse,
  Dumbbell,
  Leaf,
  Cpu,
} from "lucide-react";
import EducationIcon from "../components/icons/EducationIcon";
import SocialIcon from "../components/icons/SocialIcon";
import HealthIllustration from "../components/icons/categories/HealthIllustration";
import EducationIllustration from "../components/icons/categories/EducationIllustration";
import SocialIllustration from "../components/icons/categories/SocialIllustration";
import SportIllustration from "../components/icons/categories/SportIllustration";
import EnvironmentIllustration from "../components/icons/categories/EnvironmentIllustration";
import TechnicalIllustration from "../components/icons/categories/TechnicalIllustration";

export const CATEGORY_ICONS = {
  Health: HeartPulse,
  Education: EducationIcon,
  Social: SocialIcon,
  Sports: Dumbbell,
  Environment: Leaf,
  Technical: Cpu,
};


export const CATEGORY_ILLUSTRATIONS = {
  Health: HealthIllustration,
  Education: EducationIllustration,
  Social: SocialIllustration,
  Sports: SportIllustration,
  Environment: EnvironmentIllustration,
  Technical: TechnicalIllustration,
};

const CATEGORY_COLORS_BASE = {
  Health: "text-red-600 bg-red-100 border-red-200",
  Education: "text-blue-600 bg-blue-100 border-blue-200",
  Social: "text-purple-600 bg-purple-100 border-purple-200",
  Sports: "text-orange-600 bg-orange-100 border-orange-200",
  Environment: "text-green-600 bg-green-100 border-green-200",
  Technical: "text-gray-700 bg-gray-100 border-gray-200",
};


const CATEGORY_COLORS_DARK_BASE = {
  Health: "text-red-400 bg-red-500/10 border-red-500/25",
  Education: "text-blue-400 bg-blue-500/10 border-blue-500/25",
  Social: "text-purple-400 bg-purple-500/10 border-purple-500/25",
  Sports: "text-orange-400 bg-orange-500/10 border-orange-500/25",
  Environment: "text-green-400 bg-green-500/10 border-green-500/25",
  Technical: "text-gray-300 bg-gray-400/10 border-gray-400/25",
};

const CATEGORY_SELECTED_COLORS_BASE = {
  Health: "bg-red-600 text-white border-red-600",
  Education: "bg-blue-600 text-white border-blue-600",
  Social: "bg-purple-600 text-white border-purple-600",
  Sports: "bg-orange-600 text-white border-orange-600",
  Environment: "bg-green-600 text-white border-green-600",
  Technical: "bg-gray-700 text-white border-gray-700",
};

const CATEGORY_DOTS_BASE = {
  Health: "bg-red-500",
  Education: "bg-blue-500",
  Social: "bg-purple-500",
  Sports: "bg-orange-500",
  Environment: "bg-green-500",
  Technical: "bg-gray-500",
};


const EXTRA_PALETTE = [
  { chip: "text-teal-600 bg-teal-100 border-teal-200", chipDark: "text-teal-400 bg-teal-500/10 border-teal-500/25", selected: "bg-teal-600 text-white border-teal-600", dot: "bg-teal-500" },
  { chip: "text-pink-600 bg-pink-100 border-pink-200", chipDark: "text-pink-400 bg-pink-500/10 border-pink-500/25", selected: "bg-pink-600 text-white border-pink-600", dot: "bg-pink-500" },
  { chip: "text-amber-600 bg-amber-100 border-amber-200", chipDark: "text-amber-400 bg-amber-500/10 border-amber-500/25", selected: "bg-amber-600 text-white border-amber-600", dot: "bg-amber-500" },
  { chip: "text-indigo-600 bg-indigo-100 border-indigo-200", chipDark: "text-indigo-400 bg-indigo-500/10 border-indigo-500/25", selected: "bg-indigo-600 text-white border-indigo-600", dot: "bg-indigo-500" },
  { chip: "text-cyan-600 bg-cyan-100 border-cyan-200", chipDark: "text-cyan-400 bg-cyan-500/10 border-cyan-500/25", selected: "bg-cyan-600 text-white border-cyan-600", dot: "bg-cyan-500" },
  { chip: "text-rose-600 bg-rose-100 border-rose-200", chipDark: "text-rose-400 bg-rose-500/10 border-rose-500/25", selected: "bg-rose-600 text-white border-rose-600", dot: "bg-rose-500" },
  { chip: "text-lime-700 bg-lime-100 border-lime-200", chipDark: "text-lime-400 bg-lime-500/10 border-lime-500/25", selected: "bg-lime-700 text-white border-lime-700", dot: "bg-lime-600" },
  { chip: "text-sky-600 bg-sky-100 border-sky-200", chipDark: "text-sky-400 bg-sky-500/10 border-sky-500/25", selected: "bg-sky-600 text-white border-sky-600", dot: "bg-sky-500" },
];

function hashCategoryName(name) {
  let hash = 0;
  for (let index = 0; index < name.length; index += 1) {
    hash = (hash * 31 + name.charCodeAt(index)) >>> 0;
  }
  return hash % EXTRA_PALETTE.length;
}

/**
 * @param {string} categoryName
 */
export function getCategoryTheme(categoryName) {
  const name = String(categoryName || "");
  return CATEGORY_COLORS_BASE[name]
    ? {
        chip: CATEGORY_COLORS_BASE[name],
        chipDark: CATEGORY_COLORS_DARK_BASE[name],
        selected: CATEGORY_SELECTED_COLORS_BASE[name],
        dot: CATEGORY_DOTS_BASE[name],
      }
    : EXTRA_PALETTE[hashCategoryName(name)];
}

export const CATEGORY_COLORS = new Proxy(CATEGORY_COLORS_BASE, {
  get(target, prop) {
    if (typeof prop !== "string") return target[prop];
    return target[prop] || getCategoryTheme(prop).chip;
  },
});

export const CATEGORY_SELECTED_COLORS = new Proxy(CATEGORY_SELECTED_COLORS_BASE, {
  get(target, prop) {
    if (typeof prop !== "string") return target[prop];
    return target[prop] || getCategoryTheme(prop).selected;
  },
});

const CATEGORY_LABELS = {
  Social: "Community",
};

export function getCategoryLabel(categoryName) {
  const name = String(categoryName || "");
  return CATEGORY_LABELS[name] || name;
}

export function getSkillCategoryName(skill) {
  return skill?.category?.name || "Other";
}

export function getUniqueCategoryNamesForSkills(skillIds, availableSkills) {
  const seen = new Set();
  const names = [];

  (skillIds || []).forEach((id) => {
    const skill = availableSkills.find((s) => s.id === id);
    if (!skill) return;

    const category = getSkillCategoryName(skill);
    if (!seen.has(category)) {
      seen.add(category);
      names.push(category);
    }
  });

  return names;
}