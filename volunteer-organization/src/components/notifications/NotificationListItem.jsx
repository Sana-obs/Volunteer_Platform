
import { Link } from "react-router-dom";
import { X } from "lucide-react";
import {
  NOTIFICATION_TYPE_ICONS,
  NOTIFICATION_TYPE_ICON_COLORS,
  DEFAULT_NOTIFICATION_ICON,
} from "../../constants/notificationTypes";

export default function NotificationListItem({
  item,
  onNavigate,
  onDismiss,
  showDismiss = false,
  truncateDescription = true,
}) {
  const Icon = NOTIFICATION_TYPE_ICONS[item.type] || DEFAULT_NOTIFICATION_ICON;
  const iconColor = NOTIFICATION_TYPE_ICON_COLORS[item.type] || "text-primary";

  const handleNavigate = () => {
    queueMicrotask(() => {
      item.onDismiss?.();
      onNavigate?.();
    });
  };

  return (
    <div className="group flex items-start gap-2 border-b border-heading/5 px-4 py-3 transition last:border-b-0 hover:bg-heading/5">
      <Link to={item.href} onClick={handleNavigate} className="flex min-w-0 flex-1 items-start gap-3">
        <span
          className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-heading/5 ${iconColor}`}
        >
          <Icon size={16} aria-hidden="true" />
        </span>
        <span className="min-w-0">
          <p className="text-sm font-medium text-heading">{item.title}</p>
          <p className={`text-xs text-heading/50 ${truncateDescription ? "truncate" : ""}`}>
            {item.description}
          </p>
        </span>
      </Link>

      {showDismiss && (
        <button
          type="button"
          onClick={() => onDismiss?.(item)}
          aria-label="Mark as read"
          className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-heading/30 opacity-0 transition hover:bg-heading/10 hover:text-heading/70 focus:outline-none focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-primary/40 group-hover:opacity-100"
        >
          <X size={14} aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
