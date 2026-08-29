
import { useQuery } from "@tanstack/react-query";
import { fetchOrganizationDashboard } from "../../services/dashboard";
import { isMockMode } from "../../services/api/mockMode";
import { useCitiesQuery } from "./useCitiesQuery";
import { queryKeys } from "../../app/queryKeys";

/**
 * @param {string} organizationId
 */
export function useOrganizationDashboardQuery(organizationId) {
  const citiesQuery = useCitiesQuery();
  const governorates = citiesQuery.data ?? [];

  return useQuery({
    queryKey: queryKeys.organization.dashboard(organizationId),
    queryFn: () => fetchOrganizationDashboard(organizationId, governorates),
    enabled: isMockMode() || Boolean(organizationId),
  });
}
