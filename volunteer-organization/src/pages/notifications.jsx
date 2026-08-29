import { useMemo, useRef, useState } from "react";
import { Bell, CheckCheck, PartyPopper } from "lucide-react";

import Typography from "../components/ui/Typography";
import Button from "../components/ui/Button";
import TabsFilter from "../components/ui/TabsFilter";
import EmptyState from "../components/common/EmptyState";
import ShowMoreButton from "../components/common/ShowMoreButton";
import NotificationListItem from "../components/notifications/NotificationListItem";
import Toast from "../components/common/Toast";
import AuthAlert from "../components/auth/AuthAlert";

import { useToast } from "../hooks/useToast";
import useRecentUpdates from "../hooks/useRecentUpdates";
import { useShowMore } from "../hooks/useShowMore";

import { CARD_SURFACE } from "../utils/surfaceStyles";

import {
  NOTIFICATION_TYPE_ICONS,
  NOTIFICATION_TYPE_LABELS,
  DEFAULT_NOTIFICATION_ICON,
} from "../constants/notificationTypes";

const MARK_ALL_UNDO_WINDOW_MS = 5000;

export default function Notifications() {
  const { items, hasError } = useRecentUpdates();

  const [activeTab, setActiveTab] = useState("all");

  // Keep dismissed notifications hidden until the next data refresh.
  const [dismissedIds, setDismissedIds] = useState(() => new Set());

  const { toast, showToast, closeToast } = useToast();

  // Tracks the pending Mark All operation so it can be committed or undone.
  const pendingMarkAllRef = useRef(null);

  const visibleAllItems = useMemo(
    () => items.filter((item) => !dismissedIds.has(item.id)),
    [items, dismissedIds],
  );

  const tabs = useMemo(() => {
    const countsByType = new Map();

    visibleAllItems.forEach((item) => {
      countsByType.set(
        item.type,
        (countsByType.get(item.type) || 0) + 1,
      );
    });

    const typeTabs = [...countsByType.entries()].map(([type, count]) => ({
      id: type,
      label: NOTIFICATION_TYPE_LABELS[type] || "Updates",
      icon:
        NOTIFICATION_TYPE_ICONS[type] ||
        DEFAULT_NOTIFICATION_ICON,
      count,
    }));

    return [
      {
        id: "all",
        label: "All",
        icon: Bell,
        count: visibleAllItems.length,
      },
      ...typeTabs,
    ];
  }, [visibleAllItems]);

  if (
    activeTab !== "all" &&
    !tabs.some((tab) => tab.id === activeTab)
  ) {
    setActiveTab("all");
  }

  const filteredItems = useMemo(
    () =>
      activeTab === "all"
        ? visibleAllItems
        : visibleAllItems.filter(
            (item) => item.type === activeTab,
          ),
    [visibleAllItems, activeTab],
  );

  const {
    visibleItems,
    hasMore,
    remainingCount,
    showMore,
  } = useShowMore(filteredItems);

  const handleDismiss = (item) => {
    // Hide immediately while the read state is persisted.
    setDismissedIds((prev) => {
      const next = new Set(prev);
      next.add(item.id);
      return next;
    });

    item.onDismiss?.();
  };

  const commitPendingMarkAll = () => {
    const pending = pendingMarkAllRef.current;

    if (!pending) {
      return;
    }

    clearTimeout(pending.timeoutId);

    pending.items.forEach((item) => {
      item.onDismiss?.();
    });

    pendingMarkAllRef.current = null;
  };

  const handleMarkAllRead = () => {
    // Finish the previous operation before starting a new one.
    commitPendingMarkAll();

    const itemsToMark = visibleAllItems;

    if (itemsToMark.length === 0) {
      return;
    }

    setDismissedIds((prev) => {
      const next = new Set(prev);

      itemsToMark.forEach((item) => {
        next.add(item.id);
      });

      return next;
    });

    const timeoutId = setTimeout(() => {
      itemsToMark.forEach((item) => {
        item.onDismiss?.();
      });

      pendingMarkAllRef.current = null;
    }, MARK_ALL_UNDO_WINDOW_MS);

    pendingMarkAllRef.current = {
      timeoutId,
      items: itemsToMark,
    };

    showToast(
      `Marked ${itemsToMark.length} notification${
        itemsToMark.length === 1 ? "" : "s"
      } as read`,
      "success",
      {
        actionLabel: "Undo",

        onAction: () => {
          const pending = pendingMarkAllRef.current;

          if (!pending) {
            return;
          }

          clearTimeout(pending.timeoutId);
          pendingMarkAllRef.current = null;

          // Restore only notifications affected by this operation.
          setDismissedIds((prev) => {
            const next = new Set(prev);

            pending.items.forEach((item) => {
              next.delete(item.id);
            });

            return next;
          });
        },
      },
    );
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <Typography
            variant="sectionTitle"
            className="mb-2"
          >
            Notifications
          </Typography>

          <Typography
            variant="body"
            className="text-body"
          >
            Everything that needs your attention, in one place.
          </Typography>
        </div>

        {visibleAllItems.length > 0 && (
          <Button
            variant="ghost"
            size="small"
            onClick={handleMarkAllRead}
            className="flex items-center gap-2"
          >
            <CheckCheck
              size={16}
              aria-hidden="true"
            />
            Mark all as read
          </Button>
        )}
      </div>

      {hasError && (
        <div className="mb-4">
          <AuthAlert variant="error">
            Couldn't refresh notifications. Retrying automatically.
          </AuthAlert>
        </div>
      )}

      {visibleAllItems.length === 0 ? (
        <EmptyState
          icon={PartyPopper}
          title="You're all caught up"
          description="New updates about your activity will show up here."
        />
      ) : (
        <div className="flex flex-col items-start gap-8 md:flex-row">
          <div className="w-full md:w-56 md:shrink-0">
            <TabsFilter
              tabs={tabs}
              activeTab={activeTab}
              onTabChange={setActiveTab}
              ariaLabel="Notification type filter"
            />
          </div>

          <div className="flex w-full min-w-0 flex-1 flex-col gap-y-4 md:max-w-4xl">
            <div className={`${CARD_SURFACE} overflow-hidden`}>
              {visibleItems.map((item) => (
                <NotificationListItem
                  key={item.id}
                  item={item}
                  onDismiss={handleDismiss}
                  showDismiss
                  truncateDescription={false}
                />
              ))}
            </div>

            {hasMore && (
              <ShowMoreButton
                remainingCount={remainingCount}
                onClick={showMore}
              />
            )}
          </div>
        </div>
      )}

      <Toast
        message={toast.message}
        variant={toast.variant}
        duration={MARK_ALL_UNDO_WINDOW_MS}
        onClose={closeToast}
        actionLabel={toast.actionLabel}
        onAction={toast.onAction}
      />
    </div>
  );
}
