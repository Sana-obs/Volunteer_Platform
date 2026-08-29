import { Link } from "react-router-dom";
import Typography from "../ui/Typography";
import Button from "../ui/Button";
import { PANEL_SURFACE } from "../../utils/surfaceStyles";

export default function HowToJoinColumn({
  title,
  description,
  steps = [],
  ctaLabel,
  ctaHref,
  buttonVariant = "primary",
}) {
  return (
    <div className={`${PANEL_SURFACE} flex h-full flex-col p-6 sm:p-8`}>
      <Typography variant="h3" className="mb-2">
        {title}
      </Typography>

      <Typography variant="body" className="mb-6 text-body">
        {description}
      </Typography>

      <ul className="mb-8 flex flex-col gap-4">
        {steps.map((step, index) => {
          const StepIcon = step.icon;

          return (
            <li
              key={step.text}
              className="flex items-start gap-3"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                {index + 1}
              </span>

              <span className="flex items-center gap-2 pt-1.5 text-sm text-heading/80">
                {StepIcon ? (
                  <StepIcon
                    size={16}
                    className="shrink-0 text-primary"
                    aria-hidden="true"
                  />
                ) : null}

                {step.text}
              </span>
            </li>
          );
        })}
      </ul>

      <div className="mt-auto">
        <Button
          as={Link}
          to={ctaHref}
          variant={buttonVariant}
          fullWidth
        >
          {ctaLabel}
        </Button>
      </div>
    </div>
  );
}
