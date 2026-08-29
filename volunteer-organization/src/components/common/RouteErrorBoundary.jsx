// Data Router errorElement on the root route. Separate from ErrorBoundary
// because a componentDidCatch class can't catch errors thrown under
// RouterProvider; React Router needs useRouteError() here.

import { Link, useRouteError } from "react-router-dom";
import { AlertTriangle } from "lucide-react";
import Typography from "../ui/Typography";
import Button from "../ui/Button";
import { ROUTES } from "../../constants/paths";

export default function RouteErrorBoundary() {
  const error = useRouteError();

  console.error("Unhandled route error:", error);

  const handleReload = () => {
    window.location.reload();
  };

  return (
    <div className="mx-auto flex min-h-screen max-w-2xl flex-col items-center justify-center gap-6 px-4 text-center sm:px-6">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-danger/10">
        <AlertTriangle size={30} className="text-danger" aria-hidden="true" />
      </div>

      <Typography variant="overline" color="danger">
        Something went wrong
      </Typography>

      <Typography variant="h1">This page hit an unexpected error</Typography>

      <Typography variant="lead" className="max-w-md text-body">
        Something went wrong. Please try again or return home.
      </Typography>

      <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
        <Button variant="primary" size="large" onClick={handleReload}>
          Reload page
        </Button>
        <Button as={Link} to={ROUTES.HOME} variant="ghost" size="large">
          Back to Home
        </Button>
      </div>
    </div>
  );
}
