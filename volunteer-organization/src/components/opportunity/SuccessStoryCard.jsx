
import { CheckCircle2, Users, Calendar } from "lucide-react";
import Card from "../ui/Card";
import Chip from "../ui/Chip";
import {
  CATEGORY_COLORS,
  CATEGORY_ICONS,
  CATEGORY_ILLUSTRATIONS,
} from "../../utils/categoryStyles";

function formatDate(dateString) {
  if (!dateString) return "";

  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });
}

export default function SuccessStoryCard({ opportunity }) {
  const categoryName = opportunity.category?.name;

  const categoryStyle =
    CATEGORY_COLORS[categoryName] || CATEGORY_COLORS.Social;

  const CategoryIcon =
    CATEGORY_ICONS[categoryName] || Users;

  const CategoryIllustration =
    CATEGORY_ILLUSTRATIONS[categoryName];

  const imageFallback = CategoryIllustration ? (
    <div className="flex aspect-video w-full items-center justify-center overflow-hidden bg-canvas">
      <CategoryIllustration
        className="h-full w-full object-contain p-2"
        aria-hidden="true"
      />
    </div>
  ) : (
    <div
      className={`flex aspect-video w-full items-center justify-center ${categoryStyle}`}
    >
      <CategoryIcon
        className="h-10 w-10"
        aria-hidden="true"
      />
    </div>
  );

  return (
    <Card
      imageSrc={opportunity.image}
      imageAlt={opportunity.title}
      imageFallback={imageFallback}
      title={opportunity.title}
    >
      <Chip
        color="green"
        className="mb-4 inline-flex w-fit items-center gap-1"
      >
        <CheckCircle2 size={12} aria-hidden="true" />
        Completed
      </Chip>

      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-body">
        <span className="flex items-center gap-1.5">
          <Users
            size={16}
            className="text-primary"
            aria-hidden="true"
          />
          {opportunity.currentVolunteers} volunteers participated
        </span>

        <span className="flex items-center gap-1.5">
          <Calendar
            size={16}
            className="text-primary"
            aria-hidden="true"
          />
          {formatDate(opportunity.endDate)}
        </span>
      </div>
    </Card>
  );
}