import { Building2 } from "lucide-react";
import HomeSectionHeader from "./HomeSectionHeader";
import { ROUTES } from "../../constants/paths";
import {
  CARD_SURFACE,
  CARD_ELEVATION,
} from "../../utils/surfaceStyles";

const PARTNERS_DISPLAY_LIMIT = 8;

function getUniqueOrganizations(opportunities) {
  const seen = new Set();
  const organizations = [];

  opportunities.forEach((opportunity) => {
    const organization = opportunity.organization;

    if (organization?.id && !seen.has(organization.id)) {
      seen.add(organization.id);
      organizations.push(organization);
    }
  });

  return organizations;
}

export default function HomePartners({ opportunities }) {
  const allOrganizations = getUniqueOrganizations(opportunities);

  const organizations = allOrganizations.slice(
    0,
    PARTNERS_DISPLAY_LIMIT
  );

  const hasMore =
    allOrganizations.length > PARTNERS_DISPLAY_LIMIT;

  if (organizations.length === 0) return null;

  return (
    <section>
      <HomeSectionHeader
        title="Organizations Making an Impact"
        description="Organizations creating meaningful opportunities and making a difference."
        action={
          hasMore
            ? {
                label: "View All Organizations",
                to: ROUTES.ORGANIZATIONS,
              }
            : null
        }
      />

      <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4">
        {organizations.map((organization) => (
          <div
            key={organization.id}
            className={`
              ${CARD_SURFACE}
              ${CARD_ELEVATION}
              flex flex-col items-center gap-3
              p-4 text-center sm:p-5
              transition-transform duration-200
              hover:-translate-y-0.5
            `}
          >
            {organization.imageUrl ? (
              <img
                src={organization.imageUrl}
                alt={organization.name}
                className="h-14 w-14 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                <Building2
                  size={24}
                  className="text-primary"
                  aria-hidden="true"
                />
              </div>
            )}

            <span className="line-clamp-2 text-sm font-semibold leading-snug text-heading wrap-break-word">
              {organization.name}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
