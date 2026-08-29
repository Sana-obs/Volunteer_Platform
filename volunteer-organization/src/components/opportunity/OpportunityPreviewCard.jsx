
import { MapPin, Clock, Users, Eye } from "lucide-react";
import Card from "../ui/Card";
import Chip from "../ui/Chip";
import Button from "../ui/Button";
import { CATEGORY_COLORS, CATEGORY_ICONS, CATEGORY_ILLUSTRATIONS, getCategoryLabel } from "../../utils/categoryStyles";

export default function OpportunityPreviewCard({
  title,
  description,
  imagePreview,
  categoryName,
  location,
  minHours,
  maxHours,
  maxVolunteers,
}) {
  const categoryStyle = CATEGORY_COLORS[categoryName] || CATEGORY_COLORS.Social;
  const CategoryIcon = CATEGORY_ICONS[categoryName] || Users;

  const CategoryIllustration = CATEGORY_ILLUSTRATIONS[categoryName];

  const imageFallback = CategoryIllustration ? (
    <div className="flex w-full aspect-video items-center justify-center bg-canvas overflow-hidden">
      <CategoryIllustration className="w-full h-full object-contain p-2" />
    </div>
  ) : (
    <div className={`flex w-full aspect-video items-center justify-center ${categoryStyle}`}>
      <CategoryIcon className="h-10 w-10" aria-hidden="true" />
    </div>
  );

  const previewBadge = (
    <span className="inline-flex items-center gap-1 rounded-full bg-heading text-bg text-xs font-semibold px-3 py-1">
      <Eye size={12} aria-hidden="true" /> Preview
    </span>
  );

  return (
    <Card
      imageSrc={imagePreview}
      imageAlt={title || "Cover preview"}
      imageFallback={imageFallback}
      badge={previewBadge}
      title={title || "Cause title will appear here"}
      description={description || "Your description will appear here as you type."}
      aria-disabled="true"
    >
      <div className="flex flex-wrap items-center gap-3 mb-4 text-sm text-body">
        <span className="flex items-center gap-1">
          <MapPin size={16} className="text-primary" aria-hidden="true" />
          {location || "–"}
        </span>
        <span className="flex items-center gap-1">
          <Clock size={16} className="text-primary" aria-hidden="true" />
          {minHours || "–"}-{maxHours || "–"} hrs
        </span>
        <span className="flex items-center gap-1">
          <Users size={16} className="text-primary" aria-hidden="true" />
          {maxVolunteers || 0} spots
        </span>
      </div>

      {categoryName && (
        <Chip customStyle={categoryStyle} className="mb-4 inline-block w-fit">
          {getCategoryLabel(categoryName)}
        </Chip>
      )}

      {/* Disabled — preview only */}
      <Button
        variant="secondary"
        fullWidth
        disabled
        className="py-4 rounded-4xl text-[15px] font-bold uppercase tracking-wide"
      >
        View Details
      </Button>
    </Card>
  );
}