export const ORGANIZATION_STATUS = {
  PENDING: "pending",
  VERIFIED: "verified",
  REJECTED: "rejected",
  SUSPENDED: "suspended",
};

export const ORGANIZATION_STATUS_META = {
  [ORGANIZATION_STATUS.PENDING]: {
    label: "Pending Review",
    message: "Your organization is awaiting verification by our team. This may take a few days.",
    badgeClassName: "bg-amber-100 text-amber-800",
    bannerClassName: "bg-amber-50 border-amber-200 text-amber-800",
  },

  [ORGANIZATION_STATUS.VERIFIED]: {
    label: "Verified",
    message: "Your organization has been verified and can post volunteer opportunities.",
    badgeClassName: "bg-success/10 text-success",
    bannerClassName: "bg-success/5 border-success/20 text-success",
  },

  [ORGANIZATION_STATUS.REJECTED]: {
    label: "Rejected",
    message: "Your verification request was rejected. Please review the reason below and update your information.",
    badgeClassName: "bg-danger/10 text-danger",
    bannerClassName: "bg-danger/5 border-danger/20 text-danger",
  },

  [ORGANIZATION_STATUS.SUSPENDED]: {
    label: "Suspended",
    message: "Your organization account has been suspended by the platform administrators.",
    badgeClassName: "bg-gray-200 text-gray-700",
    bannerClassName: "bg-gray-50 border-gray-200 text-gray-700",
  },
};

// Falls back to Pending when the status is missing or unknown.
export const getOrganizationStatusMeta = (status) =>
  ORGANIZATION_STATUS_META[status] ??
  ORGANIZATION_STATUS_META[ORGANIZATION_STATUS.PENDING];

export default ORGANIZATION_STATUS;
