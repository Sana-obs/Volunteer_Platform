// Expand/collapse toggle over the already-loaded completed opportunities — no extra fetch.

import { useRef } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import Button from "../ui/Button";
import SuccessStoryCard from "../opportunity/SuccessStoryCard";
import CardSkeleton from "../ui/CardSkeleton";
import HomeSectionHeader from "./HomeSectionHeader";
import { useShowMore } from "../../hooks/useShowMore";

// Collapsed count and "View More" step size.
const INITIAL_VISIBLE_COUNT = 6;

export default function HomeSuccessStories({ opportunities, loading, className = "" }) {
  const sectionRef = useRef(null);
  const { visibleItems, hasMore, showMore, showLess } = useShowMore(
    opportunities,
    INITIAL_VISIBLE_COUNT,
  );

  const isExpandable = opportunities.length > INITIAL_VISIBLE_COUNT;

  const handleToggle = () => {
    if (hasMore) {
      showMore();
      return;
    }
    // Collapse and scroll back to the section top.
    showLess();
    sectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <section ref={sectionRef} className={className}>
      <HomeSectionHeader
        title="Success Stories"
        description="Causes that reached their full team of volunteers and made an impact."
      />

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, index) => (
            <CardSkeleton key={index} />
          ))}
        </div>
      ) : visibleItems.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {visibleItems.map((opportunity) => (
              <SuccessStoryCard key={opportunity.id} opportunity={opportunity} />
            ))}
          </div>

          {isExpandable ? (
            <div className="mt-10 flex justify-center">
              <Button
                variant="ghost"
                size="medium"
                onClick={handleToggle}
                className="inline-flex items-center gap-2"
              >
                {hasMore ? "View More" : "View Less"}
                {hasMore ? (
                  <ChevronDown size={18} aria-hidden="true" />
                ) : (
                  <ChevronUp size={18} aria-hidden="true" />
                )}
              </Button>
            </div>
          ) : null}
        </>
      ) : null}
    </section>
  );
}
