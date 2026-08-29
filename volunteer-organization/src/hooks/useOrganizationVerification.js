import { useOrganizationProfileQuery } from "./queries/useOrganizationProfileQuery";
import { ORGANIZATION_STATUS, getOrganizationStatusMeta } from "../constants/organizationStatus";
import { useAuth } from "./useAuth";
import { getOrganizationId } from "../utils/auth/getOrganizationId";

export function useOrganizationVerification() {
  const { user } = useAuth();
  const organizationId = getOrganizationId(user);
  const { data, isLoading, isError } = useOrganizationProfileQuery(organizationId);

  const status = data?.status ?? null;

  const rejectionReason = data?.rejectionReason ?? null;
  const hasLoadError = isError;

  const organization = data ?? null;

  return {
    status,
    rejectionReason,
    organization,
    loading: isLoading,
    hasLoadError,
    isVerified: status === ORGANIZATION_STATUS.VERIFIED,
    meta: getOrganizationStatusMeta(status),
  };
}