
import { useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";
import {
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { useAuth } from "./useAuth";
import { ACCOUNT_TYPES } from "../constants/auth/accountTypes";
import { fetchRecentNotifications } from "../services/notifications";
import { getOrganizationId } from "../utils/auth/getOrganizationId";

const POLL_INTERVAL_MS = 5000;

// Stable reference for the "no data yet" case so consumers that compare
// item identity across renders (e.g. useShowMore) don't see a new array
// on every render.
const EMPTY_ITEMS = [];

export default function useRecentUpdates() {
  const { user, isAuthenticated, accountType } = useAuth();
  const location = useLocation();
  const queryClient = useQueryClient();

  const organizationId = getOrganizationId(user);

  const isNotifiable =
    isAuthenticated &&
    (
      accountType === ACCOUNT_TYPES.VOLUNTEER ||
      (
        accountType === ACCOUNT_TYPES.ORGANIZATION &&
        Boolean(organizationId)
      ) ||
      accountType === ACCOUNT_TYPES.ADMIN
    );

  // queryKey must be built only from stable primitives. React Query hashes
  // it, so a fresh array literal with the same contents is treated as the
  // same query — but memoizing keeps the reference stable for the
  // setQueryData / invalidateQueries calls in the onDismiss closures below.
  const queryKey = useMemo(
    () => ["recentNotifications", accountType, organizationId ?? null],
    [accountType, organizationId],
  );

  const {
    data: items = EMPTY_ITEMS,
    isError,
    refetch,
  } = useQuery({
    queryKey,
    queryFn: () =>
      fetchRecentNotifications({
        accountType,
        organizationId,
      }),

    enabled: isNotifiable,

    refetchInterval: POLL_INTERVAL_MS,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: true,
    staleTime: 0,
  });

  // Also re-check on route changes.
  useEffect(() => {
    if (!isNotifiable) return;

    refetch();
  }, [location.pathname, isNotifiable, refetch]);

  // Wrap each item's onDismiss to optimistically update the cache, then
  // revalidate from the source. Memoized so the returned array (and the
  // wrapper objects inside it) keep a stable identity between renders and
  // only change when the underlying query data changes. Without this, a
  // fresh array of freshly-built objects is produced on every render, which
  // sends any consumer that compares item identity across renders
  // (useShowMore in notifications.jsx) into an infinite setState-in-render
  // loop → "Too many re-renders".
  const syncedItems = useMemo(
    () =>
      items.map((item) => {
        if (!item.onDismiss) {
          return item;
        }

        return {
          ...item,
          onDismiss: async (...args) => {
            const result = await item.onDismiss(...args);

            queryClient.setQueryData(queryKey, (currentItems = []) =>
              currentItems.filter(
                (currentItem) => currentItem.id !== item.id,
              ),
            );

            queryClient.invalidateQueries({
              queryKey,
              refetchType: "active",
            });

            return result;
          },
        };
      }),
    [items, queryClient, queryKey],
  );

  return {
    items: isNotifiable ? syncedItems : EMPTY_ITEMS,
    hasUnseen: isNotifiable && syncedItems.length > 0,
    hasError: isNotifiable && isError,
  };
}

