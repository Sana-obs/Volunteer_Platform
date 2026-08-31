import { useState } from "react";
import { Link } from "react-router-dom";
import { Users } from "lucide-react";
import Typography from "../ui/Typography";
import { ROUTES } from "../../constants/paths";
import { PANEL_SURFACE } from "../../utils/surfaceStyles";
import {
  CATEGORY_COLORS,
  CATEGORY_ICONS,
  CATEGORY_ILLUSTRATIONS,
} from "../../utils/categoryStyles";

// Same category-illustration fallback used by the regular opportunity cards,
// scaled down for this compact sidebar thumbnail.
function SimilarOpportunityThumbnail({ opportunity }) {
  // Resets nothing on its own; a new list item gets a fresh component instance.
  const [imageFailed, setImageFailed] = useState(false);

  const categoryName = opportunity.category?.name;
  const categoryStyle = CATEGORY_COLORS[categoryName] || CATEGORY_COLORS.Social;
  const CategoryIcon = CATEGORY_ICONS[categoryName] || Users;
  const CategoryIllustration = CATEGORY_ILLUSTRATIONS[categoryName];

  const showImage = opportunity.image && !imageFailed;

  return (
    <div className="w-14 h-14 shrink-0 rounded-xl bg-heading/10 overflow-hidden flex items-center justify-center">
      {showImage ? (
        <img
          src={opportunity.image}
          alt={opportunity.title}
          onError={() => setImageFailed(true)}
          className="w-full h-full object-cover"
        />
      ) : CategoryIllustration ? (
        <div className="flex w-full h-full items-center justify-center bg-canvas overflow-hidden">
          <CategoryIllustration className="w-full h-full object-contain p-1.5" />
        </div>
      ) : (
        <div className={`flex w-full h-full items-center justify-center ${categoryStyle}`}>
          <CategoryIcon size={18} aria-hidden="true" />
        </div>
      )}
    </div>
  );
}

export default function SimilarOpportunities({ opportunities }) {
  if (!opportunities || opportunities.length === 0) return null;

  return (
    <div className={`${PANEL_SURFACE} p-5`}>
      <Typography as="h3" variant="overline" weight="semibold" color="muted" className="mb-3">
        Similar Opportunities
      </Typography>

      <ul className="flex flex-col gap-3">
        {opportunities.map((item) => (
          <li key={item.id}>
            <Link
              to={`${ROUTES.OPPORTUNITIES}/${item.id}`}
              className="flex items-center gap-3 group rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            >
              <SimilarOpportunityThumbnail opportunity={item} />

              <div className="min-w-0">
                <p className="text-sm font-medium text-heading truncate group-hover:text-primary transition-colors">
                  {item.title}
                </p>
                <span className="text-xs text-primary">View Details</span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
