import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import Typography from "../ui/Typography";

/**
 * @param {{ label: string, to: string } | null} [props.action] - pass null to hide the link
 */
export default function HomeSectionHeader({ title, description, action = null, className = "" }) {
  return (
    <div className={`mb-8 ${className}`}>
      <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6">
        <Typography variant="h2">{title}</Typography>

        {action ? (
          <Link
            to={action.to}
            className="group inline-flex shrink-0 items-center gap-1 self-start text-sm font-medium text-primary transition-colors hover:text-primary/80 hover:underline sm:self-auto"
          >
            {action.label}
            <ArrowRight
              size={16}
              aria-hidden="true"
              className="transition-transform group-hover:translate-x-0.5"
            />
          </Link>
        ) : null}
      </div>

      {description ? (
        <Typography variant="body" className="mt-2 max-w-xl">
          {description}
        </Typography>
      ) : null}
    </div>
  );
}
