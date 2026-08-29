import { Link } from "react-router-dom";
import { ROUTES, AUTH_QUERY_KEYS } from "../../constants/paths";
import { ACCOUNT_TYPES } from "../../constants/auth/accountTypes";

export default function AccountSwitch({ accountType }) {
  const isVolunteer = accountType === ACCOUNT_TYPES.VOLUNTEER;

  return (
    <nav aria-label="Account type" className="flex bg-heading/5 rounded-lg p-1 mb-6 border border-heading/10">
      <Link
        aria-current={isVolunteer ? "page" : undefined}
        to={`${ROUTES.REGISTER}?${AUTH_QUERY_KEYS.TYPE}=${ACCOUNT_TYPES.VOLUNTEER}`}
        className={`flex-1 text-center py-2.5 rounded-md text-sm transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-1 ${
          isVolunteer
            ? "bg-primary text-white font-semibold"
            : "font-medium text-body hover:bg-white/70 hover:text-heading"
        }`}
      >
        Volunteer
      </Link>

      <Link
        aria-current={!isVolunteer ? "page" : undefined}
        to={`${ROUTES.REGISTER}?${AUTH_QUERY_KEYS.TYPE}=${ACCOUNT_TYPES.ORGANIZATION}`}
        className={`flex-1 text-center py-2.5 rounded-md text-sm transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-1 ${
          !isVolunteer
            ? "bg-primary text-white font-semibold"
            : "font-medium text-body hover:bg-white/70 hover:text-heading"
        }`}
      >
        Organization
      </Link>
    </nav>
  );
}