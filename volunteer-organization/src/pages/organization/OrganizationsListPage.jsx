import { useMemo, useState } from "react";
import { Building2, SearchX, Loader2 } from "lucide-react";
import Typography from "../../components/ui/Typography";
import OrganizationCard from "../../components/organization/OrganizationCard";
import OrganizationSearchBar from "../../components/organization/OrganizationSearchBar";
import CardSkeleton from "../../components/ui/CardSkeleton";
import EmptyState from "../../components/common/EmptyState";
import ShowMoreButton from "../../components/common/ShowMoreButton";
import AuthAlert from "../../components/auth/AuthAlert";
import { useOrganizationsQuery } from "../../hooks/queries/useOrganizationsQuery";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";

export default function OrganizationsListPage() {
  const [search, setSearch] = useState("");

  // Debounce: 300ms
  const debouncedSearch = useDebouncedValue(search, 300);

  const organizationsQuery = useOrganizationsQuery({
    search: debouncedSearch,
  });

  // Flatten pages
  const organizations = useMemo(
    () => organizationsQuery.data?.pages.flatMap((page) => page.data) ?? [],
    [organizationsQuery.data],
  );

  // Last page meta
  const lastPageMeta = organizationsQuery.data?.pages.at(-1)?.meta;

  const isInitialLoading = organizationsQuery.isPending;

  // Exclude next-page loading
  const isRefetching =
    organizationsQuery.isFetching &&
    !organizationsQuery.isFetchingNextPage &&
    !isInitialLoading;

  const error = organizationsQuery.isError
    ? organizationsQuery.error?.message || "Failed to load organizations"
    : "";

  const resultsLabel = useMemo(() => {
    // Use total count
    const count =
      typeof lastPageMeta?.total === "number"
        ? lastPageMeta.total
        : organizations.length;

    return `${count} organization${count === 1 ? "" : "s"} found`;
  }, [organizations.length, lastPageMeta?.total]);

  // Remaining results
  const remainingCount =
    typeof lastPageMeta?.total === "number"
      ? Math.max(lastPageMeta.total - organizations.length, 0)
      : undefined;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Typography variant="sectionTitle" className="mb-2">
        Organizations
      </Typography>

      <Typography variant="body" className="mb-8 text-body">
        Discover verified organizations you can volunteer with.
      </Typography>

      <div className="mb-6">
        <OrganizationSearchBar value={search} onChange={setSearch} />
      </div>

      {!isInitialLoading ? (
        <div className="flex items-center gap-2 mb-4">
          <p className="text-sm text-heading/50 flex items-center gap-2">
            {resultsLabel}

            {isRefetching ? (
              <Loader2
                size={14}
                className="animate-spin text-heading/30"
                aria-hidden="true"
              />
            ) : null}
          </p>
        </div>
      ) : null}

      {isInitialLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <CardSkeleton key={index} />
          ))}
        </div>
      ) : error ? (
        <AuthAlert variant="error">{error}</AuthAlert>
      ) : organizations.length === 0 ? (
        <EmptyState
          icon={search ? SearchX : Building2}
          title={search ? "No organizations found" : "No organizations yet"}
          description={
            search
              ? "Try a different search term."
              : "Verified organizations will appear here once they join the platform."
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 transition-opacity">
          {organizations.map((organization) => (
            <OrganizationCard
              key={organization.id}
              organization={organization}
            />
          ))}
        </div>
      )}

      {/* Next page loading */}
      {!isInitialLoading &&
      !error &&
      organizationsQuery.hasNextPage ? (
        organizationsQuery.isFetchingNextPage ? (
          <div className="mt-6 flex justify-center">
            <Loader2
              size={16}
              className="animate-spin text-heading/30"
              aria-hidden="true"
            />
          </div>
        ) : (
          <ShowMoreButton
            remainingCount={remainingCount}
            onClick={() => organizationsQuery.fetchNextPage()}
          />
        )
      ) : null}
    </div>
  );
}