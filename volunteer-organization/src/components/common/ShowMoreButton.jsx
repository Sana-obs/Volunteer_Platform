// remainingCount is optional — server-paginated sources may lack an accurate
// count, so we fall back to a plain "Show more".

import { ChevronDown } from "lucide-react";
import Button from "../ui/Button";

export default function ShowMoreButton({ remainingCount, onClick }) {
  const hasAccurateCount = typeof remainingCount === "number";

  return (
    <div className="mt-6 flex justify-center">
      <Button variant="ghost" onClick={onClick} className="flex items-center gap-1.5">
        <ChevronDown size={16} aria-hidden="true" />
        {hasAccurateCount ? `Show ${remainingCount} more` : "Show more"}
      </Button>
    </div>
  );
}
