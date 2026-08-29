
import { useEffect } from "react";
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

  const queryKey = [
    "recentNotifications",
    accountType,
    organizationId ?? null,
  ];

  const {
    data: items = [],
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

  // Optimistically update the cache, then revalidate from the source.
  const syncedItems = items.map((item) => {
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
  });

  return {
    items: isNotifiable ? syncedItems : [],
    hasUnseen: isNotifiable && syncedItems.length > 0,
    hasError: isNotifiable && isError,
  };
}

