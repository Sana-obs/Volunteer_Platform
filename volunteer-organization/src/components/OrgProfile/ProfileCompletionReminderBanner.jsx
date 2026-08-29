
import { useState } from "react";
import { Link } from "react-router-dom";
import { AlertTriangle, X } from "lucide-react";
import Button from "../ui/Button";
import { ROUTES } from "../../constants/paths";

export default function ProfileCompletionReminderBanner() {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div
      role="status"
      className="flex items-start gap-3 rounded-3xl border p-6 md:p-8 mb-8 bg-amber-50 border-amber-200 text-amber-800"
    >
      <AlertTriangle size={20} className="mt-0.5 shrink-0" />

      <div className="min-w-0 flex-1">
        <p className="font-semibold">Your organization profile is incomplete</p>
        <p className="text-sm mt-1">
          Your description or city is missing. This affects how your organization appears to
          volunteers. Complete your profile so it displays fully.
        </p>

        <Button
          as={Link}
          to={ROUTES.ORGANIZATION_PROFILE}
          variant="ghost"
          size="small"
          className="mt-4"
        >
          Complete Profile
        </Button>
      </div>

      <button
        type="button"
        onClick={() => setDismissed(true)}
        aria-label="Dismiss reminder"
        className="shrink-0 opacity-60 transition-opacity hover:opacity-100"
      >
        <X size={18} />
      </button>
    </div>
  );
}
