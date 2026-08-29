import { Link } from "react-router-dom";
import LogoIcon from "../ui/LogoIcon";
import Typography from "../ui/Typography";
import { PANEL_SURFACE } from "../../utils/surfaceStyles";
import { ROUTES } from "../../constants/paths";

export default function AuthShell({ title, subtitle, children, footer }) {
  return (
    <section className="relative min-h-screen bg-canvas px-4 py-10">
      <div className="relative mx-auto flex min-h-[80vh] w-full max-w-136 items-center justify-center">
        <div className={`animate-shell-in w-full ${PANEL_SURFACE} p-6 sm:p-8`}>
          <header className="mb-6 flex flex-col items-center">
            <Link
              to={ROUTES.HOME}
              className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white transition hover:opacity-90"
              aria-label="Back to home"
            >
              <LogoIcon className="h-6 w-6" />
            </Link>
            <Typography as="h1" variant="h3" align="center">
              {title}
            </Typography>
            {subtitle && (
              <Typography variant="bodySm" align="center" className="mt-2 text-heading/70">
                {subtitle}
              </Typography>
            )}
          </header>

          {children}

          {footer ? (
            <footer className="mt-6 text-center text-sm text-body">
              {footer}
            </footer>
          ) : null}
        </div>
      </div>
    </section>
  );
}