// Navbar notification bell. Receives items from the parent; no fetching here.

import { Link } from "react-router-dom";
import { Bell, PartyPopper, ArrowRight } from "lucide-react";

import useClickOutside from "../../hooks/useClickOutside";
import NotificationListItem from "../notifications/NotificationListItem";
import { ROUTES } from "../../constants/paths";

export default function NotificationBell({
  items,
  isOpen,
  onToggle,
  onClose,
  triggerClassName,
}) {
  const rootRef = useClickOutside(isOpen, onClose);
  const count = items.length;

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={onToggle}
        aria-haspopup="true"
        aria-expanded={isOpen}
        aria-label={
          count > 0
            ? `${count} new updates`
            : "Notifications"
        }
        className={
          triggerClassName ||
          "relative flex h-10 w-10 items-center justify-center rounded-2xl border border-white/15 bg-white/10 text-white transition hover:border-white/25 hover:bg-white/15"
        }
      >
        <Bell
          className="h-4.5 w-4.5"
          aria-hidden="true"
        />

        {count > 0 && (
          <span
            className="absolute -right-1.5 -top-1.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full border-2 border-black bg-danger px-1 text-[11px] font-bold leading-[18px] text-white"
            aria-hidden="true"
          >
            {count > 9 ? "9+" : count}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          className="fixed inset-x-3 top-20 z-60 flex max-h-[75vh] flex-col overflow-hidden rounded-2xl border-2 border-heading/20 bg-field shadow-2xl ring-1 ring-black/5 sm:absolute sm:inset-x-auto sm:right-0 sm:top-auto sm:mt-2 sm:max-h-96 sm:w-80 sm:max-w-[90vw]"
        >
          <p className="shrink-0 border-b border-heading/10 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-heading/50">
            Notifications
          </p>

          <div className="min-h-0 flex-1 overflow-y-auto">
            {count === 0 ? (
              <div className="flex flex-col items-center gap-3 px-4 py-8 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <PartyPopper
                    size={20}
                    className="text-primary"
                    aria-hidden="true"
                  />
                </div>

                <p className="text-sm font-semibold text-heading">
                  You're all caught up.
                </p>
              </div>
            ) : (
              items.map((item) => (
                <NotificationListItem
                  key={item.id}
                  item={item}
                  onNavigate={onClose}
                />
              ))
            )}
          </div>

          <Link
            to={ROUTES.NOTIFICATIONS}
            onClick={onClose}
            className="flex shrink-0 items-center justify-center gap-1.5 border-t border-heading/10 px-4 py-3 text-xs font-semibold text-primary transition hover:bg-heading/5"
          >
            See all notifications
            <ArrowRight
              size={13}
              aria-hidden="true"
            />
          </Link>
        </div>
      )}
    </div>
  );
}