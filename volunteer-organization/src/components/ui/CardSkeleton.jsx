// Loading placeholder matching ui/Card dimensions to avoid layout shift.

import Skeleton from "./Skeleton";
import { CARD_SURFACE } from "../../utils/surfaceStyles";

export default function CardSkeleton() {
  return (
    <div className={`${CARD_SURFACE} w-full overflow-hidden flex flex-col`}>
      <Skeleton className="w-full aspect-video rounded-none" />

      <div className="px-6 py-6 flex flex-1 flex-col gap-3">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-10 w-full rounded-xl mt-auto" />
      </div>
    </div>
  );
}